import type { Dispatch, SetStateAction } from 'react'
import { useCallback, useState } from 'react'
import { Alert } from 'react-native'
import * as ImagePicker from 'expo-image-picker'

import { useSessionDomain } from '@/contexts/auth/use-session-domain'
import {
  deleteUploadedAgentPresentationImage,
  deleteUploadedProfileImage,
  uploadProfileImage,
} from '@/lib/api'
import { cacheUploadedFile } from '@/lib/services/uploaded-file-cache'
import type { ProfileImageTarget, SelectedProfileImage } from '../types'
import { validateAgentPresentationImage } from '../utils/validateAgentPresentationImage'

type UseProfileImageUploadOptions = {
  setProfileAvatarUri: Dispatch<SetStateAction<string | null>>
}

export function useProfileImageUpload({
  setProfileAvatarUri,
}: UseProfileImageUploadOptions) {
  const { authToken, currentUser, refreshToken, setAuthSession } = useSessionDomain()
  const [target, setTarget] = useState<ProfileImageTarget>('profile')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<SelectedProfileImage | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const open = useCallback((nextTarget: ProfileImageTarget) => {
    setTarget(nextTarget)
    setSelectedImage(null)
    setError(null)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    if (isSaving) return
    setIsOpen(false)
    setSelectedImage(null)
    setError(null)
  }, [isSaving])

  const pickImage = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      setError('Necesitamos permiso para escoger una imagen.')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      mediaTypes: ['images'],
      quality: 0.8,
      exif: target === 'agentpresentation',
    })
    if (result.canceled || !result.assets[0]) return

    const asset = result.assets[0]
    if (target === 'agentpresentation') {
      const validationError = validateAgentPresentationImage(asset)
      if (validationError) {
        setSelectedImage(null)
        setError(validationError)
        Alert.alert('La foto no cumple los requisitos', validationError)
        return
      }
    }

    setSelectedImage({
      uri: asset.uri,
      name: asset.fileName || `perfil-${Date.now()}.jpg`,
      type: asset.mimeType || 'image/jpeg',
    })
    setError(null)
  }, [target])

  const save = useCallback(async () => {
    if (!selectedImage || !authToken || !currentUser || isSaving) {
      if (!selectedImage) setError('Selecciona una imagen antes de guardarla.')
      if (!currentUser || !authToken) setError('Inicia sesión antes de guardar la foto.')
      return
    }

    setIsSaving(true)
    setError(null)
    try {
      if (target === 'profile') {
        await deleteUploadedProfileImage(authToken)
        const uploadedImage = await uploadProfileImage({ image: selectedImage }, authToken)
        const profilePhotoKey = uploadedImage.key
          || uploadedImage.storageKey
          || currentUser.profilePhotoKey

        await setAuthSession(
          { ...currentUser, avatar: uploadedImage.url, profilePhotoKey },
          authToken,
          refreshToken,
        )

        if (profilePhotoKey) {
          await cacheUploadedFile({
            storageKey: profilePhotoKey,
            token: authToken,
            namespace: 'profile-photos',
            contentType: uploadedImage.contentType,
          }).then(setProfileAvatarUri).catch(cacheError => {
            console.warn('No se pudo cachear la foto de perfil recién subida:', cacheError)
            setProfileAvatarUri(uploadedImage.url)
          })
        } else {
          setProfileAvatarUri(uploadedImage.url)
        }
        Alert.alert('Foto actualizada', 'La foto de perfil se guardó correctamente.')
      } else {
        await deleteUploadedAgentPresentationImage(authToken)
        const uploadedImage = await uploadProfileImage(
          { image: selectedImage },
          authToken,
          'agentpresentation',
        )
        const agentPresentationKey = uploadedImage.key || uploadedImage.storageKey
        if (!agentPresentationKey) {
          throw new Error('El servicio no devolvió la key de la foto para el PDF.')
        }

        await setAuthSession(
          { ...currentUser, agentPresentationKey },
          authToken,
          refreshToken,
        )
        await cacheUploadedFile({
          storageKey: agentPresentationKey,
          token: authToken,
          namespace: 'agent-presentations',
          contentType: uploadedImage.contentType,
        }).catch(cacheError => {
          console.warn('La foto para el PDF se subió, pero no se pudo cachear:', cacheError)
        })
        Alert.alert('Foto guardada', 'La foto para el PDF se guardó correctamente.')
      }

      setSelectedImage(null)
      setIsOpen(false)
    } catch (saveError) {
      const message = saveError instanceof Error
        ? saveError.message
        : target === 'profile'
          ? 'No se pudo guardar la foto de perfil.'
          : 'No se pudo guardar la foto para el PDF.'
      console.warn('No se pudo guardar la imagen del perfil:', saveError)
      setError(message)
    } finally {
      setIsSaving(false)
    }
  }, [
    authToken,
    currentUser,
    isSaving,
    refreshToken,
    selectedImage,
    setAuthSession,
    setProfileAvatarUri,
    target,
  ])

  return {
    target,
    title: target === 'agentpresentation' ? 'Foto para el PDF' : 'Foto de perfil',
    isOpen,
    selectedImage,
    error,
    isSaving,
    open,
    close,
    pickImage,
    save,
  }
}
