import { StyleSheet, View, ScrollView, Text, Pressable } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Calendar } from "../components/calendar"
import {EventCard} from "../components/eventsCard"
import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react-native"
import { useAuth } from "@/contexts/AuthContext"
import { getGoogleCalendarDates, type GoogleCalendarDate } from "@/lib/api"
import {styles} from './datePrincipalScreen.styles'

function formatDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function getAppointmentDateKey(appointment: GoogleCalendarDate) {
  return appointment.startDateTime?.slice(0, 10) ?? null
}

function getDayName(date: Date) {
  const value = new Intl.DateTimeFormat("es-MX", { weekday: "long" }).format(date)
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function getMonthKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  return `${year}-${month}`
}

function getMonthName(date: Date) {
  const value = new Intl.DateTimeFormat("es-MX", {
    month: "long",
    year: "numeric",
  }).format(date)

  return value.charAt(0).toUpperCase() + value.slice(1)
}

function formatAppointmentCount(count: number, type: string) {
  return `${count} ${count === 1 ? "cita" : "citas"} ${type}`
}

export default function CalendarScreen(){
  const { authToken } = useAuth()
  const [appointments, setAppointments] = useState<GoogleCalendarDate[]>([])
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  )
  const [seeAll, setSeeAll] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const hasLoadedInitialAppointmentsRef = useRef(false)

  useEffect(() => {
    let isMounted = true

    if (!authToken) {
      setAppointments([])
      hasLoadedInitialAppointmentsRef.current = false
      return () => {
        isMounted = false
      }
    }
    if (hasLoadedInitialAppointmentsRef.current) {
      return () => {
        isMounted = false
      }
    }

    hasLoadedInitialAppointmentsRef.current = true
    console.info("[CalendarScreen][initial-load]", { service: "appointments" })
    setIsLoading(true)
    setLoadError(null)

    getGoogleCalendarDates(authToken)
      .then(result => {
        if (isMounted) setAppointments(result)
      })
      .catch(error => {
        if (!isMounted) return
        console.warn("[dates] No se pudieron cargar las citas:", error)
        setLoadError("No se pudieron cargar las citas.")
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [authToken])

  const appointmentTypesByDate = useMemo(
    () => appointments.reduce<Record<string, {
      renta: boolean
      venta: boolean
      general: boolean
    }>>((result, appointment) => {
      const dateKey = getAppointmentDateKey(appointment)
      if (!dateKey) return result

      const types = result[dateKey] ?? {
        renta: false,
        venta: false,
        general: false,
      }
      const appointmentType = appointment.appointmentType?.toLowerCase()

      if (appointmentType === "renta") types.renta = true
      if (appointmentType === "venta") types.venta = true
      if (appointmentType === "general") types.general = true

      result[dateKey] = types
      return result
    }, {}),
    [appointments],
  )

  const selectedDateKey = formatDateKey(selectedDate)
  const selectedAppointments = useMemo(
    () => appointments
      .filter(appointment => getAppointmentDateKey(appointment) === selectedDateKey)
      .sort((first, second) =>
        (first.startDateTime ?? "").localeCompare(second.startDateTime ?? "")),
    [appointments, selectedDateKey],
  )

  const visibleMonthKey = getMonthKey(visibleMonth)
  const monthAppointments = useMemo(
    () => appointments
      .filter(appointment => getAppointmentDateKey(appointment)?.startsWith(visibleMonthKey))
      .sort((first, second) =>
        (first.startDateTime ?? "").localeCompare(second.startDateTime ?? "")),
    [appointments, visibleMonthKey],
  )

  const visibleAppointments = seeAll
    ? monthAppointments
    : selectedAppointments

  const rentCount = visibleAppointments.filter(
    appointment => appointment.appointmentType?.toLowerCase() === "renta",
  ).length
  const saleCount = visibleAppointments.filter(
    appointment => appointment.appointmentType?.toLowerCase() === "venta",
  ).length

  function toggleAllEvents(){
    setSeeAll(current => !current)
  }

  function changeVisibleMonth(offset: number) {
    const nextMonth = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth() + offset,
      1,
    )
    setVisibleMonth(nextMonth)
    setSelectedDate(nextMonth)
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
        <View style={styles.screen}>
          {!seeAll && (
            <Calendar
              appointmentTypesByDate={appointmentTypesByDate}
              selectedDate={selectedDate}
              visibleMonth={visibleMonth}
              onSelectDate={date => {
                setSelectedDate(date)
              }}
              onVisibleMonthChange={date => {
                setVisibleMonth(date)
                setSelectedDate(date)
              }}
            />
          )}
          <View style={styles.eventCardsContainer}>
            {seeAll && (
              <View style={styles.monthSelector}>
                <Pressable
                  onPress={() => changeVisibleMonth(-1)}
                  style={styles.monthNavigationButton}
                >
                  <ChevronLeft size={22} color="#19191F" />
                </Pressable>
                <Text style={styles.monthSelectorText}>
                  {getMonthName(visibleMonth)}
                </Text>
                <Pressable
                  onPress={() => changeVisibleMonth(1)}
                  style={styles.monthNavigationButton}
                >
                  <ChevronRight size={22} color="#19191F" />
                </Pressable>
              </View>
            )}
            <View style={styles.eventCardsTitleContainer}>
              <View style={styles.dateContain}>
                <Text style={styles.todayText}>{seeAll ? "Todas" : "Fecha"}</Text>
                <Text style={styles.dateText}>{seeAll ? monthAppointments.length : selectedDate.getDate()}</Text>
                <Text style={styles.dayText}>{seeAll ? "citas" : getDayName(selectedDate)}</Text>
              </View>
              <View style={styles.eventSpace}>
                <Text style={styles.eventText}>
                  {formatAppointmentCount(rentCount, "renta")} | {formatAppointmentCount(saleCount, "venta")}
                </Text>
                {!seeAll ? (
                  <Pressable 
                    onPress={toggleAllEvents}
                    style={styles.viewAllButton}>
                    <Text style={styles.viewAllText}>Ver todos</Text>
                  </Pressable>
                ) : (
                  <Pressable 
                    onPress={toggleAllEvents}
                    style={styles.viewAllButton}>
                    <Text style={styles.viewAllText}>Ver menos</Text>
                  </Pressable>
                )}
              </View>
            </View>
            <ScrollView 
              style={styles.eventsScroll}
              contentContainerStyle={styles.contentEventCard}
              showsVerticalScrollIndicator={false}>
              {isLoading ? (
                <Text style={styles.eventText}>Cargando citas...</Text>
              ) : loadError ? (
                <Text style={styles.eventText}>{loadError}</Text>
              ) : visibleAppointments.length === 0 ? (
                <Text style={styles.eventText}>No hay citas para esta fecha.</Text>
              ) : (
                visibleAppointments.map((appointment, index) => (
                  <EventCard
                    appointment={appointment}
                    key={appointment._id ?? appointment.googleEventId ?? `${appointment.startDateTime}-${index}`}
                  />
                ))
              )}
            </ScrollView>
          </View>
        </View>
    </SafeAreaView>
  )
}
