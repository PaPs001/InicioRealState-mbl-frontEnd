import { coreApi } from '../client'

export type ActivateAgentNotionPayload = {
  userId: string
  name: string
  status: boolean
}

export async function activateAgentNotion(
  payload: ActivateAgentNotionPayload,
  token?: string | null,
): Promise<unknown> {
  return coreApi('/users/agent-lead-notion', {
    method: 'POST',
    token: token ?? undefined,
    body: payload,
  })
}