import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { ArrowLeft, MessageCircle } from 'lucide-react-native'
import { colors, spacing, typography, borderRadius } from '@/lib/theme'

export default function ChatDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Conversacion</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <MessageCircle size={44} color={colors.accent} />
        <Text style={styles.heading}>Chat pendiente</Text>
        <Text style={styles.description}>
          Conversacion `{id}` lista para integrar con el flujo real de mensajeria.
        </Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: typography.h4.fontSize,
    fontWeight: '700',
    color: colors.text,
  },
  placeholder: {
    width: 40,
    height: 40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  heading: {
    marginTop: spacing.lg,
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    color: colors.text,
  },
  description: {
    marginTop: spacing.sm,
    fontSize: typography.body.fontSize,
    lineHeight: 24,
    textAlign: 'center',
    color: colors.textSecondary,
  },
})
