import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePathname, useRouter } from "expo-router";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import * as FileSystem from "expo-file-system/legacy";
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  Home,
  LogOut,
  Plus,
  Settings,
  CameraIcon,
  SunMedium,
} from "lucide-react-native";

import * as ImagePicker from 'expo-image-picker'

import { BackButton } from "@/assets";
import { ModalAddPhoto } from "@/components/modal";

import LogoIRSPrincipal from "@/assets/logoIRSprincipal.svg";
import { usePropertyDomain } from "@/contexts/auth/use-property-domain";
import { useSessionDomain } from "@/contexts/auth/use-session-domain";
import {
  API_URLS,
  createGoogleCalendarDate,
  deleteUploadedProfileImage,
  disconnectGoogleCalendar,
  getBackendLeadRecords,
  getCatalogRentProperties,
  getGoogleCalendarAuthUrl,
  getGoogleCalendarConnectionStatus,
  getGoogleCalendarDates,
  getGoogleCalendars,
  getSelectedGoogleCalendars,
  getUploadedProfileImage,
  saveSelectedGoogleCalendars,
  syncGoogleCalendars,
  uploadProfileImage,
  type CreateGoogleCalendarDatePayload,
  type GoogleCalendarConnectionStatus,
  type GoogleCalendarOption,
  type SelectedGoogleCalendar,
} from "@/lib/api";
import type { LeadFollowUp, Property, PropertyLead } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  AppointmentCard,
  FunnelMetric,
  LeadAlertRow,
  LeadMetricCard,
  PriorityCard,
} from "./DashboardCards";
import {
  formatCurrentDashboardDate,
  getAppointmentEndDateTime,
  getDefaultAppointmentEndDateTime,
  getDefaultAppointmentStartDateTime,
  getDefaultAppointmentType,
  getInitials,
  getPropertyDisplayName,
  hasUpcomingFollowUpDate,
  isOverdueFollowUp,
  mapGoogleDateToAppointment,
} from "./dashboard-formatters";
import { AppointmentCreateModal } from "./AppointmentCreateModal";
import { styles } from "./UserDashboardScreen.styles";
import type {
  AppointmentPreviewItem,
  DashboardLeadAlert,
  DashboardMetric,
  DashboardPriority,
} from "./types";
import { useOperationMode } from "@/modules/settings";
WebBrowser.maybeCompleteAuthSession();

export type UserDashboardArea = "adviser" | "coordinator";

type UserDashboardScreenProps = {
  area: UserDashboardArea;
};

type SelectedImage = {
  uri: string
  name: string
  type: string
}

const profilePhotoCacheDirectory = `${FileSystem.cacheDirectory || FileSystem.documentDirectory || ""}profile-photos/`;

function getProfilePhotoImageUrl(storageKey: string) {
  return `${API_URLS.CORE}/uploads/file?key=${encodeURIComponent(storageKey)}`;
}

function getProfilePhotoRequestHeaders(token?: string | null) {
  const headers: Record<string, string> = {
    Accept: "image/*",
  };

  if (API_URLS.CORE.includes("ngrok-free")) {
    headers["ngrok-skip-browser-warning"] = "true";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function getProfilePhotoCacheFilename(storageKey: string, contentType?: string) {
  const safeName = storageKey.replace(/[^a-zA-Z0-9._-]/g, "_");
  const normalizedContentType = contentType?.toLowerCase() || "";
  const extension =
    safeName.match(/\.[a-zA-Z0-9]+$/)?.[0] ||
    (normalizedContentType.includes("png")
      ? ".png"
      : normalizedContentType.includes("webp")
        ? ".webp"
        : ".jpg");

  return safeName.toLowerCase().endsWith(extension) ? safeName : `${safeName}${extension}`;
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = "";

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

async function cacheProfilePhotoImage(
  storageKey: string,
  token?: string | null,
  contentType?: string,
) {
  if (!profilePhotoCacheDirectory) {
    throw new Error("No hay directorio local disponible para cachear la foto de perfil.");
  }

  await FileSystem.makeDirectoryAsync(profilePhotoCacheDirectory, { intermediates: true }).catch(() => undefined);

  const fileUri = `${profilePhotoCacheDirectory}${getProfilePhotoCacheFilename(storageKey, contentType)}`;
  const cachedFile = await FileSystem.getInfoAsync(fileUri);
  if (cachedFile.exists) return fileUri;

  const response = await fetch(getProfilePhotoImageUrl(storageKey), {
    headers: getProfilePhotoRequestHeaders(token),
  });
  if (!response.ok) {
    throw new Error(`No se pudo descargar la foto de perfil (${response.status})`);
  }

  const arrayBuffer = await response.arrayBuffer();
  await FileSystem.writeAsStringAsync(fileUri, arrayBufferToBase64(arrayBuffer), {
    encoding: FileSystem.EncodingType.Base64,
  });

  return fileUri;
}


function isAppointmentFromTodayOn(appointment: AppointmentPreviewItem) {
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  ).getTime();

  return (
    appointment.sortTime !== Number.MAX_SAFE_INTEGER &&
    appointment.sortTime >= startOfToday
  );
}

const dashboardAreaConfig = {
  adviser: {
    basePath: "/userAdviser",
    fallbackName: "Asesor",
    roleLabel: "Asesor de Rentas",
    headline: "Aqui esta lo importante de hoy",
  },
  coordinator: {
    basePath: "/userCoordinator",
    fallbackName: "Coordinador",
    roleLabel: "Coordinador",
    headline: "Aqui esta lo importante de hoy",
  },
} as const;

type LeadFollowUpEntry = { lead: PropertyLead; followUp: LeadFollowUp };

export function UserDashboardScreen({ area }: UserDashboardScreenProps) {
  const {operationMode, capabilities } = useOperationMode()
  const router = useRouter();
  const pathname = usePathname();
  const {
    authToken,
    currentUser,
    logout,
    refreshToken,
    setAuthSession,
  } = useSessionDomain();
  const {
    availableProperties,
    catalogProperties,
    hasLoadedCatalog,
    isCatalogLoading,
    loadCatalogProperties,
  } = usePropertyDomain();
  const areaConfig = dashboardAreaConfig[area];
  const advisorName =
    currentUser?.name?.trim() ||
    currentUser?.email?.split("@")[0] ||
    areaConfig.fallbackName;
  const advisorInitials = getInitials(advisorName);
  const [leads, setLeads] = useState<PropertyLead[]>([]);
  const [isLeadsLoading, setIsLeadsLoading] = useState(false);
  const [calendarAppointments, setCalendarAppointments] = useState<
    AppointmentPreviewItem[]
  >([]);
  const [calendarMessage, setCalendarMessage] = useState(
    "Conecta Google Calendar para cargar tus citas reales.",
  );
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [googleConnectionStatus, setGoogleConnectionStatus] =
    useState<GoogleCalendarConnectionStatus | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const [imageError, setimageError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null)
  const [isUploadingProfileImage, setIsUploadingProfileImage] = useState(false)
  const [profileAvatarUri, setProfileAvatarUri] = useState<string | null>(null)

  const [isAddPhotoOpen, setAddPhotoOpen] = useState(false);

  const [isAppointmentModalVisible, setIsAppointmentModalVisible] =
    useState(false);
  const [appointmentSelectionScreen, setAppointmentSelectionScreen] = useState<
    "lead" | "property" | null
  >(null);
  const [isConnectingCalendar, setIsConnectingCalendar] = useState(false);
  const [isDisconnectingCalendar, setIsDisconnectingCalendar] = useState(false);
  const [isCalendarSettingsLoading, setIsCalendarSettingsLoading] =
    useState(false);
  const [isSavingCalendarSelection, setIsSavingCalendarSelection] =
    useState(false);
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);
  const [googleCalendars, setGoogleCalendars] = useState<
    GoogleCalendarOption[]
  >([]);
  const [selectedGoogleCalendars, setSelectedGoogleCalendars] = useState<
    SelectedGoogleCalendar[]
  >([]);
  const [testAppointmentForm, setTestAppointmentForm] =
    useState<CreateGoogleCalendarDatePayload>({
      title: "Visita de prueba",
      description: "Cita creada desde el panel temporal",
      location: "Oficina Inicio Real Estate",
      startDateTime: getDefaultAppointmentStartDateTime(),
      endDateTime: getDefaultAppointmentEndDateTime(),
      timeZone: "America/Mexico_City",
      appointmentType: "venta",
      helpedBy: advisorName,
      advisorId: currentUser?.id ?? null,
    });

  useEffect(() => {
    setTestAppointmentForm((current) => ({
      ...current,
      helpedBy: current.helpedBy || advisorName,
      advisorId: current.advisorId ?? currentUser?.id ?? null,
    }));
  }, [advisorName, currentUser?.id]);

  useEffect(() => {
    if (!hasLoadedCatalog && !isCatalogLoading) loadCatalogProperties();
  }, [hasLoadedCatalog, isCatalogLoading, loadCatalogProperties]);

  const loadLeads = useCallback(async () => {
    if (!authToken) {
      setLeads([]);
      return;
    }
    setIsLeadsLoading(true);
    try {
      setLeads(
        await getBackendLeadRecords(authToken, { includeFollowUps: true }),
      );
    } catch (error) {
      console.warn("No se pudieron cargar los leads reales del asesor:", error);
      setLeads([]);
    } finally {
      setIsLeadsLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    let isMounted = true;

    setProfileAvatarUri(null);

    if (!currentUser || !authToken) {
      setProfileAvatarUri(currentUser?.avatar ?? null);
      return () => {
        isMounted = false;
      };
    }

    const loadProfilePhoto = async () => {
      const profilePhoto = currentUser.profilePhotoKey
        ? {
            key: currentUser.profilePhotoKey,
            storageKey: currentUser.profilePhotoKey,
            url: currentUser.avatar ?? '',
          }
        : await getUploadedProfileImage(authToken);

      const profilePhotoKey = profilePhoto?.key || profilePhoto?.storageKey;
      if (!profilePhotoKey) {
        if (isMounted) setProfileAvatarUri(currentUser.avatar ?? null);
        return;
      }

      if (!currentUser.profilePhotoKey) {
        await setAuthSession(
          {
            ...currentUser,
            avatar: profilePhoto.url || currentUser.avatar,
            profilePhotoKey,
          },
          authToken,
          refreshToken,
        );
      }

      const localUri = await cacheProfilePhotoImage(profilePhotoKey, authToken, profilePhoto.contentType);
      if (isMounted) setProfileAvatarUri(localUri);
    };

    loadProfilePhoto()
      .catch((error) => {
        console.warn("No se pudo cargar la foto de perfil:", error);
        if (isMounted) setProfileAvatarUri(currentUser.avatar ?? null);
      })

    return () => {
      isMounted = false;
    };
  }, [authToken, currentUser, refreshToken, setAuthSession]);

  const pickProfileImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setimageError("Necesitamos permiso para escoger una imagen.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    setSelectedImage({
      uri: asset.uri,
      name: asset.fileName || `perfil-${Date.now()}.jpg`,
      type: asset.mimeType || "image/jpeg",
    });
    setimageError(null);
  };

  const saveProfileImage = async () => {
    if (!selectedImage || !authToken || !currentUser || isUploadingProfileImage) {
      if (!selectedImage) setimageError("Selecciona una imagen antes de guardarla.");
      if (!currentUser || !authToken) setimageError("Inicia sesion antes de guardar la foto.");
      return;
    }

    setIsUploadingProfileImage(true);
    setimageError(null);
    try {
      await deleteUploadedProfileImage(authToken);
      const uploadedImage = await uploadProfileImage({ image: selectedImage }, authToken);

      const updatedUser = {
        ...currentUser,
        avatar: uploadedImage.url,
        profilePhotoKey: uploadedImage.key || uploadedImage.storageKey || currentUser.profilePhotoKey,
      };
      await setAuthSession(updatedUser, authToken, refreshToken);
      if (updatedUser.profilePhotoKey) {
        cacheProfilePhotoImage(updatedUser.profilePhotoKey, authToken, uploadedImage.contentType)
          .then(setProfileAvatarUri)
          .catch((error) => {
            console.warn("No se pudo cachear la foto de perfil recien subida:", error);
            setProfileAvatarUri(uploadedImage.url);
          });
      } else {
        setProfileAvatarUri(uploadedImage.url);
      }
      setSelectedImage(null);
      setAddPhotoOpen(false);
      Alert.alert("Foto actualizada", "La foto de perfil se guardo correctamente.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo guardar la foto de perfil.";
      console.warn("No se pudo guardar la foto de perfil:", error);
      setimageError(message);
    } finally {
      setIsUploadingProfileImage(false);
    }
  };

  const loadCalendarDates = useCallback(
    async (options: { sync?: boolean } = {}) => {
      if (!authToken) {
        setCalendarAppointments([]);
        setIsGoogleConnected(false);
        setCalendarMessage("Inicia sesion para cargar tus citas reales.");
        return;
      }
      setIsCalendarLoading(true);
      try {
        const dates = await getGoogleCalendarDates(authToken, {
          sync: options.sync,
        });
        const appointments = dates
          .map(mapGoogleDateToAppointment)
          .filter(isAppointmentFromTodayOn)
          .sort((a, b) => a.sortTime - b.sortTime);
        setCalendarAppointments(appointments);
        setIsGoogleConnected(true);
        setCalendarMessage(
          appointments.length ? "" : "No hay citas de Google para esta semana.",
        );
      } catch (error) {
        console.warn(
          "No se pudieron cargar las citas de Google Calendar para asesor:",
          error,
        );
        setCalendarAppointments([]);
        try {
          const status = await getGoogleCalendarConnectionStatus(authToken);
          setGoogleConnectionStatus(status);
          setIsGoogleConnected(status.status === "connected" && status.connected);
          setCalendarMessage(
            status.status === "requires_reconnect"
              ? "Reconecta Google Calendar para recuperar tus citas."
              : "Conecta Google Calendar para cargar tus citas reales.",
          );
        } catch {
          setIsGoogleConnected(false);
          setCalendarMessage(
            "Conecta Google Calendar para cargar tus citas reales.",
          );
        }
      } finally {
        setIsCalendarLoading(false);
      }
    },
    [authToken],
  );
  const loadGoogleCalendarSettings = useCallback(async () => {
    if (!authToken) {
      setGoogleCalendars([]);
      setSelectedGoogleCalendars([]);
      return;
    }
    setIsCalendarSettingsLoading(true);
    try {
      const status = await getGoogleCalendarConnectionStatus(authToken);
      setGoogleConnectionStatus(status);
      setIsGoogleConnected(status.status === "connected" && status.connected);

      if (status.status === "requires_reconnect") {
        setGoogleCalendars([]);
        setSelectedGoogleCalendars([]);
        setCalendarMessage("Reconecta Google Calendar para recuperar tus citas.");
        return;
      }

      if (!status.connected) {
        setGoogleCalendars([]);
        setSelectedGoogleCalendars([]);
        return;
      }

      const [calendars, selectedCalendars] = await Promise.all([
        getGoogleCalendars(authToken),
        getSelectedGoogleCalendars(authToken),
      ]);
      setGoogleCalendars(calendars);
      setSelectedGoogleCalendars(selectedCalendars);
    } catch (error) {
      console.warn("No se pudieron cargar los calendarios del asesor:", error);
    } finally {
      setIsCalendarSettingsLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);
  useEffect(() => {
    loadCalendarDates({ sync: true });
  }, [loadCalendarDates]);
  useEffect(() => {
    loadGoogleCalendarSettings();
  }, [loadGoogleCalendarSettings]);

  const rentSummary = useMemo(() => {
    const source =
      catalogProperties.length > 0 ? catalogProperties : availableProperties;
    const rentProperties = source.filter(
      (property) =>
        property.status === "for_rent" || property.status === "pending_rent",
    );
    const totalRent = rentProperties.reduce(
      (sum, property) => sum + (property.monthlyRent ?? property.price ?? 0),
      0,
    );
    return {
      propertyCount: rentProperties.length,
      opportunityAmount: totalRent * 0.05,
    };
  }, [availableProperties, catalogProperties]);

  const saleSummary = useMemo(() => {
    const source = catalogProperties.length > 0 ? catalogProperties : availableProperties 

    const saleProperties = source.filter(
      (property) => property.status == 'for_sale' || property.status === 'pending_sale',
    ); 
    const totalSale = saleProperties.reduce(
      (Sum, property) => Sum + (property.monthlyRent ?? property.price ?? 0),0
    )
    return {
      propertyCount: saleProperties.length,
      opportunityAmount: totalSale * 0.5
    }
  }, [availableProperties, catalogProperties])

  const leadSummary = useMemo(() => {
    const activeLeads = leads.filter(
      (lead) => !["cerrado", "descartado"].includes(lead.status),
    );
    const entries: LeadFollowUpEntry[] = leads.flatMap((lead) =>
      (lead.followUps ?? []).map((followUp) => ({ lead, followUp })),
    );
    const followUps = entries.map((entry) => entry.followUp);
    const overdue = followUps.filter(isOverdueFollowUp);
    const upcoming = followUps.filter(hasUpcomingFollowUpDate);
    const noAnswer = followUps.filter(
      (followUp) => followUp.result === "noAnswer",
    );
    const appointments = followUps.filter(
      (followUp) => followUp.result === "appointmentScheduled",
    );
    const withFollowUps = activeLeads.filter(
      (lead) => (lead.followUps ?? []).length > 0,
    );
    const withoutNext = activeLeads.filter(
      (lead) =>
        !(lead.followUps ?? []).some((followUp) =>
          Boolean(followUp.nextActionDate),
        ),
    );
    return {
      followUps: followUps.length,
      overdueFollowUps: overdue.length,
      appointmentFollowUps: appointments.length,
      leadMetrics: [
        {
          id: "active",
          value: activeLeads.length,
          label: "Leads activos",
          tone: "neutral",
        },
        {
          id: "pending",
          value: followUps.length,
          label: "Seguimientos",
          tone: "warning",
        },
        {
          id: "late",
          value: overdue.length,
          label: "Atrasados",
          tone: overdue.length ? "danger" : "success",
        },
        {
          id: "today",
          value: upcoming.length,
          label: "Proximos",
          tone: "warning",
        },
      ] satisfies DashboardMetric[],
      leadFunnel: [
        {
          id: "new",
          value: activeLeads.filter(
            (lead) => (lead.followUps ?? []).length === 0,
          ).length,
          label: "Nuevos",
          tone: "neutral",
        },
        {
          id: "following",
          value: withFollowUps.length,
          label: "En seguimiento",
          tone: "neutral",
        },
        {
          id: "closing",
          value: appointments.length,
          label: "Por cerrar",
          tone: "neutral",
        },
        {
          id: "won",
          value: leads.filter((lead) => lead.status === "cerrado").length,
          label: "Ganados",
          tone: "success",
        },
        {
          id: "lost",
          value: leads.filter((lead) => lead.status === "descartado").length,
          label: "Perdidos",
          tone: "neutral",
        },
      ] satisfies DashboardMetric[],
      leadAlerts: [
        overdue.length
          ? {
              id: "expired",
              message: `${overdue.length} seguimientos vencidos`,
            }
          : null,
        noAnswer.length
          ? {
              id: "no-answer",
              message: `${noAnswer.length} seguimientos sin respuesta`,
            }
          : null,
        withoutNext.length
          ? {
              id: "next-action",
              message: `${withoutNext.length} leads sin siguiente accion`,
            }
          : null,
      ].filter(Boolean) as DashboardLeadAlert[],
    };
  }, [leads]);

  const priorities = useMemo(
    () =>
      [
        {
          id: "closing",
          value: leadSummary.appointmentFollowUps,
          label: "Citas por cerrar",
        },
        {
          id: "followups",
          value: leadSummary.followUps,
          label: "Seguimientos",
        },
        {
          id: "properties",
          value: rentSummary.propertyCount,
          label: "Propiedades activas",
        },
        {
          id: "urgent",
          value: leadSummary.overdueFollowUps,
          label: "Urgentes",
        },
      ] satisfies DashboardPriority[],
    [leadSummary, rentSummary.propertyCount],
  );

  const appointmentPropertyOptions = useMemo(() => {
    const source =
      catalogProperties.length > 0 ? catalogProperties : availableProperties;
    const propertiesById = new Map<string, Property>();

    source.forEach((property) => {
      const propertyId = property.id || property._id;
      if (propertyId && !propertiesById.has(propertyId)) {
        propertiesById.set(propertyId, property);
      }
    });

    return Array.from(propertiesById.values()).sort((current, next) =>
      getPropertyDisplayName(current).localeCompare(
        getPropertyDisplayName(next),
      ),
    );
  }, [availableProperties, catalogProperties]);

  const appointmentLeadOptions = useMemo(
    () =>
      leads
        .filter((lead) => !["cerrado", "descartado"].includes(lead.status))
        .sort((current, next) => current.name.localeCompare(next.name)),
    [leads],
  );

  const selectedAppointmentLead = useMemo(
    () =>
      appointmentLeadOptions.find(
        (lead) => lead.id === testAppointmentForm.leadId,
      ),
    [appointmentLeadOptions, testAppointmentForm.leadId],
  );

  const selectedAppointmentProperty = useMemo(
    () =>
      appointmentPropertyOptions.find(
        (property) =>
          (property.id || property._id) === testAppointmentForm.propertyId,
      ),
    [appointmentPropertyOptions, testAppointmentForm.propertyId],
  );

  const enabledSelectedCalendars = selectedGoogleCalendars.filter(
    (calendar) => calendar.enabled !== false,
  );
  const needsGoogleReconnect =
    googleConnectionStatus?.status === "requires_reconnect";

  const handleLogout = () =>
    Alert.alert("Cerrar sesion", "Estas seguro que deseas cerrar sesion?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar sesion",
        style: "destructive",
        onPress: async () => {
          setIsProfileMenuOpen(false);
          await logout();
          router.replace("/login/login" as never);
        },
      },
    ]);

  const handleConnectGoogleCalendar = async () => {
    if (!authToken || isConnectingCalendar) return;
    setIsConnectingCalendar(true);
    try {
      const returnTo = Linking.createURL(pathname.replace(/^\//, ""));
      const response = await getGoogleCalendarAuthUrl(authToken, returnTo);
      const result = await WebBrowser.openAuthSessionAsync(
        response.url,
        returnTo,
      );
      if (result.type === "success")
        await Promise.all([
          loadGoogleCalendarSettings(),
          loadCalendarDates({ sync: true }),
        ]);
    } catch (error) {
      console.warn("No se pudo conectar Google Calendar en asesor:", error);
    } finally {
      setIsConnectingCalendar(false);
    }
  };

  const handleDisconnectGoogleCalendar = () => {
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
              setGoogleCalendars([]);
              setSelectedGoogleCalendars([]);
              setCalendarAppointments([]);
              setGoogleConnectionStatus(null);
              setIsGoogleConnected(false);
              setCalendarMessage("Google Calendar fue desconectado.");
            } catch (error) {
              console.warn(
                "No se pudo desconectar Google Calendar en asesor:",
                error,
              );
            } finally {
              setIsDisconnectingCalendar(false);
            }
          },
        },
      ],
    );
  };

  const getCalendarSelection = (calendarId?: string) =>
    selectedGoogleCalendars.find(
      (calendar) => calendar.calendarId === calendarId,
    );
  const toggleGoogleCalendar = (calendar: GoogleCalendarOption) => {
    const calendarId = calendar.calendarId;
    if (!calendarId) return;
    setSelectedGoogleCalendars((current) => {
      const existing = current.find((item) => item.calendarId === calendarId);
      if (existing)
        return current.map((item) =>
          item.calendarId === calendarId
            ? { ...item, enabled: item.enabled === false }
            : item,
        );
      return [
        ...current,
        {
          calendarId,
          summary: calendar.summary ?? "",
          enabled: true,
          appointmentType: getDefaultAppointmentType(calendar.summary),
          primaryForCreate: current.every(
            (item) => item.primaryForCreate !== true,
          ),
        },
      ];
    });
  };
  const markPrimaryGoogleCalendar = (calendar: GoogleCalendarOption) => {
    const calendarId = calendar.calendarId;
    if (!calendarId) return;
    setSelectedGoogleCalendars((current) => {
      const next = current.some((item) => item.calendarId === calendarId)
        ? current
        : [
            ...current,
            {
              calendarId,
              summary: calendar.summary ?? "",
              enabled: true,
              appointmentType: getDefaultAppointmentType(calendar.summary),
            },
          ];
      return next.map((item) => ({
        ...item,
        enabled: item.calendarId === calendarId ? true : item.enabled,
        primaryForCreate: item.calendarId === calendarId,
      }));
    });
  };
  const handleSaveGoogleCalendarSelection = async () => {
    if (!authToken || isSavingCalendarSelection) return;
    setIsSavingCalendarSelection(true);
    try {
      setSelectedGoogleCalendars(
        await saveSelectedGoogleCalendars(authToken, selectedGoogleCalendars),
      );
      await syncGoogleCalendars(authToken);
      await Promise.all([
        loadGoogleCalendarSettings(),
        loadCalendarDates({ sync: true }),
      ]);
      Alert.alert(
        "Calendarios guardados",
        "La seleccion fue guardada y las citas fueron sincronizadas.",
      );
    } catch (error) {
      console.warn(
        "No se pudo guardar la seleccion de calendarios del asesor:",
        error,
      );
    } finally {
      setIsSavingCalendarSelection(false);
    }
  };

  const updateTestAppointmentForm = (
    field: keyof CreateGoogleCalendarDatePayload,
    value: string,
  ) => {
    setTestAppointmentForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const selectTestAppointmentCalendar = (calendar: SelectedGoogleCalendar) => {
    setTestAppointmentForm((currentForm) => ({
      ...currentForm,
      calendarId: calendar.calendarId,
      appointmentType: calendar.appointmentType ?? currentForm.appointmentType,
      colorId: calendar.colorId ?? currentForm.colorId,
    }));
  };

  const selectAppointmentLead = (lead: PropertyLead) => {
    const property = appointmentPropertyOptions.find(
      (item) => (item.id || item._id) === lead.propertyId,
    );
    const advisorId = lead.advisorId || lead.agentId || currentUser?.id || null;

    setTestAppointmentForm((currentForm) => ({
      ...currentForm,
      leadId: lead.id,
      propertyId: lead.propertyId || currentForm.propertyId,
      advisorId,
      title:
        currentForm.title?.trim() && currentForm.title !== "Visita de prueba"
          ? currentForm.title
          : `Cita con ${lead.name}`,
      description:
        currentForm.description?.trim() &&
        currentForm.description !== "Cita creada desde el panel temporal"
          ? currentForm.description
          : `Lead: ${lead.name}${lead.phone ? `\nTelefono: ${lead.phone}` : ""}${lead.email ? `\nCorreo: ${lead.email}` : ""}`,
      location: property?.address || property?.city || currentForm.location,
    }));
    setAppointmentSelectionScreen(null);
  };

  const selectAppointmentProperty = (property: Property) => {
    const propertyId = property.id || property._id;
    if (!propertyId) return;

    setTestAppointmentForm((currentForm) => ({
      ...currentForm,
      propertyId,
      location: property.address || property.city || currentForm.location,
    }));
    setAppointmentSelectionScreen(null);
  };

  const handleOpenAppointmentModal = () => {
    setAppointmentSelectionScreen(null);
    setIsAppointmentModalVisible(true);
  };

  const handleCloseAppointmentModal = () => {
    setAppointmentSelectionScreen(null);
    setIsAppointmentModalVisible(false);
  };

  const handleCreateAppointment = async () => {
    if (!authToken || isCreatingAppointment) return;

    if (
      !testAppointmentForm.title.trim() ||
      !testAppointmentForm.startDateTime.trim()
    ) {
      Alert.alert("Faltan datos", "Titulo e inicio son obligatorios.");
      return;
    }

    if (!testAppointmentForm.leadId) {
      Alert.alert(
        "Falta lead",
        "Selecciona el lead al que se le agendara la cita.",
      );
      return;
    }

    if (!testAppointmentForm.propertyId) {
      Alert.alert(
        "Falta propiedad",
        "Selecciona la propiedad relacionada con la cita.",
      );
      return;
    }

    if (!testAppointmentForm.calendarId) {
      Alert.alert(
        "Falta calendario",
        "Selecciona el calendario donde quieres crear la cita.",
      );
      return;
    }

    setIsCreatingAppointment(true);
    try {
      await createGoogleCalendarDate(authToken, {
        ...testAppointmentForm,
        endDateTime: getAppointmentEndDateTime(
          testAppointmentForm.startDateTime,
        ),
        advisorId: testAppointmentForm.advisorId || currentUser?.id || null,
        helpedBy: testAppointmentForm.helpedBy || advisorName,
      });
      await loadCalendarDates({ sync: true });
      Alert.alert("Cita creada", "La cita se creo correctamente.");
      setIsAppointmentModalVisible(false);
    } catch (error) {
      console.warn("No se pudo crear la cita desde asesor:", error);
      Alert.alert("Error", "No se pudo crear la cita.");
    } finally {
      setIsCreatingAppointment(false);
    }
  };
  if (isAddPhotoOpen) {
    return (
      <ModalAddPhoto
        isOpen={isAddPhotoOpen}
        onClose={() => {
          if (isUploadingProfileImage) return;
          setAddPhotoOpen(false);
          setSelectedImage(null);
          setimageError(null);
        }}
        addImage={pickProfileImage}
        error={imageError}
        imageUri={selectedImage?.uri}
        isSaving={isUploadingProfileImage}
        onSave={saveProfileImage}
      />
    );
  }
  if (isSettingsOpen) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sectionHeader}>
            <TouchableOpacity
              style={styles.notification}
              activeOpacity={0.85}
              onPress={() => setIsSettingsOpen(false)}
            >
              <BackButton />
            </TouchableOpacity>
            <View style={styles.header}>
              <Text style={styles.sectionHeaderTitle}>Configuracion</Text>
              <Text style={styles.panelSubtitle}>
                Calendarios y conexion de Google
              </Text>
            </View>
          </View>
          <View style={styles.panel}>
            <Text style={styles.sectionHeaderTitle}>Preferencias de la aplicacion</Text>
            <Text style={styles.panelSubtitle}>
              Configura las funciones de renta o venta.
            </Text>
            <TouchableOpacity
              style={styles.centerButton}
              activeOpacity={0.85}
              onPress={() => router.push(`${areaConfig.basePath}/settings` as never)}
            >
              <Settings size={18} color="#ffffff" />
              <Text style={styles.centerButtonText}>Abrir preferencias</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.panel}>
            <Text style={styles.sectionHeaderTitle}>Google Calendar</Text>
            <Text style={styles.panelSubtitle}>
              Selecciona que calendarios usa el asesor.
            </Text>
            <TouchableOpacity
              style={
                isGoogleConnected && !needsGoogleReconnect
                  ? styles.outlineButton
                  : styles.centerButton
              }
              activeOpacity={0.85}
              disabled={isConnectingCalendar || isDisconnectingCalendar}
              onPress={
                isGoogleConnected && !needsGoogleReconnect
                  ? handleDisconnectGoogleCalendar
                  : handleConnectGoogleCalendar
              }
            >
              {isGoogleConnected && !needsGoogleReconnect ? (
                <LogOut size={16} color="#006b43" />
              ) : (
                <CalendarDays size={17} color="#3d3b3b" />
              )}
              <Text
                style={
                  isGoogleConnected && !needsGoogleReconnect
                    ? styles.outlineButtonText
                    : styles.centerButtonText
                }
              >
                {isConnectingCalendar
                  ? "Abriendo Google..."
                  : isDisconnectingCalendar
                    ? "Desconectando..."
                    : needsGoogleReconnect
                      ? "Reconectar Google Calendar"
                      : isGoogleConnected
                      ? "Desconectar Google"
                      : "Conectar Google Calendar"}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.googleCalendarSettings}>
            <View style={styles.calendarSettingsHeader}>
              <Text style={styles.calendarSettingsTitle}>
                Calendarios conectados
              </Text>
              <TouchableOpacity
                style={styles.calendarSmallButton}
                activeOpacity={0.85}
                disabled={isCalendarSettingsLoading}
                onPress={loadGoogleCalendarSettings}
              >
                <Text style={styles.calendarSmallButtonText}>
                  {isCalendarSettingsLoading ? "Cargando" : "Actualizar"}
                </Text>
              </TouchableOpacity>
            </View>
            {needsGoogleReconnect ? (
              <Text style={styles.calendarSettingsEmpty}>
                Google Calendar requiere reconexion para volver a sincronizar.
              </Text>
            ) : googleCalendars.length === 0 ? (
              <Text style={styles.calendarSettingsEmpty}>
                {isCalendarSettingsLoading
                  ? "Buscando calendarios..."
                  : "No hay calendarios disponibles."}
              </Text>
            ) : (
              <View style={styles.calendarList}>
                {googleCalendars.map((calendar) => {
                  const selection = getCalendarSelection(calendar.calendarId);
                  const isEnabled = selection?.enabled === true;
                  const isPrimary = selection?.primaryForCreate === true;

                  return (
                    <View
                      key={calendar.calendarId ?? calendar.summary}
                      style={styles.calendarOptionRow}
                    >
                      <TouchableOpacity
                        style={[
                          styles.calendarToggle,
                          isEnabled && styles.calendarToggleActive,
                        ]}
                        activeOpacity={0.85}
                        onPress={() => toggleGoogleCalendar(calendar)}
                      >
                        <Text
                          style={[
                            styles.calendarToggleText,
                            isEnabled && styles.calendarToggleTextActive,
                          ]}
                        >
                          {isEnabled ? "ON" : "OFF"}
                        </Text>
                      </TouchableOpacity>
                      <View style={styles.calendarOptionCopy}>
                        <Text
                          style={styles.calendarOptionTitle}
                          numberOfLines={1}
                        >
                          {calendar.summary || "Calendario sin nombre"}
                        </Text>
                        <Text
                          style={styles.calendarOptionMeta}
                          numberOfLines={1}
                        >
                          {selection?.appointmentType ||
                            getDefaultAppointmentType(calendar.summary)}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.calendarPrimaryButton,
                          isPrimary && styles.calendarPrimaryButtonActive,
                        ]}
                        activeOpacity={0.85}
                        onPress={() => markPrimaryGoogleCalendar(calendar)}
                      >
                        <Text
                          style={[
                            styles.calendarPrimaryButtonText,
                            isPrimary && styles.calendarPrimaryButtonTextActive,
                          ]}
                        >
                          {isPrimary ? "Principal" : "Usar"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}
            <View style={styles.calendarActionsRow}>
              <TouchableOpacity
                style={styles.calendarActionButton}
                activeOpacity={0.85}
                disabled={isSavingCalendarSelection}
                onPress={handleSaveGoogleCalendarSelection}
              >
                <Text style={styles.calendarActionButtonText}>
                  {isSavingCalendarSelection
                    ? "Guardando..."
                    : "Guardar calendarios"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoWrap}>
          <LogoIRSPrincipal width={146} height={48} />
        </View>
        <View style={styles.topRow}>
          <Text style={styles.roleLabel}>
            {operationMode === 'rent' ? 'Asesor de renta' 
            : operationMode === 'sale' ? 'Asesor de venta' 
            : operationMode === 'both' ? 'Asesor Mixto' : null}
          </Text>
          {/*<Text style={styles.roleLabel}>{areaConfig.roleLabel}</Text>*/}
          <View style={styles.datePill}>
            <Text style={styles.dateText}>{formatCurrentDashboardDate()}</Text>
          </View>
        </View>
        <View style={styles.profileRow}>
          <View style={styles.profileLeft}>
            <TouchableOpacity
              style={styles.avatar}
              activeOpacity={0.85}
              onPress={() => setIsProfileMenuOpen((current) => !current)}
            >
              {profileAvatarUri ? (
                <Image source={{ uri: profileAvatarUri }} style={styles.avatarImage} resizeMode="cover" />
              ) : (
                <Text style={styles.avatarText}>{advisorInitials}</Text>
              )}
            </TouchableOpacity>
            <View>
              <Text style={styles.greeting}>Hola, {advisorName}</Text>
              <Text style={styles.helper}>{areaConfig.headline}</Text>
            </View>
            {isProfileMenuOpen ? (
              <View style={styles.profileMenu}>
                <TouchableOpacity
                  style={styles.profileMenuButton}
                  activeOpacity={0.85}
                  onPress={() => {
                    setIsProfileMenuOpen(false);
                    setAddPhotoOpen(true);
                  }}
                >
                  <CameraIcon size={15} color={"#315b41"} />
                  <Text style={styles.profileMenuButtonText}>Agregar foto</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.profileMenuButton}
                  activeOpacity={0.85}
                  onPress={() => {
                    setIsProfileMenuOpen(false);
                    setIsSettingsOpen(true);
                  }}
                >
                  <Settings size={15} color="#315b41" />
                  <Text style={styles.profileMenuButtonText}>
                    Configuraciones
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.profileLogoutButton}
                  activeOpacity={0.85}
                  onPress={handleLogout}
                >
                  <LogOut size={15} color="#ffffff" />
                  <Text style={styles.profileLogoutText}>Salir de sesion</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
          <TouchableOpacity style={styles.notification} activeOpacity={0.85}>
            <Bell size={20} color="#c79443" />
          </TouchableOpacity>
        </View>
        <View style={styles.heroCards}>
          {operationMode === 'both' ? (
            <>
              <TouchableOpacity
                style={styles.availableCard}
                activeOpacity={0.85}
                onPress={() =>
                  router.push(`${areaConfig.basePath}/properties` as never)
                }
              >
                <Text style={styles.spacedLabel}>PROPIEDADES</Text>
                <Text style={styles.availableValue}>
                  {rentSummary.propertyCount}
                </Text>
                <Text style={styles.spacedLabel}>DISPONIBLES</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.availableCard, styles.availableCardRent]}
                activeOpacity={0.85}
                onPress={() =>
                  router.push(`${areaConfig.basePath}/properties` as never)
                }
              >
                <Text style={styles.spacedLabel}>PROPIEDADES</Text>
                <Text style={styles.availableValue}>
                  {saleSummary.propertyCount}
                </Text>
                <Text style={styles.spacedLabel}>DISPONIBLES</Text>
              </TouchableOpacity>
            </>
          ): <TouchableOpacity
                style={styles.availableCard}
                activeOpacity={0.85}
                onPress={() =>
                  router.push(`${areaConfig.basePath}/properties` as never)
                }
              >
                <Text style={styles.spacedLabel}>PROPIEDADES</Text>
                <Text style={styles.availableValue}>
                  {rentSummary.propertyCount}
                </Text>
                <Text style={styles.spacedLabel}>DISPONIBLES</Text>
              </TouchableOpacity> 
            }
          {area === "coordinator" ? (
            <View style={styles.earningsCard}>
              <Text style={styles.earningsLabel}>OPORTUNIDAD DEL MES</Text>
              <View style={styles.earningsValueRow}>
                <Text
                  style={styles.earningsValue}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.72}
                >
                  {formatCurrency(rentSummary.opportunityAmount)}
                </Text>
                <Text style={styles.currency}>MXN</Text>
              </View>
              <Text style={styles.earningsCaption}>Comision aprox.</Text>
            </View>
          ) : null}
        </View>
        {/*<View style={styles.listedButton}>
          <View style={styles.listedIcon}>
            <Home size={26} color="#d4b66f" />
          </View>
          <View style={styles.listedCopy}>
            <Text style={styles.listedTitle}>Mis propiedades LISTADAS</Text>
            <Text style={styles.listedMeta}>Muy pronto</Text>
          </View>
          <ChevronRight size={18} color="#2a2d31" />
        </View>*/}
        {/*<Text style={styles.sectionTitle}>Prioridades de hoy</Text>
        <View style={styles.prioritiesRow}>{priorities.map((priority, index) => 
          <PriorityCard key={priority.id} priority={priority} highlight={index === priorities.length - 1} />)}
        </View>*/}
        <View style={[styles.panel, styles.appointmentsPanel]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderTitle}>Citas de esta semana</Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setIsSettingsOpen(true)}
            >
              <Text style={styles.sectionAction}>Configurar</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.appointmentsScroll}
            contentContainerStyle={styles.appointmentList}
            nestedScrollEnabled
            showsVerticalScrollIndicator={calendarAppointments.length > 5}
          >
            {calendarAppointments.length === 0 ? (
              <Text style={styles.panelSubtitle}>
                {isCalendarLoading
                  ? "Cargando citas reales..."
                  : calendarMessage}
              </Text>
            ) : (
              calendarAppointments
                .slice(0, 15)
                .map((appointment) => (
                  <AppointmentCard
                    key={`${appointment.id ?? appointment.property}-${appointment.time}`}
                    appointment={appointment}
                  />
                ))
            )}
          </ScrollView>
          <View style={styles.appointmentActionsRow}>
            <TouchableOpacity
              style={styles.centerButton}
              activeOpacity={0.85}
              onPress={() => loadCalendarDates({ sync: true })}
              disabled={isCalendarLoading}
            >
              <CalendarDays size={17} color="#3d3b3b" />
              <Text style={styles.centerButtonText}>
                {isCalendarLoading ? "Cargando..." : "Recargar calendario"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.centerButton}
              activeOpacity={0.85}
              onPress={handleOpenAppointmentModal}
            >
              <Plus size={17} color="#3d3b3b" />
              <Text style={styles.centerButtonText}>Agregar cita</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={[styles.panel, styles.leadPanel]}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionHeaderTitle}>Seguimientos</Text>
              <Text style={styles.panelSubtitle}>
                Panorama general de actividad de leads
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() =>
                router.push(`${areaConfig.basePath}/leads` as never)
              }
            >
              <Text style={styles.sectionAction}>Ver mas</Text>
            </TouchableOpacity>
          </View>
          {isLeadsLoading ? (
            <Text style={styles.panelSubtitle}>Cargando leads...</Text>
          ) : (
            <>
              <View style={styles.metricGrid}>
                {leadSummary.leadMetrics.map((metric) => (
                  <LeadMetricCard key={metric.id} metric={metric} />
                ))}
              </View>
              <Text style={styles.subTitle}>Vista rapida</Text>
              <View style={styles.funnelRow}>
                {leadSummary.leadFunnel.map((metric) => (
                  <FunnelMetric key={metric.id} metric={metric} />
                ))}
              </View>
              {leadSummary.leadAlerts.map((alert) => (
                <LeadAlertRow key={alert.id} alert={alert} />
              ))}
              <TouchableOpacity
                style={styles.outlineButton}
                activeOpacity={0.85}
                onPress={() =>
                  router.push(`${areaConfig.basePath}/leads` as never)
                }
              >
                <Eye size={16} color="#006b43" />
                <Text style={styles.outlineButtonText}>Ver detalle</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
      <AppointmentCreateModal
        appointmentLeadOptions={appointmentLeadOptions}
        appointmentPropertyOptions={appointmentPropertyOptions}
        enabledSelectedCalendars={enabledSelectedCalendars}
        isCatalogLoading={isCatalogLoading}
        isCreatingAppointment={isCreatingAppointment}
        isGoogleConnected={isGoogleConnected && !needsGoogleReconnect}
        needsGoogleReconnect={needsGoogleReconnect}
        isLeadsLoading={isLeadsLoading}
        onClose={handleCloseAppointmentModal}
        onCreateAppointment={handleCreateAppointment}
        onSelectCalendar={selectTestAppointmentCalendar}
        onSelectLead={selectAppointmentLead}
        onSelectProperty={selectAppointmentProperty}
        onSelectionScreenChange={setAppointmentSelectionScreen}
        onUpdateForm={updateTestAppointmentForm}
        selectedAppointmentLead={selectedAppointmentLead}
        selectedAppointmentProperty={selectedAppointmentProperty}
        selectionScreen={appointmentSelectionScreen}
        testAppointmentForm={testAppointmentForm}
        visible={isAppointmentModalVisible}
      />
    </SafeAreaView>
  );
}
