/** RFC 6068-style mailto for artwork availability inquiries. */

export function buildArtworkInquiryMailto(params: {
  email: string;
  subject: string;
  body: string;
}): string {
  const email = params.email.trim();
  if (!email) return "#";
  return `mailto:${email}?subject=${encodeURIComponent(params.subject)}&body=${encodeURIComponent(params.body)}`;
}

export function artworkInquiryHref(
  email: string,
  subject: string,
  body: string
): string {
  return buildArtworkInquiryMailto({ email, subject, body });
}
