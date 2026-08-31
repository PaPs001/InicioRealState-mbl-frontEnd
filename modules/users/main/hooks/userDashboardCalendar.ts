import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

import type { AppointmentPreviewItem } from "@/modules/users/main/types";
import { mapGoogleDateToAppointment } from "@/modules/users/main/utils/dashboard-formatters";
import { disconnectGoogleCalendar, getGoogleCalendarAuthUrl } from "@/lib/api";
import type { AppCapabilities } from "@/modules/settings";
import { useCalendarData } from "@/modules/users/date/context/CalendarDataContext";

type UseDashboardCalendarParams = {
  authToken: string | null;
  capabilities?: AppCapabilities;
  returnPath?: string;
};

export type AppointmentSelectionScreen = "lead" | "property" | null;
export type AppointmentLeadMode = "existing" | "provisional";

export type ProvisionalAppointmentLead = {
  fullName: string;
  phone: string;
  email: string;
};

const DEFAULT_CALENDAR_MESSAGE =
  "Conecta Google Calendar para cargar tus citas reales.";

export function useDashboardCalendar({
  authToken,
  capabilities,
  returnPath,
}: UseDashboardCalendarParams) {
  const [calendarMessage, setCalendarMessage] = useState(
    DEFAULT_CALENDAR_MESSAGE,
  );
  const {
    appointments: calendarDates,
    calendars: googleCalendars,
    selectedCalendars: selectedGoogleCalendars,
    connectionStatus: googleConnectionStatus,
    isAppointmentsLoading: isCalendarLoading,
    isSettingsLoading: isCalendarSettingsLoading,
    isSavingSelection: isSavingCalendarSelection,
    clearCalendarData,
    loadAppointments,
    loadSettings,
    markPrimaryCalendar,
    saveCalendarSelection,
    toggleCalendar,
    updateAppointment,
    deleteAppointment,
  } = useCalendarData();
  const [isConnectingCalendar, setIsConnectingCalendar] = useState(false);
  const [isDisconnectingCalendar, setIsDisconnectingCalendar] = useState(false);

  const [isAppointmentModalVisible, setIsAppointmentModalVisible] =
    useState(false);

  // Estados para modal de informacion, eliminacion y edicion de la cita
  const [isAppointmentInformationVisible, setisAppointmentInformationVisible] =
    useState(false);
  const [isEditionSectionVisible, setIsEditionSectionVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentPreviewItem | null>(null);

  const selectAppointment = useCallback(
    (appointment: AppointmentPreviewItem) => {
      const isSameAppointment = appointment.id
        ? selectedAppointment?.id === appointment.id
        : selectedAppointment === appointment;

      if (isSameAppointment) {
        setSelectedAppointment(null);
        setisAppointmentInformationVisible(false);
        setIsEditionSectionVisible(false);
        return;
      }

      setSelectedAppointment(appointment);
      setisAppointmentInformationVisible(true);
      setIsEditionSectionVisible(false);
    },
    [selectedAppointment],
  );

  const openAppointmentEdition = useCallback(() => {
    setisAppointmentInformationVisible(false);
    setIsEditionSectionVisible(true);
  }, []);

  const closeAppointmentInformation = useCallback(() => {
    setisAppointmentInformationVisible(false);
    setSelectedAppointment(null);
  }, []);

  const closeAppointmentEdition = useCallback(() => {
    setIsEditionSectionVisible(false);
    setSelectedAppointment(null);
  }, []);

  const [appointmentSelectionScreen, setAppointmentSelectionScreen] =
    useState<AppointmentSelectionScreen>(null);
  const [appointmentLeadMode, setAppointmentLeadMode] =
    useState<AppointmentLeadMode>("existing");
  const [provisionalAppointmentLead, setProvisionalAppointmentLead] =
    useState<ProvisionalAppointmentLead>({
      fullName: "",
      phone: "",
      email: "",
    });
  const calendarAppointments = useMemo(
    () =>
      calendarDates
        .map(mapGoogleDateToAppointment)
        .filter(isAppointmentFromCurrentWeek)
        .sort((current, next) => current.sortTime - next.sortTime),
    [calendarDates],
  );

  useEffect(() => {
    if (!authToken) {
      setCalendarMessage("Inicia sesion para cargar tus citas reales.");
      return;
    }
    if (googleConnectionStatus?.status === "requires_reconnect") {
      setCalendarMessage("Reconecta Google Calendar para recuperar tus citas.");
      return;
    }
    if (calendarAppointments.length) {
      setCalendarMessage("");
      return;
    }
    if (googleConnectionStatus?.connected) {
      setCalendarMessage("No hay citas de Google para esta semana.");
    }
  }, [authToken, calendarAppointments.length, googleConnectionStatus]);

  const loadGoogleCalendarAppointments = useCallback(
    async (options: { sync?: boolean } = {}) => {
      if (!authToken) {
        setCalendarMessage("Inicia sesion para cargar tus citas reales.");
        return;
      }

      try {
        const dates = await loadAppointments(options);
        const appointments = dates
          .map(mapGoogleDateToAppointment)
          .filter(isAppointmentFromCurrentWeek)
          .sort((current, next) => current.sortTime - next.sortTime);

        setCalendarMessage(
          appointments.length ? "" : "No hay citas de Google para esta semana.",
        );
      } catch (error) {
        console.warn(
          "No se pudieron cargar las citas de Google Calendar:",
          error,
        );
        try {
          await loadSettings();
          setCalendarMessage(
            googleConnectionStatus?.status === "requires_reconnect"
              ? "Reconecta Google Calendar para recuperar tus citas."
              : DEFAULT_CALENDAR_MESSAGE,
          );
        } catch {
          setCalendarMessage(DEFAULT_CALENDAR_MESSAGE);
        }
      }
    },
    [authToken, googleConnectionStatus?.status, loadAppointments, loadSettings],
  );

  const loadGoogleCalendarSettings = loadSettings;

  const connectGoogleCalendar = useCallback(async () => {
    if (!authToken || isConnectingCalendar) return;

    setIsConnectingCalendar(true);
    try {
      const returnTo = Linking.createURL((returnPath ?? "").replace(/^\//, ""));
      const response = await getGoogleCalendarAuthUrl(authToken, returnTo);
      const result = await WebBrowser.openAuthSessionAsync(
        response.url,
        returnTo,
      );

      if (result.type === "success") {
        await Promise.all([
          loadGoogleCalendarSettings(),
          loadGoogleCalendarAppointments({ sync: true }),
        ]);
      }
    } catch (error) {
      console.warn("No se pudo conectar Google Calendar:", error);
    } finally {
      setIsConnectingCalendar(false);
    }
  }, [
    authToken,
    isConnectingCalendar,
    loadGoogleCalendarAppointments,
    loadGoogleCalendarSettings,
    returnPath,
  ]);

  const disconnectCalendar = useCallback(() => {
    if (!authToken || isDisconnectingCalendar) return;

    Alert.alert(
      "Desconectar Google",
      "Quieres desconectar la cuenta de Google de esta sesion?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Desconectar",
          style: "destructive",
          onPress: async () => {
            setIsDisconnectingCalendar(true);
            try {
              await disconnectGoogleCalendar(authToken);
              clearCalendarData();
              setCalendarMessage("Google Calendar fue desconectado.");
            } catch (error) {
              console.warn("No se pudo desconectar Google Calendar:", error);
            } finally {
              setIsDisconnectingCalendar(false);
            }
          },
        },
      ],
    );
  }, [authToken, clearCalendarData, isDisconnectingCalendar]);

  const getCalendarSelection = useCallback(
    (calendarId?: string) =>
      selectedGoogleCalendars.find(
        (calendar) => calendar.calendarId === calendarId,
      ),
    [selectedGoogleCalendars],
  );

  const toggleGoogleCalendar = toggleCalendar;
  const markPrimaryGoogleCalendar = markPrimaryCalendar;

  const saveGoogleCalendarSelection = useCallback(async () => {
    if (!authToken || isSavingCalendarSelection) return;

    try {
      await saveCalendarSelection();
      Alert.alert(
        "Calendarios guardados",
        "La seleccion fue guardada y las citas fueron sincronizadas.",
      );
    } catch (error) {
      console.warn("No se pudo guardar la seleccion de calendarios:", error);
    }
  }, [
    authToken,
    isSavingCalendarSelection,
    saveCalendarSelection,
    selectedGoogleCalendars,
  ]);

  const changeAppointmentLeadMode = useCallback((mode: AppointmentLeadMode) => {
    setAppointmentLeadMode(mode);
    setAppointmentSelectionScreen(null);
  }, []);

  const updateProvisionalAppointmentLead = useCallback(
    (field: keyof ProvisionalAppointmentLead, value: string) => {
      setProvisionalAppointmentLead((currentLead) => ({
        ...currentLead,
        [field]: value,
      }));
    },
    [],
  );

  const handleDeleteAppointment = useCallback(
    (dateId: string) => {
      Alert.alert("Eliminar cita", "¿Seguro que deseas eliminar la cita?", [
        {
          text: "cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          onPress: () => deleteAppointment(dateId),
        },
      ]);
    },
    [deleteAppointment],
  );

  const visibleCalendarAppointments = useMemo(
    () =>
      calendarAppointments.filter((appointment) =>
        canShowAppointment(appointment, capabilities),
      ),
    [calendarAppointments, capabilities],
  );

  const enabledSelectedCalendars = useMemo(
    () =>
      selectedGoogleCalendars.filter((calendar) => calendar.enabled !== false),
    [selectedGoogleCalendars],
  );

  const needsGoogleReconnect =
    googleConnectionStatus?.status === "requires_reconnect";
  const isGoogleConnected = googleConnectionStatus?.connected === true;

  return {
    appointmentLeadMode,
    appointmentSelectionScreen,
    calendarAppointments,
    calendarMessage,
    changeAppointmentLeadMode,
    connectGoogleCalendar,
    disconnectCalendar,
    enabledSelectedCalendars,
    getCalendarSelection,
    googleCalendars,
    googleConnectionStatus,
    isAppointmentModalVisible,
    isCalendarLoading,
    isCalendarSettingsLoading,
    isConnectingCalendar,
    isDisconnectingCalendar,
    isGoogleConnected,
    isSavingCalendarSelection,
    isAppointmentInformationVisible,
    isEditionSectionVisible,
    loadGoogleCalendarAppointments,
    loadGoogleCalendarSettings,
    markPrimaryGoogleCalendar,
    needsGoogleReconnect,
    provisionalAppointmentLead,
    saveGoogleCalendarSelection,
    selectedGoogleCalendars,
    setAppointmentSelectionScreen,
    setIsAppointmentModalVisible,
    setIsEditionSectionVisible,
    setisAppointmentInformationVisible,
    toggleGoogleCalendar,
    updateProvisionalAppointmentLead,
    visibleCalendarAppointments,
    setSelectedAppointment,
    selectedAppointment,
    /// funciones de seleccion, edicion y eliminado de cita
    selectAppointment,
    openAppointmentEdition,
    closeAppointmentEdition,
    closeAppointmentInformation,
    handleDeleteAppointment,
  };
}

function isAppointmentFromCurrentWeek(appointment: AppointmentPreviewItem) {
  const today = new Date();
  const startOfWeek = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - ((today.getDay() + 6) % 7),
  );
  const startOfNextWeek = new Date(
    startOfWeek.getFullYear(),
    startOfWeek.getMonth(),
    startOfWeek.getDate() + 7,
  );

  return (
    appointment.sortTime !== Number.MAX_SAFE_INTEGER &&
    appointment.sortTime >= startOfWeek.getTime() &&
    appointment.sortTime < startOfNextWeek.getTime()
  );
}

function canShowAppointment(
  appointment: AppointmentPreviewItem,
  capabilities?: AppCapabilities,
) {
  if (!capabilities) return true;

  const type = appointment.appointmentType;
  if (type === "renta") return capabilities.canViewRentals;
  if (type === "venta") return capabilities.canViewSales;

  return true;
}
