import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {Image as ImageIcon} from 'lucide-react-native'

import {type FollowingAttachment, useFollowingAttachmentImage} from '@/modules/users/leads/hooks/useFollowingAttachmentImage'

export type FollowingImagePreview = {uri: string; title: string}

type Props = {
  attachment: FollowingAttachment
  followingId: string
  index: number
  leadId: string
  onOpenImage: (image: FollowingImagePreview) => void
  token?: string | null
}

export function FollowingImageAttachment({attachment, followingId, index, leadId, onOpenImage, token}: Props) {
  const title = attachment.filename || `Imagen ${index + 1}`
  const {hasLoadError, localUri} = useFollowingAttachmentImage({attachment, followingId, index, leadId, token})

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.85}
      disabled={!localUri}
      onPress={() => localUri && onOpenImage({uri: localUri, title})}
    >
      {localUri ? (
        <Image source={{uri: localUri}} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>{hasLoadError ? 'No disponible' : 'Cargando...'}</Text>
        </View>
      )}
      <View style={styles.metadata}>
        <ImageIcon size={12} color="#0c6740" />
        <Text style={styles.filename} numberOfLines={1}>{title}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {width: 112, borderRadius: 10, borderWidth: 1, borderColor: '#d8d1c8', backgroundColor: '#ffffff', overflow: 'hidden'},
  image: {width: '100%', height: 82, backgroundColor: '#edf1e0'},
  placeholder: {width: '100%', height: 82, backgroundColor: '#edf1e0', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8},
  placeholderText: {color: '#6f786f', fontSize: 10, lineHeight: 13, textAlign: 'center'},
  metadata: {minHeight: 30, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 7, paddingVertical: 6},
  filename: {flex: 1, minWidth: 0, color: '#19191f', fontSize: 10, lineHeight: 13, fontWeight: '600'},
})
