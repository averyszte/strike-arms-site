import type { EmailInquiry } from "../load-inquiry.ts";
import { button, layout, panel, paragraph, type RenderedEmail } from "./layout.ts";

// quoteSubject() in the site's lib/service-quote.ts. Change both together.
const QUOTE_PREFIX = "Quote request";

/** To Alan, for every contact form and service quote. Reply goes to the sender. */
export function ownerNewInquiryEmail(inquiry: EmailInquiry, adminUrl: string): RenderedEmail {
  const isQuote = inquiry.subject?.startsWith(QUOTE_PREFIX) ?? false;
  const kind = isQuote ? "Service quote" : "Contact form";
  const topic = inquiry.subject ?? `Message from ${inquiry.name}`;
  const contact = [inquiry.name, inquiry.email, inquiry.phone]
    .filter((part): part is string => Boolean(part));
  const messageLines = inquiry.message.split(/\r?\n/).filter((line) => line.trim() !== "");

  const html = layout({
    preheader: `${inquiry.name}: ${messageLines[0] ?? ""}`.slice(0, 140),
    eyebrow: kind,
    heading: topic,
    body:
      panel("From", contact) +
      panel("Message", messageLines) +
      (inquiry.sourcePage ? panel("Sent from", [inquiry.sourcePage]) : "") +
      button("Open in the admin", adminUrl) +
      paragraph("Reply to this email to answer them directly."),
  });

  return {
    subject: `${kind}: ${topic} (${inquiry.name})`,
    html,
    text: [
      `${kind} from ${contact.join(" / ")}`,
      inquiry.subject ?? "",
      inquiry.message,
      inquiry.sourcePage ? `Sent from: ${inquiry.sourcePage}` : "",
      `Admin: ${adminUrl}`,
      "Reply to this email to answer them directly.",
    ].filter(Boolean).join("\n\n"),
  };
}
