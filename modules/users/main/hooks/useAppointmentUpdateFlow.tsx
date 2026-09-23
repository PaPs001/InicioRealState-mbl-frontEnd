import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { createBackendLeadV2Record, getBackendLeadRecords } from "@/lib/api/endpoints/leads";
import { findLeadDuplicates } from "../utils/lead-duplicates";

import type {
  AppointmentType,
  DuplicateLeadCandidate,
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
import {
  canSelectCalendarManually,
  getAppointmentTypeConfig,
  getAppointmentSubtypeOptions,
  isAppointmentType,
  findCalendarForAppointmentType,
} from '@/lib/config/appointment-Types';

type SelectionScreen = "lead" | "property" | "duplicate" | null;

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
  const [leadMode, setLeadMode] = useState<"existing" | "provisional">("existing");
  const [newLead, setNewLead] = useState({ fullName: "", phone: "", email: "" });
  const [createdLead, setCreatedLead] = useState<PropertyLead | null>(null);
  const [duplicateCandidates, setDuplicateCandidates] = useState<DuplicateLeadCandidate[]>([]);
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
    () => appointmentLeadOptions.find((lead) => lead.id === form.leadId) ??
      (createdLead && createdLead.id === form.leadId ? createdLead : undefined),
    [appointmentLeadOptions, form.leadId, createdLead],
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
      appointmentType: normalizeAppointmentType(appointment.appointmentType),
      subtypeCalendar: appointment.subtypeCalendar ?? null,
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
    setLeadMode("existing");
    setNewLead({ fullName: "", phone: "", email: "" });
    setCreatedLead(null);
    setDuplicateCandidates([]);
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
    const config = getAppointmentTypeConfig(appointmentType);
    setForm((current) => ({
      ...current,
      calendarId: calendar.calendarId,
      appointmentType,
      subtypeCalendar: current.appointmentType === appointmentType ? current.subtypeCalendar : null,
      colorId: calendar.colorId ?? null,
      ...(config.lead === 'none' ? { leadId: null } : {}),
      ...(config.property === 'none' ? { propertyId: null } : {}),
    }));
  }, []);

  const selectAppointmentType = useCallback(
    (appointmentType: AppointmentType) => {
      const config = getAppointmentTypeConfig(appointmentType);
      const matchingCalendars = enabledCalendars.filter(
        (calendar) => config.calendarSelection === 'manual'
          ? canSelectCalendarManually(calendar)
          : normalizeAppointmentType(calendar.appointmentType) === appointmentType,
      );
      const selectedCalendar =
        config.calendarSelection === 'named'
          ? findCalendarForAppointmentType(enabledCalendars, appointmentType)
          : matchingCalendars.find((calendar) => calendar.calendarId === form.calendarId) ??
            matchingCalendars.find((calendar) => calendar.primaryForCreate) ??
            matchingCalendars[0];

      if (!selectedCalendar) {
        if (getAppointmentSubtypeOptions(appointmentType).length > 0) {
          setForm((current) => ({
            ...current,
            appointmentType,
            calendarId: undefined,
            subtypeCalendar: current.appointmentType === appointmentType ? current.subtypeCalendar : null,
            ...(config.lead === 'none' ? { leadId: null } : {}),
            ...(config.property === 'none' ? { propertyId: null } : {}),
          }));
          return;
        }

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
        subtypeCalendar: current.appointmentType === appointmentType ? current.subtypeCalendar : null,
        colorId: selectedCalendar.colorId ?? null,
        ...(config.lead === 'none' ? { leadId: null } : {}),
        ...(config.property === 'none' ? { propertyId: null } : {}),
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

  const submitUpdate = useCallback(async (resolution?: { omit?: boolean; lead?: DuplicateLeadCandidate }) => {
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

    const start = new Date(form.startDateTime).getTime();
    const end = new Date(form.endDateTime ?? "").getTime();
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      Alert.alert("Fecha inválida", "La terminación debe ser posterior al inicio.");
      return;
    }
    const config = getAppointmentTypeConfig(form.appointmentType);
    const shouldCreateLead = config.lead !== "none" && leadMode === "provisional" && !resolution?.lead;
    if (shouldCreateLead && !newLead.fullName.trim()) {
      Alert.alert("Falta nombre", "Escribe el nombre completo del nuevo lead.");
      return;
    }
    if (config.lead === "required" && !shouldCreateLead && !form.leadId && !resolution?.lead?.id) {
      Alert.alert("Falta lead", "Selecciona un lead registrado o registra uno nuevo.");
      return;
    }
    if (!authToken) return;

    setIsUpdating(true);
    let stage: "lead" | "patch" | "reload" = "patch";
    let leadWasCreated = false;

    try {
      console.info("[AppointmentUpdateFlow] Enviando actualización", {
        dateId: appointment.id,
        payload: form,
      });

      const payload = { ...form };
      if (resolution?.lead?.id) {
        payload.leadId = resolution.lead.id;
        setForm(current => ({ ...current, leadId: resolution.lead!.id }));
        setLeadMode("existing");
        setSelectionScreen(null);
      }
      if (shouldCreateLead) {
        stage = "lead";
        if (!resolution?.omit) {
          const leads = await getBackendLeadRecords(authToken, { includeFollowUps: true });
          const candidates = findLeadDuplicates(leads, newLead);
          if (candidates.length) {
            setDuplicateCandidates(candidates);
            setSelectionScreen("duplicate");
            return;
          }
        }
        const lead = await createBackendLeadV2Record({
          fullName: newLead.fullName.trim(),
          phone: newLead.phone.trim() || undefined,
          email: newLead.email.trim() || undefined,
          propertyOfInterestId: form.propertyId || undefined,
          operation: form.appointmentType,
        }, authToken);
        if (!lead.id) throw new Error("El servidor no devolvió el identificador del lead.");
        payload.leadId = lead.id;
        setCreatedLead(lead);
        setForm(current => ({ ...current, leadId: lead.id }));
        setLeadMode("existing");
        setNewLead({ fullName: "", phone: "", email: "" });
        leadWasCreated = true;
        setSelectionScreen(null);
      }
      stage = "patch";
      await updateAppointment(appointment.id, payload);

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

      Alert.alert("Error", stage === "reload"
        ? "La cita se guardó, pero no se pudo refrescar el calendario."
        : leadWasCreated
          ? "El lead se registró y quedó seleccionado, pero no se pudo actualizar la cita. Puedes reintentar guardar."
          : stage === "lead"
            ? "No se pudo registrar el lead. La cita no se modificó."
            : "No se pudieron guardar los cambios.");
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
    authToken,
    leadMode,
    newLead,
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
      leadMode,
      newLead,
      duplicateCandidates,
      onOmitDuplicateAndCreate: () => { void submitUpdate({ omit: true }); },
      onUseDuplicateLead: (lead: DuplicateLeadCandidate) => {
        if (lead.id) void submitUpdate({ lead });
      },
      onLeadModeChange: setLeadMode,
      onNewLeadChange: (field: "fullName" | "phone" | "email", value: string) =>
        setNewLead(current => ({ ...current, [field]: value })),
      selectedProperty,
      currentUserId: currentUser?.id,
      currentUserName: currentUser?.name,
      selectionScreen,
      isLeadsLoading,
      isPropertiesLoading: properties.isCatalogLoading,
      onClose,
      onSubmit: () => { void submitUpdate(); },
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
  const normalized = value?.trim().toLowerCase();
  return isAppointmentType(normalized) ? normalized : "general";
}

function getPropertyId(property: Property) {
  return property.id || property._id;
}
