import type { DuplicateLeadCandidate } from "@/lib/api";
import type { PropertyLead } from "@/lib/types";

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase().replace(/\s+/g, " ");
const phoneDigits = (value: string) => value.replace(/\D/g, "");

export function findLeadDuplicates(leads: PropertyLead[], input: { fullName: string; phone: string; email: string }): DuplicateLeadCandidate[] {
  const name = normalize(input.fullName);
  const phone = phoneDigits(input.phone);
  const email = input.email.trim().toLowerCase();
  return leads.flatMap(lead => {
    const candidateName = normalize(lead.name);
    const exact = !!name && name === candidateName;
    const similar = !!name && !!candidateName && (name.includes(candidateName) || candidateName.includes(name));
    const phoneMatch = !!phone && phone === phoneDigits(lead.phone);
    const emailMatch = !!email && email === lead.email?.trim().toLowerCase();
    if (!similar && !phoneMatch && !emailMatch) return [];
    const dates = (lead.followUps ?? []).map(item => item.date).filter(date => Number.isFinite(Date.parse(date))).sort((a, b) => Date.parse(b) - Date.parse(a));
    return [{ id: lead.id, fullName: lead.name, phone: lead.phone, email: lead.email,
      status: lead.status, createdAt: lead.createdDate,
      followUpCount: lead.followUps?.length ?? 0, lastFollowUpAt: dates[0] ?? null,
      nameMatch: exact ? "exact" as const : "partial" as const, phoneMatch, emailMatch,
      strength: exact || phoneMatch || emailMatch ? "strong" as const : "possible" as const }];
  });
}
