import { useEffect, useRef, useState } from 'react'

import { useSessionDomain } from '@/contexts/auth/use-session-domain'
import { getUploadedProfileImage } from '@/lib/api'
import { cacheUploadedFile } from '@/lib/services/uploaded-file-cache'

export function useProfileAvatar() {
  const {
    authToken,
    currentUser,
    refreshToken,
    setAuthSession,
  } = useSessionDomain()
  const [profileAvatarUri, setProfileAvatarUri] = useState<string | null>(null)
  const currentAvatar = currentUser?.avatar ?? null
  const currentProfilePhotoKey = currentUser?.profilePhotoKey
  const hasCurrentUser = !!currentUser
  const currentUserRef = useRef(currentUser)

  currentUserRef.current = currentUser

  useEffect(() => {
    let isMounted = true

    setProfileAvatarUri(null)

    if (!hasCurrentUser || !authToken) {
      setProfileAvatarUri(currentAvatar)
      return () => {
        isMounted = false
      }
    }

    const loadProfileAvatar = async () => {
      const profilePhoto = currentProfilePhotoKey
        ? {
            key: currentProfilePhotoKey,
            storageKey: currentProfilePhotoKey,
            url: currentAvatar ?? '',
            contentType: undefined,
          }
        : await getUploadedProfileImage(authToken)

      const profilePhotoKey = profilePhoto?.key || profilePhoto?.storageKey
      if (!profilePhotoKey) {
        if (isMounted) setProfileAvatarUri(currentAvatar)
        return
      }

      if (!currentProfilePhotoKey) {
        const latestCurrentUser = currentUserRef.current
        if (!latestCurrentUser) return

        await setAuthSession(
          {
            ...latestCurrentUser,
            avatar: profilePhoto.url || currentAvatar || undefined,
            profilePhotoKey,
          },
          authToken,
          refreshToken,
        )
      }

      const localUri = await cacheUploadedFile({
        storageKey: profilePhotoKey,
        token: authToken,
        namespace: 'profile-photos',
        contentType: profilePhoto.contentType,
      })
      if (isMounted) setProfileAvatarUri(localUri)
    }

    void loadProfileAvatar().catch(error => {
      console.warn('No se pudo cargar la foto de perfil:', error)
      if (isMounted) setProfileAvatarUri(currentAvatar)
    })

    return () => {
      isMounted = false
    }
  }, [authToken, currentAvatar, currentProfilePhotoKey, hasCurrentUser, refreshToken, setAuthSession])

  return { profileAvatarUri, setProfileAvatarUri }
}
