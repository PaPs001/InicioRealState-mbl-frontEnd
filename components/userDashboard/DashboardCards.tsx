import { Text, View } from 'react-native'
import { Bell, CalendarDays, ChevronRight } from 'lucide-react-native'

import { styles } from './UserDashboardScreen.styles'
import type { AppointmentPreviewItem, DashboardLeadAlert, DashboardMetric, DashboardPriority } from './types'

const toneColors = {
  neutral: { background: '#ffffff', border: '#e4e4e4', text: '#2a2d31' },
  success: { background: '#e5f8e9', border: '#b5dfbd', text: '#2c7a3f' },
  warning: { background: '#ecdab5', border: '#d8bd85', text: '#c27a20' },
  danger: { background: '#ffe1dd', border: '#ffc5bc', text: '#f05a64' },
} as const

export function PriorityCard({ priority, highlight }: { priority: DashboardPriority; highlight?: boolean }) {
  return (
    <View style={styles.priorityCard}>
      <Text style={[styles.priorityValue, highlight && styles.priorityValueGold]}>{priority.value}</Text>
      <Text style={styles.priorityLabel}>{priority.label}</Text>
    </View>
  )
}

export function AppointmentCard({ appointment }: { appointment: AppointmentPreviewItem }) {
  return (
    <View style={styles.appointmentCard}>
      <View style={styles.appointmentCopy}>
        <Text style={styles.appointmentTitle} numberOfLines={1}>{appointment.property}</Text>
        <Text style={styles.appointmentMeta} numberOfLines={1}>Cliente: {appointment.client}</Text>
        <Text style={styles.appointmentMeta} numberOfLines={1}>Asesor: {appointment.adviser}</Text>
      </View>
      <View style={styles.appointmentDate}>
        <View style={styles.dayPill}>
          <CalendarDays size={10} color="#ffffff" />
          <Text style={styles.appointmentDay} numberOfLines={1}>{appointment.day}</Text>
        </View>
        <Text style={styles.appointmentTime}>{appointment.time}</Text>
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>{appointment.status}</Text>
        </View>
      </View>
      <ChevronRight size={17} color="#d4b66f" />
    </View>
  )
}

export function LeadMetricCard({ metric }: { metric: DashboardMetric }) {
  const tone = toneColors[metric.tone]

  return (
    <View style={[styles.metricCard, { backgroundColor: tone.background, borderColor: tone.border }]}>
      <Text style={[styles.metricValue, { color: tone.text }]}>{metric.value}</Text>
      <Text style={styles.metricLabel}>{metric.label}</Text>
    </View>
  )
}

export function FunnelMetric({ metric }: { metric: DashboardMetric }) {
  return (
    <View style={styles.funnelItem}>
      <Text style={styles.funnelValue}>{metric.value}</Text>
      <Text style={styles.funnelLabel}>{metric.label}</Text>
    </View>
  )
}

export function LeadAlertRow({ alert }: { alert: DashboardLeadAlert }) {
  return (
    <View style={styles.alertRow}>
      <Bell size={15} color="#e95454" />
      <Text style={styles.alertText} numberOfLines={1}>{alert.message}</Text>
      <ChevronRight size={14} color="#2a2d31" />
    </View>
  )
}
