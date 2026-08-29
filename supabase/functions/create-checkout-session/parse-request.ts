/**
 * Boundary validation for the checkout request.
 *
 * Nothing here trusts the client beyond identity and intent: the body may say
 * which products and how many, who the customer is, and where to deliver. It
 * may not say what anything costs — prices are resolved from the database in
 * order-lines.ts.
 */

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Irish routing key + unique identifier, e.g. "K67 T9H9". */
const EIRCODE_PATTERN = /^[A-Z]\d{2}\s?[A-Z0-9]{4}$/i;

const MAX_LINES = 50;
const MAX_QUANTITY_PER_LINE = 20;

export type CheckoutLine = { productId: string; quantity: number };

export type ShippingAddress = {
  name: string;
  line1: string;
  line2: string | null;
  city: string;
  county: string | null;
  eircode: string;
};

export type CheckoutRequest = {
  attemptId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  ageConfirmed: boolean;
  wantsDelivery: boolean;
  shipping: ShippingAddress | null;
  lines: CheckoutLine[];
};

export class CheckoutRequestError extends Error {}

function fail(message: string): never {
  throw new CheckoutRequestError(message);
}

function readString(source: Record<string, unknown>, key: string): string {
  const value = source[key];
  if (typeof value !== "string" || value.trim() === "") fail(`${key} is required`);
  return (value as string).trim();
}

function readOptionalString(
  source: Record<string, unknown>,
  key: string,
): string | null {
  const value = source[key];
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") fail(`${key} must be text`);
  return value.trim();
}

function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    fail(`${label} must be an object`);
  }
  return value as Record<string, unknown>;
}

function parseLines(raw: unknown): CheckoutLine[] {
  if (!Array.isArray(raw) || raw.length === 0) fail("lines must be a non-empty array");
  if (raw.length > MAX_LINES) fail(`a basket may hold at most ${MAX_LINES} lines`);

  return raw.map((entry, index) => {
    const line = asRecord(entry, `lines[${index}]`);
    const productId = readString(line, "productId");
    if (!UUID_PATTERN.test(productId)) fail(`lines[${index}].productId is not an id`);

    const quantity = line.quantity;
    if (
      typeof quantity !== "number" || !Number.isInteger(quantity) ||
      quantity < 1 || quantity > MAX_QUANTITY_PER_LINE
    ) {
      fail(`lines[${index}].quantity must be a whole number from 1 to ${MAX_QUANTITY_PER_LINE}`);
    }

    return { productId, quantity };
  });
}

function parseShipping(raw: unknown): ShippingAddress {
  const address = asRecord(raw, "shipping");
  const eircode = readString(address, "eircode");
  if (!EIRCODE_PATTERN.test(eircode)) fail("shipping.eircode is not a valid Eircode");

  return {
    name: readString(address, "name"),
    line1: readString(address, "line1"),
    line2: readOptionalString(address, "line2"),
    city: readString(address, "city"),
    county: readOptionalString(address, "county"),
    eircode: eircode.toUpperCase(),
  };
}

/** Throws CheckoutRequestError with a message that is safe to show the user. */
export function parseCheckoutRequest(raw: unknown): CheckoutRequest {
  const body = asRecord(raw, "request body");

  const attemptId = readString(body, "attemptId");
  if (!UUID_PATTERN.test(attemptId)) fail("attemptId is not an id");

  const customerEmail = readString(body, "customerEmail");
  if (!EMAIL_PATTERN.test(customerEmail)) fail("customerEmail is not a valid address");

  // Shop policy is 18+ for card purchases. Checked again here rather than only
  // in the UI, because the UI can be bypassed.
  if (body.ageConfirmed !== true) fail("age confirmation is required to check out");

  const wantsDelivery = body.wantsDelivery === true;

  return {
    attemptId,
    customerName: readString(body, "customerName"),
    customerEmail: customerEmail.toLowerCase(),
    customerPhone: readOptionalString(body, "customerPhone"),
    ageConfirmed: true,
    wantsDelivery,
    shipping: wantsDelivery ? parseShipping(body.shipping) : null,
    lines: parseLines(body.lines),
  };
}
