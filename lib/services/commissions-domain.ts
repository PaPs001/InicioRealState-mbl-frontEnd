import { mockCommissions, mockUsers } from '@/lib/mock-data'
import type { Commission } from '@/lib/types/leads'

export type CommissionScope = 'mine' | 'team'

export type CommissionStatusInfo = {
  color: string
  label: string
  tone: 'success' | 'warning' | 'info' | 'neutral'
}

export type AgentCommissionSummary = {
  agentId: string
  name: string
  operations: number
  paid: number
  pending: number
  total: number
}

export function getVisibleCommissions(params: {
  currentUserId?: string | null
  isAdmin: boolean
  scope: CommissionScope
}): Commission[] {
  const { currentUserId, isAdmin, scope } = params

  if (isAdmin && scope === 'team') {
    return mockCommissions
  }

  return mockCommissions.filter((commission) => commission.agentId === currentUserId)
}

export function getCommissionTotals(commissions: Commission[]) {
  return commissions.reduce(
    (acc, commission) => {
      acc.total += commission.amount
      if (commission.status === 'pending') acc.pending += commission.amount
      if (commission.status === 'approved') acc.approved += commission.amount
      if (commission.status === 'paid') acc.paid += commission.amount
      return acc
    },
    { approved: 0, paid: 0, pending: 0, total: 0 },
  )
}

export function getCommissionStatusInfo(status: Commission['status']): CommissionStatusInfo {
  switch (status) {
    case 'paid':
      return { label: 'Pagada', color: 'success', tone: 'success' }
    case 'pending':
      return { label: 'Pendiente', color: 'warning', tone: 'warning' }
    case 'approved':
      return { label: 'Aprobada', color: 'info', tone: 'info' }
    default:
      return { label: 'Pendiente', color: 'neutral', tone: 'neutral' }
  }
}

export function getAgentCommissionSummaries(): AgentCommissionSummary[] {
  const grouped = new Map<string, AgentCommissionSummary>()

  for (const commission of mockCommissions) {
    const agent = mockUsers.find((user) => user.id === commission.agentId)
    const current = grouped.get(commission.agentId) ?? {
      agentId: commission.agentId,
      name: agent?.name ?? 'Asesor sin nombre',
      operations: 0,
      paid: 0,
      pending: 0,
      total: 0,
    }

    current.total += commission.amount
    current.operations += 1
    if (commission.status === 'paid') current.paid += commission.amount
    if (commission.status === 'pending' || commission.status === 'approved') current.pending += commission.amount
    grouped.set(commission.agentId, current)
  }

  return Array.from(grouped.values())
}

export function getCommissionAgentName(agentId: string) {
  return mockUsers.find((user) => user.id === agentId)?.name ?? 'Asesor no encontrado'
}
