import {Image, Modal, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {X} from 'lucide-react-native'

import type {FollowingImagePreview} from './FollowingImageAttachment'

type Props = {image: FollowingImagePreview | null; onClose: () => void}

export function FollowingImagePreviewModal({image, onClose}: Props) {
  return (
    <Modal animationType="fade" transparent visible={Boolean(image)} statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>{image?.title || 'Imagen adjunta'}</Text>
          <TouchableOpacity style={styles.closeButton} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel="Cerrar imagen" onPress={onClose}>
            <X size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
        {image ? <Image source={{uri: image.uri}} style={styles.image} resizeMode="contain" /> : null}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', paddingHorizontal: 14, paddingTop: 46, paddingBottom: 28},
  header: {minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12},
  title: {flex: 1, minWidth: 0, color: '#ffffff', fontSize: 14, lineHeight: 18, fontWeight: '700'},
  closeButton: {width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center'},
  image: {flex: 1, width: '100%'},
})
