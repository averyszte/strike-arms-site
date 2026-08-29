import { supabase } from '@/lib/supabase';
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

/** An error whose message came from the server and is safe to show. */
export class CheckoutError extends Error {}

type CheckoutResponse = { url?: string | null; orderId?: string; error?: string };

function buildBody(lines: CartLine[], details: CheckoutDetails, attemptId: string) {
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
  };
}

export async function createCheckoutSession(
  lines: CartLine[],
  details: CheckoutDetails,
  attemptId: string,
): Promise<CheckoutSession> {
  const { data, error } = await supabase.functions.invoke<CheckoutResponse>(
    'create-checkout-session',
    { body: buildBody(lines, details, attemptId) },
  );

  // A non-2xx response arrives as an error with the body attached, so the
  // server's own message is what the shopper reads when there is one.
  if (error) {
    const message = await readErrorMessage(error);
    throw new CheckoutError(message);
  }

  if (!data?.url || !data.orderId) {
    throw new CheckoutError('Checkout is temporarily unavailable. Please try again.');
  }

  return { url: data.url, orderId: data.orderId };
}

async function readErrorMessage(error: unknown): Promise<string> {
  const fallback = 'Checkout is temporarily unavailable. Please try again.';
  const context = (error as { context?: unknown })?.context;

  if (context instanceof Response) {
    try {
      const body: unknown = await context.json();
      const message = (body as { error?: unknown })?.error;
      if (typeof message === 'string' && message.length > 0) return message;
    } catch {
      return fallback;
    }
  }

  return fallback;
}
