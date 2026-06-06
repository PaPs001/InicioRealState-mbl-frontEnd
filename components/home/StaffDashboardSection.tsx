import { Text, TouchableOpacity, View } from 'react-native'
import type { LucideIcon } from 'lucide-react-native'
import { Building2, Calendar, ChevronRight, ClipboardCheck, Users } from 'lucide-react-native'

import { colors, borderRadius, spacing, typography } from '@/lib/theme'

export type StaffQuickAccessItem = {
  icon: LucideIcon
  title: string
  subtitle: string
  onPress: () => void
}

type StaffDashboardSectionProps = {
  isAdmin: boolean
  pendingAppointments: number
  pendingLeads: number
  primaryAction?: {
    onPress: () => void
    subtitle: string
    title: string
  } | null
  quickAccessItems: StaffQuickAccessItem[]
  styles: any
  totalProperties: number
  totalUserLeads: number
  negotiatingLeads: number
}

export function StaffDashboardSection({
  isAdmin,
  pendingAppointments,
  pendingLeads,
  primaryAction,
  quickAccessItems,
  styles,
  totalProperties,
  totalUserLeads,
  negotiatingLeads,
}: StaffDashboardSectionProps) {
  return (
    <>
      {primaryAction ? (
        <View style={styles.primaryActionSectionDark}>
          <TouchableOpacity style={styles.primaryActionButtonDark} onPress={primaryAction.onPress}>
            <View style={styles.primaryActionIconDark}>
              <ClipboardCheck size={22} color={colors.primaryDark} />
            </View>
            <View style={styles.primaryActionContent}>
              <Text style={styles.primaryActionTitleDark}>{primaryAction.title}</Text>
              <Text style={styles.primaryActionSubtitleDark}>{primaryAction.subtitle}</Text>
            </View>
            <ChevronRight size={20} color={colors.primaryDark} />
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.statsGridDark}>
        <View style={styles.statCardDark}>
          <View style={styles.statHeader}>
            <Text style={styles.statLabelDark}>Leads Nuevos</Text>
            <Users size={20} color={colors.accent} />
          </View>
          <Text style={styles.statValueDark}>{pendingLeads}</Text>
          <Text style={styles.statDescriptionDark}>Por contactar</Text>
        </View>

        <View style={styles.statCardDark}>
          <View style={styles.statHeader}>
            <Text style={styles.statLabelDark}>Negociando</Text>
            <ClipboardCheck size={20} color={colors.accent} />
          </View>
          <Text style={styles.statValueDark}>{negotiatingLeads}</Text>
          <Text style={styles.statDescriptionDark}>En proceso</Text>
        </View>

        <View style={styles.statCardDark}>
          <View style={styles.statHeader}>
            <Text style={styles.statLabelDark}>Citas</Text>
            <Calendar size={20} color={colors.accent} />
          </View>
          <Text style={styles.statValueDark}>{pendingAppointments}</Text>
          <Text style={styles.statDescriptionDark}>Pendientes</Text>
        </View>

        <View style={styles.statCardDark}>
          <View style={styles.statHeader}>
            <Text style={styles.statLabelDark}>Propiedades</Text>
            <Building2 size={20} color={colors.accent} />
          </View>
          <Text style={styles.statValueDark}>{totalProperties}</Text>
          <Text style={styles.statDescriptionDark}>Activas</Text>
        </View>
      </View>

      <View style={styles.sectionDark}>
        <Text style={styles.sectionTitleDark}>Acceso Rapido</Text>

        <TouchableOpacity style={styles.quickAccessCardDark} onPress={quickAccessItems[0]?.onPress}>
          <View style={styles.quickAccessIconDark}>
            <Users size={24} color={colors.accent} />
          </View>
          <View style={styles.quickAccessContent}>
            <Text style={styles.quickAccessTitleDark}>Gestion de Leads</Text>
            <Text style={styles.quickAccessSubtitleDark}>{totalUserLeads} leads totales</Text>
          </View>
          <ChevronRight size={20} color={colors.textMuted} />
        </TouchableOpacity>

        {quickAccessItems.slice(1).map((item) => {
          const Icon = item.icon
          return (
            <TouchableOpacity key={item.title} style={styles.quickAccessCardDark} onPress={item.onPress}>
              <View style={styles.quickAccessIconDark}>
                <Icon size={24} color={colors.accent} />
              </View>
              <View style={styles.quickAccessContent}>
                <Text style={styles.quickAccessTitleDark}>{item.title}</Text>
                <Text style={styles.quickAccessSubtitleDark}>{item.subtitle}</Text>
              </View>
              <ChevronRight size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )
        })}
      </View>
    </>
  )
}
