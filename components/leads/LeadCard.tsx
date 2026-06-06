import { Text, TouchableOpacity, View } from 'react-native'
import { Building2, CalendarDays, MessageCircle, Phone, User, Briefcase } from 'lucide-react-native'

import { colors } from '@/lib/theme'
import type { PropertyLead } from '@/lib/types'
import {
  getLeadPropertyTypeLabel,
  getLeadStatusMeta,
  leadContactTypeLabels,
  leadSearchIntentLabels,
} from '@/lib/services/leads-domain'
import { formatDate } from '@/lib/utils'

import type { Property } from '@/lib/types'

type LeadCardProps = {
  lead: PropertyLead
  isAdmin: boolean
  property?: Property
  onCall: (phone: string) => void
  onMessage: (phone: string) => void
  onPress: () => void
  styles: any
}

export function LeadCard({
  lead,
  isAdmin,
  onCall,
  onMessage,
  onPress,
  property,
  styles,
}: LeadCardProps) {
  const status = getLeadStatusMeta(lead.status)

  return (
    <TouchableOpacity style={styles.leadCard} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.leadCardTop}>
        <View style={[styles.statusPill, { backgroundColor: `${status.color}22` }]}>
          <View style={[styles.statusDot, { backgroundColor: status.color }]} />
          <Text style={[styles.statusPillText, { color: status.color }]}>{status.label}</Text>
        </View>
        <View style={styles.intentPill}>
          <Text style={styles.intentPillText}>{leadSearchIntentLabels[lead.searchIntent ?? 'sale']}</Text>
        </View>
      </View>

      <View style={styles.leadMainRow}>
        <View style={styles.leadAvatar}>
          <User size={18} color={colors.accent} />
        </View>
        <View style={styles.leadBody}>
          <Text style={styles.leadName}>{lead.name}</Text>
          <Text style={styles.leadMeta}>
            {lead.source} · {leadContactTypeLabels[lead.contactType ?? 'whatsapp']}
          </Text>
          <Text style={styles.leadProperty} numberOfLines={1}>
            {property?.title || 'Sin propiedad'} · {getLeadPropertyTypeLabel(property?.type)}
          </Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={() => onCall(lead.phone)}>
            <Phone size={16} color={colors.accent} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => onMessage(lead.phone)}>
            <MessageCircle size={16} color={colors.accent} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.leadFooter}>
        <View style={styles.infoChip}>
          <CalendarDays size={13} color={colors.textMuted} />
          <Text style={styles.infoChipText}>{formatDate(lead.firstContactDate || lead.createdDate)}</Text>
        </View>
        <View style={styles.infoChip}>
          <Building2 size={13} color={colors.textMuted} />
          <Text style={styles.infoChipText}>{property?.city || 'Sin ciudad'}</Text>
        </View>
        {isAdmin ? (
          <View style={styles.infoChip}>
            <Briefcase size={13} color={colors.textMuted} />
            <Text style={styles.infoChipText}>{lead.assignedAgentName || 'Sin asesor'}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  )
}
