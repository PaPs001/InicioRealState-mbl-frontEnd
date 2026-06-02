import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { ArrowLeft, FileText } from 'lucide-react-native'
import { colors, spacing, typography, borderRadius } from '@/lib/theme'

export default function DocumentsScreen() {
  const router = useRouter()

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Documentos</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <FileText size={44} color={colors.accent} />
        <Text style={styles.heading}>Seccion en construccion</Text>
        <Text style={styles.description}>
          Aqui puedes conectar contratos, recibos y archivos del inquilino cuando el flujo backend este listo.
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
