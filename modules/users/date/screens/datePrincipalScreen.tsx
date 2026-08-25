import { View, ScrollView, Text } from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from "react-native-reanimated"
import { Calendar } from "../components/calendar"
import {EventCard} from "../components/eventsCard"
import { useEffect, useMemo, useState } from "react"
import type { GoogleCalendarDate } from "@/lib/api"
import {styles} from './datePrincipalScreen.styles'
import LogoIRSPrincipal from "@/assets/logoIRSprincipal.svg"
import { useCalendarData } from "../context/CalendarDataContext"

const COLLAPSED_PANEL_HEIGHT = 300
const PANEL_EXPANDED_GAP = 0

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

function formatAppointmentGroupDate(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`)
  const value = new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date)

  return value.charAt(0).toUpperCase() + value.slice(1)
}

function formatAppointmentCount(count: number, type: string) {
  return `${count} ${count === 1 ? "cita" : "citas"} ${type}`
}

export default function CalendarScreen(){
  const {
    appointments,
    appointmentsError: loadError,
    isAppointmentsLoading: isLoading,
  } = useCalendarData()
  const [screenHeight, setScreenHeight] = useState(0)
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  )
  const [calendarTop, setCalendarTop] = useState(0)
  const [calendarHeaderBottom, setCalendarHeaderBottom] = useState(64)
  const [isPanelExpanded, setIsPanelExpanded] = useState(false)
  const panelTranslateY = useSharedValue(0)
  const panelDragStartY = useSharedValue(0)


  const insets = useSafeAreaInsets();

  const panelExpandedTop =
    calendarTop + calendarHeaderBottom + PANEL_EXPANDED_GAP
  const panelTop = Math.max(
    panelExpandedTop,
    screenHeight - COLLAPSED_PANEL_HEIGHT,
  )
  const panelTravelDistance = Math.max(0, panelTop - panelExpandedTop)

  const panelGesture = Gesture.Pan()
    .onBegin(() => {
      panelDragStartY.value = panelTranslateY.value
    })
    .onUpdate(event => {
      const nextPosition = panelDragStartY.value + event.translationY
      panelTranslateY.value = Math.min(
        0,
        Math.max(-panelTravelDistance, nextPosition),
      )
    })
    .onEnd(event => {
      const shouldExpand =
        event.velocityY < -500 ||
        panelTranslateY.value < -panelTravelDistance / 2

      if (shouldExpand) {
        runOnJS(setIsPanelExpanded)(true)
      }

      panelTranslateY.value = withSpring(
        shouldExpand ? -panelTravelDistance : 0,
        { damping: 20, stiffness: 180 },
        finished => {
          if (finished && !shouldExpand) {
            runOnJS(setIsPanelExpanded)(false)
          }
        },
      )
    })

  const animatedPanelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: panelTranslateY.value }],
    height: Math.max(
      0,
      screenHeight - panelTop - panelTranslateY.value,
    ),
  }))

  useEffect(() => {
    if (isPanelExpanded) {
      panelTranslateY.value = -panelTravelDistance
    }
  }, [panelTranslateY, panelTravelDistance])

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

  const monthAppointmentGroups = useMemo(() => {
    const groups: Array<{
      dateKey: string
      appointments: GoogleCalendarDate[]
    }> = []

    monthAppointments.forEach(appointment => {
      const dateKey = getAppointmentDateKey(appointment)
      if (!dateKey) return

      const currentGroup = groups[groups.length - 1]
      if (currentGroup?.dateKey === dateKey) {
        currentGroup.appointments.push(appointment)
        return
      }

      groups.push({ dateKey, appointments: [appointment] })
    })

    return groups
  }, [monthAppointments])

  const appointmentsForCurrentMode = isPanelExpanded
    ? monthAppointments
    : selectedAppointments

  const visibleAppointments = isPanelExpanded
    ? appointmentsForCurrentMode
    : appointmentsForCurrentMode.slice(0, 1)

  const rentCount = appointmentsForCurrentMode.filter(
    appointment => appointment.appointmentType?.toLowerCase() === "renta",
  ).length
  const saleCount = appointmentsForCurrentMode.filter(
    appointment => appointment.appointmentType?.toLowerCase() === "venta",
  ).length

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
        <View
          style={styles.screen}
          onLayout={event => setScreenHeight(event.nativeEvent.layout.height)}
        >
          <View style={styles.logoWrap}>
            <LogoIRSPrincipal width={146} height={48} />
          </View>
          <View
            onLayout={event => {
              const { y } = event.nativeEvent.layout
              setCalendarTop(y)
            }}
          >
            <Calendar
              appointmentTypesByDate={appointmentTypesByDate}
              selectedDate={selectedDate}
              visibleMonth={visibleMonth}
              onHeaderBottomChange={setCalendarHeaderBottom}
              onSelectDate={date => {
                setSelectedDate(date)
              }}
              onVisibleMonthChange={date => {
                setVisibleMonth(date)
                setSelectedDate(date)
              }}
            />
          </View>
          <Animated.View
            style={[
              styles.eventCardsContainer,
              { top: panelTop },
              animatedPanelStyle,
            ]}
          >
              <GestureDetector gesture={panelGesture}>
                <View style={styles.dragHandle}>
                  <View style={styles.dragIndicator} />
                </View>
              </GestureDetector>
            <View style={styles.eventsContent}>
              <View style={styles.eventSpace}>
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={styles.eventText}>
                  {formatAppointmentCount(rentCount, "renta")} | {formatAppointmentCount(saleCount, "venta")}
                </Text>
              </View>
              <View style={styles.eventCardsTitleContainer}> {/** este view se eliminara no tiene una necesidad de estar ahi por ahora eso se esta notando */}
                {!isPanelExpanded ? (
                  <>
                    <View style={styles.dateContain}>
                      {/*<Text style={styles.todayText}>{isPanelExpanded ? "Mes" : "Fecha"}</Text>*/}
                      <Text
                        style={styles.dayText}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                      >
                        {getDayName(selectedDate)}
                      </Text>
                      <Text style={styles.dateText}>{selectedDate.getDate()}</Text>
                    </View>
                    <View style={styles.line}/>
                  </>
                ): null}
              </View>
              <ScrollView
                style={styles.eventsScroll}
                contentContainerStyle={[styles.contentEventCard, {paddingBottom: insets.bottom + 70}]}
                scrollEnabled={isPanelExpanded}
                showsVerticalScrollIndicator={isPanelExpanded}
              >
                {isLoading ? (
                  <View style={styles.datesContainer}>
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      style={styles.eventText}
                    >
                      Cargando citas...
                    </Text>
                  </View>
                ) : loadError ? (
                  <View>
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      style={styles.eventText}
                    >
                      {loadError}
                    </Text>
                  </View>
                ) : visibleAppointments.length === 0 ? (
                  <View style={styles.datesContainer}>
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      style={styles.eventText}
                    >
                      No hay citas para esta fecha.
                    </Text>
                  </View>
                ) : (
                  isPanelExpanded ? (
                    monthAppointmentGroups.map(group => (
                      <View key={group.dateKey} style={styles.appointmentGroup}>
                        <View style={styles.appointmentGroupHeader}>
                          <Text style={styles.appointmentGroupDate}>
                            {formatAppointmentGroupDate(group.dateKey)}
                          </Text>
                          <View style={styles.appointmentGroupLine} />
                        </View>

                        <View style={styles.appointmentGroupCards}>
                          {group.appointments.map((appointment, index) => (
                            <EventCard
                              appointment={appointment}
                              key={appointment._id ?? appointment.googleEventId ?? `${appointment.startDateTime}-${index}`}
                            />
                          ))}
                        </View>
                      </View>
                    ))
                  ) : (
                    visibleAppointments.map((appointment, index) => (
                      <EventCard
                        appointment={appointment}
                        key={appointment._id ?? appointment.googleEventId ?? `${appointment.startDateTime}-${index}`}
                      />
                    ))
                  )
                )}
              </ScrollView>
            </View>
          </Animated.View>
        </View>
    </SafeAreaView>
  )
}
