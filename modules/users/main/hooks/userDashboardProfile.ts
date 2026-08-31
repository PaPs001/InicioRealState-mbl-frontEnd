import { useEffect, useMemo, useRef } from 'react'

import { useSessionDomain } from '@/contexts/auth/use-session-domain'
import { getUploadedAgentPresentation } from '@/lib/api'
import { cacheUploadedFile } from '@/lib/services/uploaded-file-cache'
import { getInitials } from '@/modules/users/main/utils/dashboard-formatters'
import {
  useProfileAvatar,
  useProfileImageUpload,
} from '@/modules/profile'

type UseDashboardProfileParams = {
  fallbackName: string
}

export function useDashboardProfile({ fallbackName }: UseDashboardProfileParams) {
  const {
    authToken,
    currentUser,
    refreshToken,
    setAuthSession,
  } = useSessionDomain()
  const currentAgentPresentationKey = currentUser?.agentPresentationKey
  const hasCurrentUser = !!currentUser
  const currentUserRef = useRef(currentUser)

  currentUserRef.current = currentUser

  const advisorName = useMemo(
    () =>
      currentUser?.name?.trim() ||
      currentUser?.email?.split('@')[0] ||
      fallbackName,
    [currentUser?.email, currentUser?.name, fallbackName],
  )

  const advisorInitials = useMemo(
    () => getInitials(advisorName),
    [advisorName],
  )

  const { profileAvatarUri, setProfileAvatarUri } = useProfileAvatar()
  const profileImageUpload = useProfileImageUpload({ setProfileAvatarUri })

  useEffect(() => {
    if (!hasCurrentUser || !authToken) return

    const cacheAgentPresentation = async () => {
      const presentation = currentAgentPresentationKey
        ? { key: currentAgentPresentationKey, contentType: undefined }
        : await getUploadedAgentPresentation(authToken)
      const storageKey = presentation?.key
      if (!storageKey) return

      if (!currentAgentPresentationKey) {
        const latestCurrentUser = currentUserRef.current
        if (!latestCurrentUser) return

        await setAuthSession(
          { ...latestCurrentUser, agentPresentationKey: storageKey },
          authToken,
          refreshToken,
        )
      }

      await cacheUploadedFile({
        storageKey,
        token: authToken,
        namespace: 'agent-presentations',
        contentType: presentation.contentType,
      })
    }

    void cacheAgentPresentation().catch((error) => {
      console.warn('No se pudo cachear agentpresentation:', error)
    })
  }, [authToken, currentAgentPresentationKey, hasCurrentUser, refreshToken, setAuthSession])

  return {
    advisorInitials,
    advisorName,
    profileAvatarUri,
    profileImageUpload,
  }
}
