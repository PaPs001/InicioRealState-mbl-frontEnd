import { Text, View } from 'react-native'

import { Home } from 'lucide-react-native'

type TenantEmptyStateProps = {
  styles: any
  theme: any
}

export function TenantEmptyState({ styles, theme }: TenantEmptyStateProps) {
  return (
    <View style={styles.section}>
      <View style={styles.tenantEmptyState}>
        <Home size={48} color={theme.textMuted} />
        <Text style={[styles.tenantEmptyTitle, { color: theme.text }]}>Sin renta activa</Text>
        <Text style={[styles.tenantEmptyText, { color: theme.textMuted }]}>
          No tienes una renta activa en este momento
        </Text>
      </View>
    </View>
  )
}
