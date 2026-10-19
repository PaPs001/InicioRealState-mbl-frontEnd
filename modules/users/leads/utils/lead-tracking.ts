import type { PropertyLead } from '@/lib/types'
import { leadTrackingStatusCards } from '../constants/lead-tracking-layout'
import { isLeadStatus } from '../constants/lead-tracking-statuses'
import { getLeadOrigin } from '../constants/lead-origins'

export function isUnclassifiedTrackingLead(lead: PropertyLead) {
  return !leadTrackingStatusCards.some(card => isLeadStatus(lead.status, card.title))
}

export function buildLeadTrackingGroups(leads: PropertyLead[]) {
  return leadTrackingStatusCards.map(card => ({
    ...card,
    numberLeads: leads.filter(lead => isLeadStatus(lead.status, card.title)).length,
  }))
}

export function filterTrackingLeads(leads: PropertyLead[], status: string, origin?: string) {
  return leads.filter(lead =>
    (status === 'unclassified' ? isUnclassifiedTrackingLead(lead) : isLeadStatus(lead.status, status)) &&
    (!origin || getLeadOrigin(lead.source) === origin),
  )
}

export function searchTrackingLeadsByName(leads: PropertyLead[], query: string) {
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
  const search = normalize(query)
  return search ? leads.filter(lead => normalize(lead.name || '').includes(search)) : leads
}
