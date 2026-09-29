import type { EmailProduct } from "../load-product.ts";
import { layout, paragraph, type RenderedEmail } from "./layout.ts";

/**
 * To Alan when a product falls to its low-stock threshold (031). The count
 * is read when the email is sent, so it may be lower than when it was queued.
 */
export function lowStockEmail(product: EmailProduct, adminUrl: string): RenderedEmail {
  const title = [product.brand, product.name].filter(Boolean).join(" ");
  const lines = [
    product.stockCount <= 0
      ? `${title} has sold out.`
      : `${title} is down to ${product.stockCount} in stock (your alert level is ${product.threshold}).`,
    `Restock it in the admin: ${adminUrl}`,
  ];
  return {
    subject: product.stockCount <= 0 ? `Sold out: ${title}` : `Low stock: ${title}`,
    html: layout(product.stockCount <= 0 ? "Sold out" : "Low stock", lines.map(paragraph).join("")),
    text: lines.join("\n\n"),
  };
}
