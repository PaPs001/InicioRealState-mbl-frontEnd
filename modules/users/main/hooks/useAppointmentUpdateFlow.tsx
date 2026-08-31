import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";

import type {
  AppointmentType,
  SelectedGoogleCalendar,
  UpdateGoogleCalendarDatePayload,
} from "@/lib/api";
import type { AppointmentPreviewItem } from "@/modules/users/main/types";
import { useSessionDomain } from "@/contexts/auth/use-session-domain";
import { useCalendarData } from "../../date/context/CalendarDataContext";
import { UpdateDateModal } from "../components/Advisors/UpdateDateModal";

import { useDashboardLeads } from "./userDashboardLeads";
import { useDashboardProperties } from "./userDashboardProperties";
import type { Property, PropertyLead } from "@/lib/types";

type SelectionScreen = "lead" | "property" | null;

type Params = {
  appointment: AppointmentPreviewItem;
  visible: boolean;
  onClose: () => void;
};

export function useAppointmentUpdateFlow({
  appointment,
  visible,
  onClose,
}: Params) {
  const {
    updateAppointment,
    loadAppointments,
    loadSettings,
    selectedCalendars,
    isSettingsLoading,
  } = useCalendarData();

  const [isUpdating, setIsUpdating] = useState(false);
  const [form, setForm] = useState<UpdateGoogleCalendarDatePayload>({});
  const enabledCalendars = useMemo(
    () => selectedCalendars.filter((calendar) => calendar.enabled !== false),
    [selectedCalendars],
  );

  const { authToken, currentUser } = useSessionDomain();
  
  const{
    appointmentLeadOptions,
    isLeadsLoading,
    loadLeads
  } = useDashboardLeads({authToken})
  
  const properties = useDashboardProperties(form.appointmentType);

  const [selectionScreen, setSelectionScreen] = useState<SelectionScreen>(null);
  const selectedLead = useMemo(
    () => appointmentLeadOptions.find((lead) => lead.id === form.leadId),
    [appointmentLeadOptions, form.leadId],
  );
  const selectedProperty = useMemo(
    () =>
      properties.filteredAppointmentPropertyOptions.find(
        (property) => getPropertyId(property) === form.propertyId,
      ),
    [form.propertyId, properties.filteredAppointmentPropertyOptions],
  );

  useEffect(() => {
    if (!visible) return;
    setForm({
      title: appointment.title ?? "",
      description: appointment.description ?? "",
      location: appointment.location ?? "",
      appointmentType:
        appointment.appointmentType === "renta" ||
        appointment.appointmentType === "venta"
          ? appointment.appointmentType
          : "general",
      startDateTime: appointment.startDateTime,
      endDateTime: appointment.endDateTime,
      calendarId: appointment.calendarId ?? undefined,
      leadId: appointment.leadId ?? null,
      propertyId: appointment.propertyId ?? null,
      advisorId: appointment.advisorId ?? null,
      externalAdvisorName: appointment.externalAdvisorName ?? null,
      helpedBy: appointment.helpedBy ?? null,
      timeZone: appointment.timeZone ?? "America/Mexico_City",
    });
    setSelectionScreen(null);
  }, [appointment, visible]);

  useEffect(() => {
    if (!visible) return;
    void Promise.all([loadSettings(), loadLeads()]);
  }, [loadLeads, loadSettings, visible]);

  const updateField = useCallback(
    (field: keyof UpdateGoogleCalendarDatePayload, value: string | null) => {
      setForm((current) => ({
        ...current,
        [field]: value,
      }));
    },
    [],
  );

  const selectCalendar = useCallback((calendar: SelectedGoogleCalendar) => {
    const appointmentType = normalizeAppointmentType(calendar.appointmentType);
    setForm((current) => ({
      ...current,
      calendarId: calendar.calendarId,
      appointmentType,
      colorId: calendar.colorId ?? null,
      ...(appointmentType === "general"
        ? { leadId: null, propertyId: null }
        : {}),
    }));
  }, []);

  const selectAppointmentType = useCallback(
    (appointmentType: AppointmentType) => {
      const matchingCalendars = enabledCalendars.filter(
        (calendar) => normalizeAppointmentType(calendar.appointmentType) === appointmentType,
      );
      const selectedCalendar =
        matchingCalendars.find((calendar) => calendar.calendarId === form.calendarId) ??
        matchingCalendars.find((calendar) => calendar.primaryForCreate) ??
        matchingCalendars[0];

      if (!selectedCalendar) {
        Alert.alert(
          "Calendario no disponible",
          `No hay un calendario habilitado para citas de tipo ${appointmentType}.`,
        );
        return;
      }

      setForm((current) => ({
        ...current,
        appointmentType,
        calendarId: selectedCalendar.calendarId,
        colorId: selectedCalendar.colorId ?? null,
        ...(appointmentType === "general"
          ? { leadId: null, propertyId: null }
          : {}),
      }));
    },
    [enabledCalendars, form.calendarId],
  );

  const selectLead = useCallback(
    (lead: PropertyLead) => {
      setForm((current) => ({
        ...current,
        leadId: lead.id,
        propertyId: lead.propertyId || current.propertyId,
        advisorId:
          lead.advisorId ||
          lead.agentId ||
          currentUser?.id ||
          current.advisorId ||
          null,
      }));
      setSelectionScreen(null);
    },
    [currentUser?.id],
  );

  const selectProperty = useCallback((property: Property) => {
    const propertyId = getPropertyId(property);
    if (!propertyId) return;
    setForm((current) => ({ ...current, propertyId }));
    setSelectionScreen(null);
  }, []);

  const clearLead = useCallback(() => {
    setForm((current) => ({ ...current, leadId: null }));
    setSelectionScreen(null);
  }, []);

  const clearProperty = useCallback(() => {
    setForm((current) => ({ ...current, propertyId: null }));
    setSelectionScreen(null);
  }, []);

  const assignCurrentUser = useCallback(() => {
    setForm((current) => ({
      ...current,
      advisorId: currentUser?.id || null,
      externalAdvisorName: null,
    }));
  }, [currentUser?.id, currentUser?.name]);

  const assignOtherAdvisor = useCallback(() => {
    setForm((current) => ({
      ...current,
      advisorId: null,
      externalAdvisorName:
        current.advisorId === currentUser?.id
          ? ""
          : current.externalAdvisorName || "",
    }));
  }, [currentUser?.id]);

  const submitUpdate = useCallback(async () => {
    if (!appointment.id) {
      console.warn("[AppointmentUpdateFlow] No se puede actualizar: falta appointment.id", {
        appointment,
      });
      return;
    }

    if (isUpdating) {
      console.info("[AppointmentUpdateFlow] Envío ignorado: ya hay una actualización en curso");
      return;
    }

    if (!form.title?.trim()) {
      console.warn("[AppointmentUpdateFlow] Validación fallida: título vacío", {
        dateId: appointment.id,
        form,
      });
      Alert.alert("Faltan datos", "Eltitulo de la cita es obligatorio");
      return;
    }

    if (!form.startDateTime?.trim()) {
      console.warn("[AppointmentUpdateFlow] Validación fallida: fecha de inicio vacía", {
        dateId: appointment.id,
        form,
      });
      Alert.alert("Faltan datos", "La fecha de la ccita es obligatoria");
      return;
    }

    setIsUpdating(true);
    let stage: "patch" | "reload" = "patch";

    try {
      console.info("[AppointmentUpdateFlow] Enviando actualización", {
        dateId: appointment.id,
        payload: form,
      });

      await updateAppointment(appointment.id, form);

      console.info("[AppointmentUpdateFlow] PATCH completado; recargando citas", {
        dateId: appointment.id,
      });
      stage = "reload";
      await loadAppointments();

      console.info("[AppointmentUpdateFlow] Flujo completado", {
        dateId: appointment.id,
      });

      Alert.alert(
        "Cita actualizada",
        "Los cambios fueron guardados correctamente",
      );

      onClose();
    } catch (error) {
      console.warn("[AppointmentUpdateFlow] El flujo falló", {
        stage,
        dateId: appointment.id,
        error,
      });

      Alert.alert("Error", "No se pudieron guardar los cambios.");
    } finally {
      setIsUpdating(false);
    }
  }, [
    appointment.id,
    form,
    isUpdating,
    loadAppointments,
    onClose,
    updateAppointment,
  ]);

  return {
    modalProps: {
      visible,
      isUpdating,
      form,
      appointment,
      enabledCalendars,
      isLoadingCalendars: isSettingsLoading,
      appointmentLeadOptions,
      appointmentPropertyOptions: properties.filteredAppointmentPropertyOptions,
      selectedLead,
      selectedProperty,
      currentUserId: currentUser?.id,
      currentUserName: currentUser?.name,
      selectionScreen,
      isLeadsLoading,
      isPropertiesLoading: properties.isCatalogLoading,
      onClose,
      onSubmit: submitUpdate,
      onUpdateField: updateField,
      onSelectCalendar: selectCalendar,
      onSelectAppointmentType: selectAppointmentType,
      onSelectionScreenChange: setSelectionScreen,
      onSelectLead: selectLead,
      onSelectProperty: selectProperty,
      onClearLead: clearLead,
      onClearProperty: clearProperty,
      onAssignCurrentUser: assignCurrentUser,
      onAssignOtherAdvisor: assignOtherAdvisor,
    },
  };
}

export function AppointmentUpdateFlow({
    appointment,
    visible,
    onClose,
}: Params) {
    const {modalProps} = useAppointmentUpdateFlow({
        appointment,
        visible,
        onClose,
    })

    return <UpdateDateModal {...modalProps}/>
};

function normalizeAppointmentType(value?: string | null): AppointmentType {
  if (value === "renta" || value === "venta") return value;
  return "general";
}

function getPropertyId(property: Property) {
  return property.id || property._id;
}
