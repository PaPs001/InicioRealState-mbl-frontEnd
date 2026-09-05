import { Image, Text, TouchableOpacity, View } from 'react-native'
import { AlertTriangle, ChevronRight, Clock3, Radio, UserRound } from 'lucide-react-native'

import { styles } from '@/app/(users)/userCoordinator/leads-v2/index.styles'
import type { AgentLeadGroup, LeadV2Alert, LeadV2ViewModel } from './types'
import { getAvatarUrl } from './lead-v2-utils'

export function AlertRow({ alert }: { alert: LeadV2Alert }) {
  return (
    <TouchableOpacity style={styles.alertRow} activeOpacity={0.85}>
      {getAlertIcon(alert.icon)}
      <Text style={styles.alertText} numberOfLines={1}>{alert.message}</Text>
      <ChevronRight size={17} color="#000000" />
    </TouchableOpacity>
  )
}

export function AgentGroupCard({ group, onPress }: { group: AgentLeadGroup; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.leadCard} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.leadTopRow}>
        <Image source={{ uri: getAvatarUrl(group.name) }} style={styles.leadAvatar} />
        <View style={styles.leadMain}>
          <Text style={styles.leadName} numberOfLines={1}>{group.name}</Text>
          <Text style={styles.leadProperty} numberOfLines={1}>{group.leads.length} leads asignados</Text>
          <View style={styles.sourceRow}>
            <UserRound size={13} color="#0b57d0" />
            <Text style={styles.sourceText} numberOfLines={1}>{group.active} activos</Text>
            <Text style={styles.sourceText} numberOfLines={1}>{group.followings} seguimientos</Text>
          </View>
        </View>
        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText} numberOfLines={1}>{group.pending} pendientes</Text>
        </View>
      </View>

      <View style={styles.leadFooter}>
        <View style={styles.footerCell}>
          <Text style={styles.footerLabel}>Total leads</Text>
          <Text style={styles.footerValue} numberOfLines={1}>{group.leads.length}</Text>
        </View>
        <View style={[styles.footerCell, styles.footerCellMiddle]}>
          <Text style={styles.footerLabel}>En seguimiento</Text>
          <Text style={styles.footerValue} numberOfLines={1}>{group.followings}</Text>
        </View>
        <TouchableOpacity style={styles.followButton} activeOpacity={0.85} onPress={onPress}>
          <Text style={styles.followButtonText} numberOfLines={1}>Ver leads</Text>
          <ChevronRight size={12} color="#000000" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

export function PriorityLeadCard({ lead, onPress }: { lead: LeadV2ViewModel; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.leadCard} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.leadTopRow}>
        <Image source={{ uri: getAvatarUrl(lead.name) }} style={styles.leadAvatar} />
        <View style={styles.leadMain}>
          <Text style={styles.leadName} numberOfLines={1}>{lead.name}</Text>
          <Text style={styles.leadProperty} numberOfLines={1}>{lead.propertyName}</Text>
          <View style={styles.sourceRow}>
            <Radio size={13} color="#0b57d0" />
            <Text style={styles.sourceText} numberOfLines={1}>{lead.channel}</Text>
            <Text style={styles.sourceText} numberOfLines={1}>{lead.source}</Text>
          </View>
        </View>
        <View style={styles.statusStack}>
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText} numberOfLines={1}>{lead.statusLabel}</Text>
          </View>
          {lead.advisorStatusLabel ? (
            <View style={[styles.statusPill, styles.advisorStatusPill]}>
              <View style={[styles.statusDot, styles.advisorStatusDot]} />
              <Text style={[styles.statusText, styles.advisorStatusText]} numberOfLines={1}>{lead.advisorStatusLabel}</Text>
            </View>
          ) : null}
          {lead.rawLead.leadNotionId || lead.rawLead.statusSource === 'notion' ? (
            <View
              accessibilityLabel="Lead de Notion"
              accessibilityRole="image"
              style={styles.notionIcon}
            >
              <Text style={styles.notionIconText}>N</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.leadFooter}>
        <View style={styles.footerCell}>
          <Text style={styles.footerValue} numberOfLines={2}>{lead.lastContactLabel}</Text>
        </View>
        <View style={[styles.footerCell, styles.footerCellMiddle]}>
          <Text style={styles.footerLabel}>Proxima Accion</Text>
          <Text style={styles.footerValue} numberOfLines={2}>{lead.nextActionLabel}</Text>
        </View>
        <TouchableOpacity style={styles.followButton} activeOpacity={0.85} onPress={onPress}>
          <Text style={styles.followButtonText} numberOfLines={1}>Ver seguimiento</Text>
          <ChevronRight size={12} color="#000000" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

function getAlertIcon(icon: LeadV2Alert['icon']) {
  if (icon === 'user') return <UserRound size={15} color="#ba544a" />
  if (icon === 'clock') return <Clock3 size={15} color="#ba544a" />
  return <AlertTriangle size={15} color="#ba544a" />
}
