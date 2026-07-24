import { useEffect, useRef, useState } from 'react'
import { Animated, StyleSheet, Text, TouchableOpacity, View, type ViewStyle } from 'react-native'
import { CalendarPlus, Clock3, PencilLine, Plus, Trash2 } from 'lucide-react-native'

const leadQuickActions = [
  { id: 'delete-leads', label: 'Eliminar leads', icon: 'trash', tone: 'danger', labelLeft: 34, labelWidth: 190 },
  { id: 'new-status', label: 'Nuevo status', icon: 'status', tone: 'status', labelLeft: 44, labelWidth: 180 },
  { id: 'schedule-appointment', label: 'Agendar cita', icon: 'calendar', tone: 'warning', labelLeft: 54, labelWidth: 170 },
  { id: 'create-lead', label: 'Crear lead', icon: 'pencil', tone: 'success', labelLeft: 74, labelWidth: 150 },
] as const

type LeadQuickAction = typeof leadQuickActions[number]

type LeadQuickActionsButtonProps = {
  onCreateLead?: () => void
  onDeleteLeads?: () => void
  onNewStatus?: () => void
  onScheduleAppointment?: () => void
  onOpenChange?: (isOpen: boolean) => void
  style?: ViewStyle
}

export function LeadQuickActionsButton({
  onCreateLead,
  onDeleteLeads,
  onNewStatus,
  onScheduleAppointment,
  onOpenChange,
  style,
}: LeadQuickActionsButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const animation = useRef(new Animated.Value(0)).current
  const buttonBackground = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['#000000', '#ffffff'],
  })
  const iconRotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  })
  const iconColor = isOpen ? '#000000' : '#ffffff'

  useEffect(() => {
    Animated.timing(animation, {
      toValue: isOpen ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start()
    onOpenChange?.(isOpen)
  }, [animation, isOpen, onOpenChange])

  const close = () => setIsOpen(false)

  const handleActionPress = (actionId: LeadQuickAction['id']) => {
    close()

    if (actionId === 'create-lead') {
      onCreateLead?.()
      return
    }
    if (actionId === 'delete-leads') {
      onDeleteLeads?.()
      return
    }
    if (actionId === 'new-status') {
      onNewStatus?.()
      return
    }
    if (actionId === 'schedule-appointment') {
      onScheduleAppointment?.()
    }
  }

  return (
    <View style={[styles.root, style]}>
      {isOpen ? (
        <View style={styles.menu}>
          <View style={styles.line} />
          {leadQuickActions.map(action => (
            <TouchableOpacity
              key={action.id}
              style={styles.action}
              activeOpacity={0.85}
              onPress={() => handleActionPress(action.id)}
            >
              <View
                style={[
                  styles.actionPill,
                  getActionPillStyle(action.tone),
                  { left: action.labelLeft, width: action.labelWidth },
                ]}
              >
                <Text style={styles.actionText} numberOfLines={1}>
                  {action.label}
                </Text>
              </View>
              <View style={[styles.actionIcon, getActionIconStyle(action.tone)]}>
                {getActionIcon(action.icon)}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setIsOpen(current => !current)}
      >
        <Animated.View style={[styles.button, { backgroundColor: buttonBackground }]}>
          <Animated.View style={{ transform: [{ rotate: iconRotation }] }}>
            <Plus size={25} color={iconColor} strokeWidth={1.7} />
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
    </View>
  )
}

function getActionIcon(icon: LeadQuickAction['icon']) {
  if (icon === 'trash') return <Trash2 size={22} color="#ffffff" strokeWidth={1.8} />
  if (icon === 'calendar') return <CalendarPlus size={22} color="#ffffff" strokeWidth={1.8} />
  if (icon === 'pencil') return <PencilLine size={22} color="#ffffff" strokeWidth={1.8} />
  return <Clock3 size={22} color="#ffffff" strokeWidth={1.8} />
}

function getActionIconStyle(tone: LeadQuickAction['tone']) {
  if (tone === 'danger') return styles.actionIconDanger
  if (tone === 'status') return styles.actionIconStatus
  if (tone === 'success') return styles.actionIconSuccess
  return styles.actionIconWarning
}

function getActionPillStyle(tone: LeadQuickAction['tone']) {
  if (tone === 'danger') return styles.actionPillDanger
  if (tone === 'status') return styles.actionPillStatus
  if (tone === 'success') return styles.actionPillSuccess
  return styles.actionPillWarning
}

const styles = StyleSheet.create({
  root: {
    width: 42,
    height: 42,
    zIndex: 40,
  },
  button: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  menu: {
    position: 'absolute',
    right: 0,
    bottom: 50,
    width: 280,
    height: 304,
  },
  line: {
    position: 'absolute',
    top: 25,
    bottom: 50,
    left: 249,
    width: 1,
    height: 241,
    backgroundColor: '#555555',
  },
  action: {
    height: 72,
    position: 'relative',
  },
  actionPill: {
    position: 'absolute',
    top: 12,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2d2d2d',
    justifyContent: 'center',
    paddingLeft: 14,
    paddingRight: 34,
  },
  actionText: {
    color: '#000000',
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
  },
  actionIcon: {
    position: 'absolute',
    top: 11,
    left: 224,
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#6c6c6c',
  },
  actionPillDanger: {
    backgroundColor: '#c94f54',
  },
  actionPillStatus: {
    backgroundColor: '#359999',
  },
  actionPillWarning: {
    backgroundColor: '#c4b62d',
  },
  actionPillSuccess: {
    backgroundColor: '#49ad67',
  },
  actionIconDanger: {
    backgroundColor: '#d7353a',
  },
  actionIconStatus: {
    backgroundColor: '#37c4c9',
  },
  actionIconWarning: {
    backgroundColor: '#d6ca2b',
  },
  actionIconSuccess: {
    backgroundColor: '#42a45f',
  },
})
