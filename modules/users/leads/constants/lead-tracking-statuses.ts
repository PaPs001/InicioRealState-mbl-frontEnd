export const LEAD_TRACKING_STATUSES = [
  "EN PERFILAMIENTO",
  "APARTADO",
  "EN SEGUIMIENTO",
  "LEAD NUEVO",
  "REASIGNADO",
  "CONTACTADO",
  "VENTA",
  "SIN RESPUESTA",
  "NO PUEDE COMPRAR",
  "COMPRO OTRO PROYECTO",
  "CANCELO",
  "SPAM",
  "RENTA",
] as const;

export type LeadTrackingStatus = (typeof LEAD_TRACKING_STATUSES)[number];

export function normalizeLeadStatus(status: string) {
  return status
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();
}

export function isLeadStatus(status: string, ...expected: string[]) {
  const normalized = normalizeLeadStatus(status);
  return expected.some((value) => normalizeLeadStatus(value) === normalized);
}

export function isClosedLeadStatus(status: string) {
  return isLeadStatus(
    status,
    "VENTA",
    "RENTA",
    "NO PUEDE COMPRAR",
    "COMPRO OTRO PROYECTO",
    "CANCELO",
    "SPAM",
    "cerrado",
    "descartado",
    "won",
    "lost",
    "duplicate",
    "duplicado",
    "disqualified",
    "lead_ganador",
    "lead_perdido",
  );
}
