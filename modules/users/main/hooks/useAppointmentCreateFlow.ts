import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";

import {
  getAppointmentEndDateTime,
  getDefaultAppointmentStartDateTime,
} from "@/modules/users/main/utils/dashboard-formatters";
import { useSessionDomain } from "@/contexts/auth/use-session-domain";
import {
  createGoogleCalendarDate,
  type CreateGoogleCalendarDatePayload,
  type DuplicateCheckResult,
  type DuplicateLeadCandidate,
  type SelectedGoogleCalendar,
} from "@/lib/api";
import type { Property, PropertyLead } from "@/lib/types";
import type { AppCapabilities } from "@/modules/settings";
import { useCalendarData } from "@/modules/users/date/context/CalendarDataContext";
import { useDashboardCalendar } from "./userDashboardCalendar";
import { useDashboardLeads } from "./userDashboardLeads";
import { useDashboardProperties } from "./userDashboardProperties";

type Params = {
  capabilities?: AppCapabilities;
  initialLead?: PropertyLead;
  initialProperty?: Property;
  onClose: () => void;
  onCreated?: () => void;
  returnPath?: string;
  visible: boolean;
};

export function useAppointmentCreateFlow({
  capabilities,
  initialLead,
  initialProperty,
  onClose,
  onCreated,
  returnPath,
  visible,
}: Params) {
  const { authToken, currentUser } = useSessionDomain();
  const { addAppointment } = useCalendarData();
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);
  const [duplicateCheck, setDuplicateCheck] =
    useState<DuplicateCheckResult | null>(null);
  const [pendingDuplicatePayload, setPendingDuplicatePayload] =
    useState<CreateGoogleCalendarDatePayload | null>(null);
  const [form, setForm] = useState<CreateGoogleCalendarDatePayload>(() =>
    createInitialForm(currentUser?.id),
  );
  const { appointmentLeadOptions, isLeadsLoading, loadLeads } =
    useDashboardLeads({ authToken });
  const properties = useDashboardProperties(form.appointmentType);
  const calendar = useDashboardCalendar({
    authToken,
    capabilities,
    returnPath,
  });

  const selectedAppointmentLead = useMemo(
    () =>
      appointmentLeadOptions.find((lead) => lead.id === form.leadId) ||
      (initialLead?.id === form.leadId ? initialLead : undefined),
    [appointmentLeadOptions, form.leadId, initialLead],
  );
  const selectedAppointmentProperty = useMemo(
    () =>
      properties.filteredAppointmentPropertyOptions.find(
        (property) => getPropertyId(property) === form.propertyId,
      ) ||
      (getPropertyId(initialProperty) === form.propertyId
        ? initialProperty
        : undefined),
    [
      form.propertyId,
      initialProperty,
      properties.filteredAppointmentPropertyOptions,
    ],
  );

  useEffect(() => {
    if (!visible) return;
    setDuplicateCheck(null);
    setPendingDuplicatePayload(null);
    const initialPropertyId =
      getPropertyId(initialProperty) || initialLead?.propertyId || null;
    setForm((current) => ({
      ...createInitialForm(currentUser?.id),
      appointmentType:
        getInitialAppointmentType(initialLead, initialProperty) ||
        current.appointmentType,
      leadId: initialLead?.id || null,
      propertyId: initialPropertyId,
      advisorId:
        initialLead?.advisorId ||
        initialLead?.agentId ||
        currentUser?.id ||
        null,
    }));
    calendar.changeAppointmentLeadMode("existing");
    calendar.setAppointmentSelectionScreen(null);
    void calendar.loadGoogleCalendarSettings();
  }, [
    visible,
    initialLead?.id,
    initialLead?.propertyId,
    initialProperty,
    currentUser?.id,
  ]);

  const updateForm = useCallback(
    (field: keyof CreateGoogleCalendarDatePayload, value: string) => {
      setForm((current) => ({ ...current, [field]: value }));
    },
    [],
  );
  const selectCalendar = useCallback((selected: SelectedGoogleCalendar) => {
    setForm((current) => ({
      ...current,
      calendarId: selected.calendarId,
      appointmentType: selected.appointmentType ?? current.appointmentType,
      colorId: selected.colorId ?? current.colorId,
    }));
  }, []);
  const selectLead = useCallback(
    (lead: PropertyLead) => {
      setForm((current) => ({
        ...current,
        leadId: lead.id,
        propertyId: lead.propertyId || current.propertyId,
        advisorId: lead.advisorId || lead.agentId || currentUser?.id || null,
      }));
      calendar.setAppointmentSelectionScreen(null);
    },
    [calendar.setAppointmentSelectionScreen, currentUser?.id],
  );
  const selectProperty = useCallback(
    (property: Property) => {
      const propertyId = getPropertyId(property);
      if (!propertyId) return;
      setForm((current) => ({ ...current, propertyId }));
      calendar.setAppointmentSelectionScreen(null);
    },
    [calendar.setAppointmentSelectionScreen],
  );
  const changeLeadMode = useCallback(
    (mode: "existing" | "provisional") => {
      calendar.changeAppointmentLeadMode(mode);
      if (mode === "provisional")
        setForm((current) => ({ ...current, leadId: null }));
    },
    [calendar.changeAppointmentLeadMode],
  );

  async function submitAppointment(payload: CreateGoogleCalendarDatePayload) {
    if (!authToken) return;

    setIsCreatingAppointment(true);
    try {
      const response = await createGoogleCalendarDate(authToken, payload);
      setDuplicateCheck(null);
      setPendingDuplicatePayload(null);
      calendar.setAppointmentSelectionScreen(null);
      addAppointment(response.date);
      Alert.alert("Cita creada", "La cita se creo correctamente.");
      onCreated?.();
      onClose();
      void Promise.all([
        calendar.loadGoogleCalendarAppointments({ sync: true }),
        loadLeads(),
      ]).catch((error) => {
        console.warn(
          "La cita se creo, pero no se pudo refrescar la informacion:",
          error,
        );
      });
    } catch (error) {
      const conflict = getDuplicateCheck(error);
      if (conflict && payload.confirmDuplicate !== true) {
        setDuplicateCheck(conflict);
        setPendingDuplicatePayload(payload);
        Alert.alert(
          "Posibles coincidencias",
          "No se creo la cita ni el lead. Puedes revisar los leads encontrados o crear uno nuevo de todos modos.",
          [
            {
              text: "Omitir",
              style: "destructive",
              onPress: () => {
                void submitAppointment({ ...payload, confirmDuplicate: true });
              },
            },
            {
              text: "Revisar",
              onPress: () => calendar.setAppointmentSelectionScreen("duplicate"),
            },
          ],
        );
        return;
      }

      console.warn("No se pudo crear la cita:", error);
      Alert.alert("Error", "No se pudo crear la cita.");
    } finally {
      setIsCreatingAppointment(false);
    }
  }

  const omitDuplicateAndCreate = () => {
    if (!pendingDuplicatePayload || isCreatingAppointment) return;
    void submitAppointment({
      ...pendingDuplicatePayload,
      confirmDuplicate: true,
    });
  };

  const useDuplicateLead = (candidate: DuplicateLeadCandidate) => {
    if (!pendingDuplicatePayload || !candidate.id || isCreatingAppointment) {
      return;
    }

    void submitAppointment({
      ...pendingDuplicatePayload,
      leadId: candidate.id,
      lead: null,
      createLead: false,
      confirmDuplicate: false,
    });
  };

  const createAppointment = useCallback(async () => {
    if (!authToken || isCreatingAppointment) return;
    const appointmentType =
      form.appointmentType?.trim().toLowerCase() || "general";
    const isGeneral = appointmentType === "general";
    if (!form.title.trim() || !form.startDateTime.trim())
      return Alert.alert("Faltan datos", "Titulo e inicio son obligatorios.");
    if (
      !isGeneral &&
      calendar.appointmentLeadMode === "existing" &&
      !form.leadId
    )
      return Alert.alert(
        "Falta lead",
        "Selecciona el lead al que se le agendara la cita.",
      );
    if (
      !isGeneral &&
      calendar.appointmentLeadMode === "provisional" &&
      !calendar.provisionalAppointmentLead.fullName.trim()
    )
      return Alert.alert(
        "Falta nombre",
        "Escribe el nombre del lead provisional para crear la cita.",
      );
    const canResolveCalendarByType =
      ["renta", "venta"].includes(appointmentType) &&
      calendar.enabledSelectedCalendars.some(
        (item) =>
          item.appointmentType?.trim().toLowerCase() === appointmentType,
      );
    if (!form.calendarId && !canResolveCalendarByType)
      return Alert.alert(
        "Falta calendario",
        "Selecciona o configura el calendario donde quieres crear la cita.",
      );

    const base = {
      ...form,
      leadId: isGeneral ? null : form.leadId,
      propertyId: isGeneral ? null : form.propertyId,
      endDateTime: getAppointmentEndDateTime(form.startDateTime),
      advisorId: form.advisorId || currentUser?.id || null,
      helpedBy: isGeneral ? "" : form.helpedBy?.trim() || "",
    };
    const payload: CreateGoogleCalendarDatePayload =
      !isGeneral && calendar.appointmentLeadMode === "provisional"
        ? {
            ...base,
            leadId: null,
            createLead: true,
            confirmDuplicate: false,
            lead: {
              fullName: calendar.provisionalAppointmentLead.fullName.trim(),
              phone: calendar.provisionalAppointmentLead.phone.trim() || null,
              email: calendar.provisionalAppointmentLead.email.trim() || null,
            },
          }
        : { ...base, lead: null };

    await submitAppointment(payload);
  }, [
    authToken,
    calendar,
    currentUser?.id,
    form,
    isCreatingAppointment,
  ]);

  return {
    calendar,
    modalProps: {
      appointmentLeadMode: calendar.appointmentLeadMode,
      appointmentLeadOptions,
      appointmentPropertyOptions: properties.filteredAppointmentPropertyOptions,
      duplicateCheck,
      enabledSelectedCalendars: calendar.enabledSelectedCalendars,
      isCatalogLoading: properties.isCatalogLoading,
      isCreatingAppointment,
      isGoogleConnected:
        calendar.isGoogleConnected && !calendar.needsGoogleReconnect,
      needsGoogleReconnect: calendar.needsGoogleReconnect,
      isLeadsLoading,
      onClose,
      onCreateAppointment: createAppointment,
      onOmitDuplicateAndCreate: omitDuplicateAndCreate,
      onUseDuplicateLead: useDuplicateLead,
      onLeadModeChange: changeLeadMode,
      onSelectCalendar: selectCalendar,
      onSelectLead: selectLead,
      onSelectProperty: selectProperty,
      onSelectionScreenChange: calendar.setAppointmentSelectionScreen,
      onUpdateProvisionalLead: calendar.updateProvisionalAppointmentLead,
      onUpdateForm: updateForm,
      provisionalLead: calendar.provisionalAppointmentLead,
      selectedAppointmentLead,
      selectedAppointmentProperty,
      selectionScreen: calendar.appointmentSelectionScreen,
      testAppointmentForm: form,
      visible,
    },
    properties,
  };
}

function getDuplicateCheck(error: unknown): DuplicateCheckResult | null {
  if (!error || typeof error !== "object") return null;

  const apiError = error as {
    status?: unknown;
    details?: { duplicateCheck?: unknown };
  };
  if (apiError.status !== 409) return null;

  const duplicateCheck = apiError.details?.duplicateCheck;
  if (!duplicateCheck || typeof duplicateCheck !== "object") return null;

  const result = duplicateCheck as Partial<DuplicateCheckResult>;
  return Array.isArray(result.candidates) && !!result.window
    ? (result as DuplicateCheckResult)
    : null;
}

function createInitialForm(advisorId?: string): CreateGoogleCalendarDatePayload {
  const startDateTime = getDefaultAppointmentStartDateTime();
  return {
    title: "",
    startDateTime,
    endDateTime: getAppointmentEndDateTime(startDateTime),
    timeZone: "America/Mexico_City",
    helpedBy: "",
    advisorId: advisorId || null,
  };
}

function getPropertyId(property?: Property) {
  return property?.id || property?._id || undefined;
}

function getInitialAppointmentType(
  initialLead?: PropertyLead,
  initialProperty?: Property,
) {
  if (initialLead?.searchIntent === "rent") return "renta";
  if (initialLead?.searchIntent === "sale") return "venta";
  if (
    initialProperty?.listingType === "rent" ||
    initialProperty?.status === "for_rent" ||
    initialProperty?.status === "pending_rent" ||
    initialProperty?.monthlyRent
  )
    return "renta";
  if (
    initialProperty?.listingType === "sale" ||
    initialProperty?.status === "for_sale" ||
    initialProperty?.status === "pending_sale"
  )
    return "venta";
  return undefined;
}
