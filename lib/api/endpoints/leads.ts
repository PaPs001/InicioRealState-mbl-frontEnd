import { mockLeads, mockUsers } from '@/lib/mock-data'
import type { LeadFollowUp, PropertyLead, User } from '@/lib/types'

const createdLeadsStore = new Map<string, PropertyLead>()
const followUpsStore = new Map<string, LeadFollowUp[]>()

function applyLeadOverlays(lead: PropertyLead): PropertyLead {
  return {
    ...lead,
    followUps: followUpsStore.get(lead.id) ?? lead.followUps ?? [],
  }
}

export function getLeadRecords(baseLeads: PropertyLead[] = mockLeads): PropertyLead[] {
  const createdLeads = Array.from(createdLeadsStore.values())
  const createdIds = new Set(createdLeads.map((lead) => lead.id))

  return [
    ...createdLeads.map(applyLeadOverlays),
    ...baseLeads.filter((lead) => !createdIds.has(lead.id)).map(applyLeadOverlays),
  ]
}

export function getLeadAgents(): User[] {
  return mockUsers.filter((user) => user.systemRole === 'AGENT')
}

export function getLeadAgentById(agentId?: string | null): User | null {
  if (!agentId) {
    return null
  }

  return mockUsers.find((user) => user.id === agentId) ?? null
}

export function createLeadRecord(lead: PropertyLead) {
  createdLeadsStore.set(lead.id, lead)
  return lead
}

export function getLeadRecordById(id: string, baseLeads: PropertyLead[] = mockLeads) {
  return getLeadRecords(baseLeads).find((lead) => lead.id === id)
}

export function saveLeadFollowUps(leadId: string, followUps: LeadFollowUp[]) {
  followUpsStore.set(leadId, followUps)

  const createdLead = createdLeadsStore.get(leadId)
  if (createdLead) {
    createdLeadsStore.set(leadId, { ...createdLead, followUps })
  }

  return followUps
}
