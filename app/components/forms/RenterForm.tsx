import { View, Text, TextInput, StyleSheet } from 'react-native'
import { colors, spacing, typography, borderRadius } from '@/lib/theme'

export default function RenterForm() {
  return (
    <View style={styles.container}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Formulario de Inquilino</Text>
        <Text style={styles.label}>Nombre Completo</Text>
        <TextInput
          style={styles.input}
          placeholder="Escribe tu nombre"
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="correo@ejemplo.com"
          placeholderTextColor={colors.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Teléfono</Text>
        <TextInput
          style={styles.input}
          placeholder="Número de contacto"
          placeholderTextColor={colors.textMuted}
          keyboardType="phone-pad"
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.body.fontSize,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.body.fontSize,
    color: colors.text,
  },
})
