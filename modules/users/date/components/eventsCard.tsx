import { useState } from 'react'
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import {
  ArrowBigRight,
  EllipsisVertical,
  Pencil,
  Trash,
} from 'lucide-react-native'
import type { GoogleCalendarDate } from '@/lib/api'
import { generalColors } from '@/theme'

type EventCardProps = {
  appointment: GoogleCalendarDate
}

function formatTime(value?: string | null, timeZone?: string | null) {
  if (!value) return null
  if (!value.includes('T')) return null

  try {
    return new Intl.DateTimeFormat('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: timeZone || undefined,
    }).format(new Date(value))
  } catch {
    return new Intl.DateTimeFormat('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(value))
  }
}

function getAppointmentSchedule(appointment: GoogleCalendarDate) {
  const startTime = formatTime(appointment.startDateTime, appointment.timeZone)
  const endTime = formatTime(appointment.endDateTime, appointment.timeZone)

  if (!startTime || !endTime) return 'TODO EL DÍA'
  return `DE ${startTime} - ${endTime}`
}

function getAppointmentType(value?: string | null) {
  if (!value) return 'General'
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

export function EventCard({ appointment }: EventCardProps) {
  const [showOptions, setShowOptions] = useState(false)
  const [showInformation, setShowInformation] = useState(false)
  const appointmentType = appointment.appointmentType

  const isRent = appointmentType === 'renta'
  const isSale = appointmentType === 'venta'

  function toggleOptions() {
    setShowOptions(current => !current)
  }

  function toggleInformation() {
    setShowInformation(current => !current)
  }

  return (
    <View 
      style={[
        styles.container, 
        isRent && styles.rentContainer,
        isSale && styles.saleContainer
      ]}
    >
      <View style={styles.mainRow}>
        <Pressable
          style={styles.informationContainer}
          onPress={toggleInformation}
        >
          <View style={styles.dateContainer}>
            <Text style={styles.hourText}>
              {getAppointmentSchedule(appointment)}
            </Text>
            <View style={styles.line}/>
            <Text>
              {getAppointmentType(appointment.appointmentType)}
            </Text>
          </View>

          <Text style={styles.titleText}>
            {appointment.title || 'Cita sin título'}
          </Text>
          
        </Pressable>

        <Pressable
          style={styles.optionsButton}
          onPress={toggleOptions}
        >
          <EllipsisVertical/>
        </Pressable>

        {showOptions && (
          <View style={styles.actionsContainer}>
            <Pressable style={styles.actionButton}>
              <Pencil size={20} />
            </Pressable>

            <Pressable style={styles.actionButton}>
              <Trash size={20} />
            </Pressable>
          </View>
        )}
      </View>

      {showInformation && (
        <View style={styles.detailsContainer}>
          <Text>Cliente: No disponible</Text>
          <Text>Asesor encargado: 
            {appointment.advisorId || 'No disponible'}
          </Text>
          <Text>Contacto de apoyo: 
            {appointment.helpedBy || 'No disponible'}
          </Text>
          <Text>Ubicación: 
            {appointment.location || 'No especificada'}
          </Text>
          <Text>
            {appointment.description || 'Sin descripción.'}
          </Text>
        </View>
      )}
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#cfcfcf',
  },
  rentContainer:{
    backgroundColor: '#20722f'
  },
  saleContainer: {
    backgroundColor: '#257c88'
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  informationContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  dateContainer:{
    flexDirection: 'row',
    alignItems: 'baseline',
    alignContent: 'center',
    gap: 5
  },
  optionsButton: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FCFAF8',
  },
  actionButton: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsContainer: {
    padding: 16,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  hourText: {
    fontSize: 12,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },

  line:{
    borderWidth: .5,
    height: 10
  },
  threePoints:{
    flex: 1,

  },
  point:{
    flex: 1,
    backgroundColor: generalColors.black,
    
  }
})
