export const BUSINESS_DOCUMENT_COLORS = {
  coral: "#F24A3A",
  navy: "#0F2747",
  sage: "#A8C3B0",
  mint: "#BFE2D0",
  cream: "#FFF8EE",
  gold: "#D6B36A",
  border: "#EADFCF",
  muted: "#5B6F82",
  white: "#FFFFFF",
} as const;

export type BusinessDocumentColor = keyof typeof BUSINESS_DOCUMENT_COLORS;
