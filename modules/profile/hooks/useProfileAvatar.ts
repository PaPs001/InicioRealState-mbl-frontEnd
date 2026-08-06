import { useEffect, useState } from 'react'

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

  useEffect(() => {
    let isMounted = true

    setProfileAvatarUri(null)

    if (!currentUser || !authToken) {
      setProfileAvatarUri(currentUser?.avatar ?? null)
      return () => {
        isMounted = false
      }
    }

    const loadProfileAvatar = async () => {
      const profilePhoto = currentUser.profilePhotoKey
        ? {
            key: currentUser.profilePhotoKey,
            storageKey: currentUser.profilePhotoKey,
            url: currentUser.avatar ?? '',
            contentType: undefined,
          }
        : await getUploadedProfileImage(authToken)

      const profilePhotoKey = profilePhoto?.key || profilePhoto?.storageKey
      if (!profilePhotoKey) {
        if (isMounted) setProfileAvatarUri(currentUser.avatar ?? null)
        return
      }

      if (!currentUser.profilePhotoKey) {
        await setAuthSession(
          {
            ...currentUser,
            avatar: profilePhoto.url || currentUser.avatar,
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
      if (isMounted) setProfileAvatarUri(currentUser.avatar ?? null)
    })

    return () => {
      isMounted = false
    }
  }, [authToken, currentUser, refreshToken, setAuthSession])

  return { profileAvatarUri, setProfileAvatarUri }
}
