import {
  readFunctionError,
  replyMessage,
  type FunctionErrorReply,
} from '@/data/function-error-message';
import { CART_FULL_MESSAGE, isCartLimitError } from '@/lib/cart-limits';
import { supabase } from '@/data/supabase-client';
import type { CartLine, CheckoutDetails } from '@/types/cart';

/**
 * The only caller of the checkout Edge Function.
 *
 * The request carries product ids, quantities and the customer's details —
 * never a price. The function reads every price from the database, so the
 * amount charged cannot be influenced from the browser.
 */

export type CheckoutSession = {
  url: string;
  orderId: string;
};

/** The earlier order in this tab, which the server says has already been paid. */
export type AlreadyPaidOrder = {
  orderNumber: string | null;
  /** Both present only if the server sends them; then the success page can show the order. */
  orderId: string | null;
  sessionId: string | null;
};

/** An error whose message came from the server and is safe to show. */
export class CheckoutError extends Error {
  readonly alreadyPaid: AlreadyPaidOrder | null;

  constructor(message: string, alreadyPaid: AlreadyPaidOrder | null = null) {
    super(message);
    this.alreadyPaid = alreadyPaid;
  }
}

type CheckoutResponse = { url?: string | null; orderId?: string; error?: string };

const UNAVAILABLE = 'Checkout is temporarily unavailable. Please try again.';
const ALREADY_PAID =
  'Your earlier payment for this basket went through, so we have not taken another. ' +
  'Check your email for the order confirmation.';
const HTTP_CONFLICT = 409;

function stringField(body: Record<string, unknown>, key: string): string | null {
  const value = body[key];
  return typeof value === 'string' && value.length > 0 ? value : null;
}

/**
 * A 409 means the previous checkout in this tab was paid after all (M-003), so
 * a second payment was refused. Anything else carries the server's message.
 */
function toCheckoutError(reply: FunctionErrorReply): CheckoutError {
  if (reply.status === HTTP_CONFLICT) {
    return new CheckoutError(replyMessage(reply, ALREADY_PAID), {
      orderNumber: stringField(reply.body, 'orderNumber'),
      orderId: stringField(reply.body, 'orderId'),
      sessionId: stringField(reply.body, 'sessionId'),
    });
  }
  const message = replyMessage(reply, UNAVAILABLE);
  return new CheckoutError(isCartLimitError(message) ? CART_FULL_MESSAGE : message);
}

function buildBody(
  lines: CartLine[],
  details: CheckoutDetails,
  attemptId: string,
  turnstileToken: string | null,
) {
  const wantsDelivery = details.wantsDelivery && lines.some((line) => line.isShippable);

  return {
    attemptId,
    customerName: details.customerName.trim(),
    customerEmail: details.customerEmail.trim(),
    customerPhone: details.customerPhone.trim() || null,
    ageConfirmed: details.ageConfirmed,
    wantsDelivery,
    shipping: wantsDelivery
      ? {
          name: details.shippingName.trim() || details.customerName.trim(),
          line1: details.shippingLine1.trim(),
          line2: details.shippingLine2.trim() || null,
          city: details.shippingCity.trim(),
          county: details.shippingCounty.trim() || null,
          eircode: details.shippingEircode.trim(),
        }
      : null,
    lines: lines.map((line) => ({
      productId: line.productId,
      quantity: line.quantity,
    })),
    turnstileToken,
  };
}

export async function createCheckoutSession(
  lines: CartLine[],
  details: CheckoutDetails,
  attemptId: string,
  turnstileToken: string | null,
): Promise<CheckoutSession> {
  const { data, error } = await supabase.functions.invoke<CheckoutResponse>(
    'create-checkout-session',
    { body: buildBody(lines, details, attemptId, turnstileToken) },
  );

  // A non-2xx response arrives as an error with the body attached, so the
  // server's own message is what the shopper reads when there is one.
  if (error) throw toCheckoutError(await readFunctionError(error));
  if (!data?.url || !data.orderId) throw new CheckoutError(UNAVAILABLE);

  return { url: data.url, orderId: data.orderId };
}
