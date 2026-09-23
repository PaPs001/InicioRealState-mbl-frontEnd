import { Alert, View, ScrollView, Text, Pressable } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  cancelAnimation,
  Easing,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Calendar } from "../components/calendar";
import { EventCard } from "../components/eventsCard";
import { useEffect, useEffectEvent, useMemo, useState } from "react";
import type { GoogleCalendarDate } from "@/lib/api";
import { styles } from "./datePrincipalScreen.styles";
import LogoIRSPrincipal from "@/assets/logoIRSprincipal.svg";
import { useCalendarData } from "../context/CalendarDataContext";
import { useOperationMode } from "@/modules/settings";
import { AppointmentUpdateFlow } from "@/modules/users/main/hooks/useAppointmentUpdateFlow";
import { mapGoogleDateToAppointment } from "@/modules/users/main/utils/dashboard-formatters";
import {
  getAppointmentTypeOptions,
  isAppointmentType,
} from "@/lib/config/appointment-Types";
import { icons } from "@/assets";
import { router } from "expo-router";
const COLLAPSED_PANEL_HEIGHT = 470;
const PANEL_EXPANDED_GAP = 0;

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getAppointmentDateKey(appointment: GoogleCalendarDate) {
  return appointment.startDateTime?.slice(0, 10) ?? null;
}

function getDayName(date: Date) {
  const value = new Intl.DateTimeFormat("es-MX", { weekday: "long" }).format(
    date,
  );
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getMonthKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function formatAppointmentGroupDate(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`);
  const value = new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatAppointmentCount(count: number, type: string) {
  return `${count} ${count === 1 ? "cita" : "citas"} ${type}`;
}

export default function CalendarScreen() {
  const { capabilities } = useOperationMode();
  const enabledAppointmentTypes = useMemo(
    () =>
      getAppointmentTypeOptions().filter((type) => {
        const operation = type.parentType ?? type.value;
        if (operation === "renta") return capabilities.canViewRentals;
        if (operation === "venta") return capabilities.canViewSales;
        return true;
      }),
    [capabilities.canViewRentals, capabilities.canViewSales],
  );
  const {
    appointments,
    appointmentsError: loadError,
    isAppointmentsLoading: isLoading,
    deleteAppointment,
  } = useCalendarData();
  const filteredAppointments = useMemo(
    () =>
      appointments.filter((appointment) => {
        const type = appointment.appointmentType?.trim().toLowerCase();
        return (
          !isAppointmentType(type) ||
          enabledAppointmentTypes.some((option) => option.value === type)
        );
      }),
    [appointments, enabledAppointmentTypes],
  );
  const [screenHeight, setScreenHeight] = useState(0);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [calendarTop, setCalendarTop] = useState(0);
  const [calendarHeaderBottom, setCalendarHeaderBottom] = useState(64);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] =
    useState<GoogleCalendarDate | null>(null);
  const panelTranslateY = useSharedValue(0);
  const panelDragStartY = useSharedValue(0);

  const insets = useSafeAreaInsets();

  const panelExpandedTop =
    calendarTop + calendarHeaderBottom + PANEL_EXPANDED_GAP;
  const panelTop = Math.max(
    panelExpandedTop,
    screenHeight - COLLAPSED_PANEL_HEIGHT,
  );
  const panelTravelDistance = Math.max(0, panelTop - panelExpandedTop);

  const panelGesture = Gesture.Pan()
    .onBegin(() => {
      panelDragStartY.value = panelTranslateY.value;
    })
    .onUpdate((event) => {
      const nextPosition = panelDragStartY.value + event.translationY;
      panelTranslateY.value = Math.min(
        0,
        Math.max(-panelTravelDistance, nextPosition),
      );
    })
    .onEnd((event) => {
      const shouldExpand =
        event.velocityY < -500 ||
        panelTranslateY.value < -panelTravelDistance / 2;

      if (shouldExpand) {
        runOnJS(setIsPanelExpanded)(true);
      }

      panelTranslateY.value = withSpring(
        shouldExpand ? -panelTravelDistance : 0,
        { damping: 20, stiffness: 180 },
        (finished) => {
          if (finished && !shouldExpand) {
            runOnJS(setIsPanelExpanded)(false);
          }
        },
      );
    });

  const animatedPanelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: panelTranslateY.value }],
    height: Math.max(0, screenHeight - panelTop - panelTranslateY.value),
  }));

  useEffect(() => {
    if (isPanelExpanded) {
      panelTranslateY.value = -panelTravelDistance;
    }
  }, [panelTranslateY, panelTravelDistance]);

  const appointmentTypesByDate = useMemo(
    () =>
      filteredAppointments.reduce<Record<string, string[]>>(
        (result, appointment) => {
          const dateKey = getAppointmentDateKey(appointment);
          if (!dateKey) return result;

          const appointmentType = appointment.appointmentType
            ?.trim()
            .toLowerCase();
          const types = result[dateKey] ?? [];

          if (
            appointmentType &&
            isAppointmentType(appointmentType) &&
            !types.includes(appointmentType)
          ) {
            types.push(appointmentType);
          }

          result[dateKey] = types;
          return result;
        },
        {},
      ),
    [filteredAppointments],
  );

  const selectedDateKey = formatDateKey(selectedDate);
  const selectedAppointments = useMemo(
    () =>
      filteredAppointments
        .filter(
          (appointment) =>
            getAppointmentDateKey(appointment) === selectedDateKey,
        )
        .sort((first, second) =>
          (first.startDateTime ?? "").localeCompare(second.startDateTime ?? ""),
        ),
    [filteredAppointments, selectedDateKey],
  );

  const visibleMonthKey = getMonthKey(visibleMonth);
  const monthAppointments = useMemo(
    () =>
      filteredAppointments
        .filter((appointment) =>
          getAppointmentDateKey(appointment)?.startsWith(visibleMonthKey),
        )
        .sort((first, second) =>
          (first.startDateTime ?? "").localeCompare(second.startDateTime ?? ""),
        ),
    [filteredAppointments, visibleMonthKey],
  );

  const monthAppointmentGroups = useMemo(() => {
    const groups: Array<{
      dateKey: string;
      appointments: GoogleCalendarDate[];
    }> = [];

    monthAppointments.forEach((appointment) => {
      const dateKey = getAppointmentDateKey(appointment);
      if (!dateKey) return;

      const currentGroup = groups[groups.length - 1];
      if (currentGroup?.dateKey === dateKey) {
        currentGroup.appointments.push(appointment);
        return;
      }

      groups.push({ dateKey, appointments: [appointment] });
    });

    return groups;
  }, [monthAppointments]);

  const appointmentsForCurrentMode = isPanelExpanded
    ? monthAppointments
    : selectedAppointments;

  const visibleAppointments = isPanelExpanded
    ? appointmentsForCurrentMode
    : appointmentsForCurrentMode.slice(0, 9);

  const appointmentCountByType = useMemo(
    () =>
      Object.fromEntries(
        enabledAppointmentTypes.map((type) => [
          type.value,
          appointmentsForCurrentMode.filter(
            (appointment) =>
              appointment.appointmentType?.trim().toLowerCase() === type.value,
          ).length,
        ]),
      ),
    [appointmentsForCurrentMode, enabledAppointmentTypes],
  );

  const handleDeleteAppointment = (appointment: GoogleCalendarDate) => {
    const dateId = appointment._id;
    if (!dateId) {
      Alert.alert(
        "No se puede eliminar",
        "Esta cita no tiene un identificador válido.",
      );
      return;
    }

    Alert.alert(
      "Eliminar cita",
      `¿Quieres eliminar “${appointment.title || "Cita sin título"}”? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            void deleteAppointment(dateId).catch(() => {
              Alert.alert("Error", "No se pudo eliminar la cita.");
            });
          },
        },
      ],
    );
  };

  //// esto es solo una prueba
  const [widthContainer, setWidthContainer] = useState(0);
  const [widthColumn, setWidthColumn] = useState(0);
  const recorrido = Math.max(0, widthColumn - widthContainer);

  const needMovement = recorrido > 0;

  const desplazamiento = useSharedValue(0);
  useEffect(() => {
    cancelAnimation(desplazamiento);
    desplazamiento.value = 0;

    if (widthContainer <= 0 || widthColumn <= 0 || recorrido === 0) return;

    const velocidad = 30;
    const duracion = (recorrido / velocidad) * 2000;
    const opciones = {
      duration: duracion,
      easing: Easing.linear,
    };

    desplazamiento.value = withRepeat(
      withSequence(
        withDelay(2000, withTiming(-recorrido, opciones)),
        withDelay(2000, withTiming(0, opciones)),
      ),
      -1,
    );

    return () => cancelAnimation(desplazamiento);
  }, [widthContainer, widthColumn, recorrido, desplazamiento]);

  const estiloMovimiento = useAnimatedStyle(() => ({
    transform: [{ translateX: desplazamiento.value }],
  }));
  return (
    <SafeAreaView
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        setWidthColumn(width);
      }}
      style={styles.safeArea}
      edges={["left", "right", "bottom"]}
    >
      <View
        style={styles.screen}
        onLayout={(event) => setScreenHeight(event.nativeEvent.layout.height)}
      >
        <View style={styles.logoWrap}>
          <View style={{
            position: 'absolute',
            left: 15,
          }}>
            <Pressable style={{
              width: 70,
              height: 50,
              justifyContent: 'center',
            }} onPress={() => router.back()}>
              <icons.BackButton />
            </Pressable>
          </View>
          <LogoIRSPrincipal width={146} height={48} />
        </View>
        <View
          onLayout={(event) => {
            const { y } = event.nativeEvent.layout;
            setCalendarTop(y);
          }}
        >
          <Calendar
            appointmentTypesByDate={appointmentTypesByDate}
            selectedDate={selectedDate}
            visibleMonth={visibleMonth}
            onHeaderBottomChange={setCalendarHeaderBottom}
            onSelectDate={(date) => {
              setSelectedDate(date);
            }}
            onVisibleMonthChange={(date) => {
              setVisibleMonth(date);
              setSelectedDate(date);
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
            <View>
              <View style={styles.dragHandle}>
                <View style={styles.dragIndicator} />
              </View>
              <View
                style={{ overflow: "hidden" }}
                onLayout={(event) => {
                  setWidthContainer(event.nativeEvent.layout.width);
                }}
              >
                <View style={{ flexDirection: "row" }}>
                  <Animated.View
                    onLayout={(event) => {
                      setWidthColumn(event.nativeEvent.layout.width);
                    }}
                    style={[
                      styles.countButtonRow,
                      {
                        flexShrink: 0,
                        justifyContent: "flex-start",
                        paddingHorizontal: 10,
                      },
                      estiloMovimiento,
                    ]}
                  >
                    {enabledAppointmentTypes
                      .filter(
                        (type) => (appointmentCountByType[type.value] ?? 0) > 0,
                      )
                      .map((type) => (
                        <View
                          key={type.value}
                          style={[
                            styles.countSale,
                            { backgroundColor: type.color },
                          ]}
                        >
                          <Text
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            style={styles.eventText}
                          >
                            {formatAppointmentCount(
                              appointmentCountByType[type.value] ?? 0,
                              type.label.toLowerCase(),
                            )}
                          </Text>
                        </View>
                      ))}
                  </Animated.View>
                </View>
              </View>
            </View>
          </GestureDetector>
          <View style={styles.eventsContent}>
            <View style={styles.eventCardsTitleContainer}>
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
                    <Text style={styles.dateText}>
                      {selectedDate.getDate()}
                    </Text>
                  </View>
                  <View style={styles.line} />
                </>
              ) : null}
            </View>
            <ScrollView
              style={styles.eventsScroll}
              contentContainerStyle={[
                styles.contentEventCard,
                { paddingBottom: insets.bottom + 70 },
              ]}
              //scrollEnabled={isPanelExpanded}
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
              ) : isPanelExpanded ? (
                monthAppointmentGroups.map((group) => (
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
                          onDelete={handleDeleteAppointment}
                          onEdit={setAppointmentToEdit}
                          key={
                            appointment._id ??
                            appointment.googleEventId ??
                            `${appointment.startDateTime}-${index}`
                          }
                        />
                      ))}
                    </View>
                  </View>
                ))
              ) : (
                visibleAppointments.map((appointment, index) => (
                  <EventCard
                    appointment={appointment}
                    onDelete={handleDeleteAppointment}
                    onEdit={setAppointmentToEdit}
                    key={
                      appointment._id ??
                      appointment.googleEventId ??
                      `${appointment.startDateTime}-${index}`
                    }
                  />
                ))
              )}
            </ScrollView>
          </View>
        </Animated.View>
      </View>
      {appointmentToEdit ? (
        <AppointmentUpdateFlow
          appointment={mapGoogleDateToAppointment(appointmentToEdit)}
          visible
          onClose={() => setAppointmentToEdit(null)}
        />
      ) : null}
    </SafeAreaView>
  );
}
