import { 
  ScrollView, 
  Text, 
  View, 
  Image, 
  Pressable, 
  Alert 
} from 'react-native'
import { router } from 'expo-router'
import { usePathname } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { SettingsOption } from '../components/SettingsOption'
import { useAppSettings } from '../hooks'
import type { OperationMode } from '../types'
import { SvgProps } from 'react-native-svg'
import { 
  icons,
  logos
} from '@/assets'
import { ComponentType, FC, SVGProps, useCallback, useEffect, useState } from 'react'
import {useSessionDomain} from "@/contexts/auth/use-session-domain"
import {
  API_URLS,
  getGoogleCalendarDates,
  getUploadedProfileImage,
  getGoogleCalendarConnectionStatus,
  getGoogleCalendars,
  getSelectedGoogleCalendars,
  getGoogleCalendarAuthUrl,
  disconnectGoogleCalendar,
  saveSelectedGoogleCalendars,
  syncGoogleCalendars,
  type GoogleCalendarConnectionStatus,
  type GoogleCalendarOption,
  type SelectedGoogleCalendar
} from "@/lib/api"
import * as FileSystem from "expo-file-system/legacy"
import * as Linking from "expo-linking"
import * as WebBrowser from "expo-web-browser"
import {
  mapGoogleDateToAppointment,
  getInitials,
  getDefaultAppointmentType
} from "@/components/userDashboard/dashboard-formatters"
import {styles} from './AppSettingsScreen.style'
import { useHideBottomNav } from '@/lib/navigation/bottom-nav-visibility'

import {
  AppointmentPreviewItem,
} from '@/components/userDashboard/types'
import { blue } from 'react-native-reanimated/lib/typescript/Colors'

const operationOptions: Array<{
  value: OperationMode
  label: string
  description: string
  icon: ComponentType<SvgProps>
  height: number
  width: number
}> = [
  { value: 'rent', label: 'Rentas', description: 'Prioriza rentas y sus seguimientos.', icon: icons.House, height: 20, width: 20 },
  { value: 'sale', label: 'Ventas', description: 'Prioriza ventas y oportunidades.', icon: icons.BuildingApartment, height: 20, width: 20 },
  { value: 'both', label: 'Mixto', description: 'Muestra todas las funciones e inventario.', icon: icons.Blend, height: 30, width: 30 },
]

export type UserDashboardArea = "adviser" | "coordinator";

type UserDashboardScreenProps = {
  area: UserDashboardArea;
};

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

export function AppSettingsScreen(
  { area }: UserDashboardScreenProps
) {
  useHideBottomNav();

  const {
    authToken,
    currentUser,
    logout,
    refreshToken,
    setAuthSession,
  } = useSessionDomain();
  const pathname = usePathname();
  /// Estados
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [calendarAppointments, setCalendarAppointments] = useState<AppointmentPreviewItem[]>([]);
  const [calendarMessage, setCalendarMessage] = useState("Conecta Google Calendar para cargar tus citas reales.",);
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);
  const [googleConnectionStatus, setGoogleConnectionStatus] = useState<GoogleCalendarConnectionStatus | null>(null);
  const [googleCalendars, setGoogleCalendars] = useState<GoogleCalendarOption[]>([]);
  const [selectedGoogleCalendars, setSelectedGoogleCalendars] = useState<SelectedGoogleCalendar[]>([]);
  const [isCalendarSettingsLoading, setIsCalendarSettingsLoading] = useState(false);
  const [isConnectingCalendar, setIsConnectingCalendar] = useState(false);
  const [isDisconnectingCalendar, setIsDisconnectingCalendar] = useState(false);
  const [isSavingCalendarSelection, setIsSavingCalendarSelection] = useState(false);
  
  
  const [profileAvatarUri, setProfileAvatarUri] = useState<string | null>(null)
  const areaConfig = dashboardAreaConfig[area];
  const advisorName = 
  currentUser?.name.trim() || 
  currentUser?.email?.split("@")[0] ||
  areaConfig.fallbackName;
  const advisorInitials = getInitials(advisorName);
  const needsGoogleReconnect = googleConnectionStatus?.status === "requires_reconnect";

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
      console.warn("No se pudo guardar la seleccion de calendarios del asesor:", error,);
    } finally {
      setIsSavingCalendarSelection(false);
    }
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
  const loadCalendarDates = useCallback(
    async(options: {sync?: boolean} = {}) => {
      if(!authToken){
        setCalendarAppointments([]);
        setIsGoogleConnected(false);
        setCalendarMessage("Inicia sesion para cargar tus citas reales.");
        return;
      }
      setIsCalendarLoading(true);
      try {
        const dates = await getGoogleCalendarDates(authToken, { sync: options.sync, });
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
        console.warn( "No se pudieron cargar las citas de Google Calendar para asesor:", error,);
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
          setCalendarMessage("Conecta Google Calendar para cargar tus citas reales.",);
        }
      } finally {
        setIsCalendarLoading(false);
      }
  }, [authToken], );

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

  const handleDisconnectGoogleCalendar = () => {
    if (!authToken || isDisconnectingCalendar) return;
    Alert.alert("Desconectar Google", "Quieres desconectar la cuenta de Google de esta sesion?",
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
                console.warn("No se pudo desconectar Google Calendar en asesor:", error, );
            } finally {
              setIsDisconnectingCalendar(false);
            }
          },
        },
      ],
    );
  };

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
  
  const profilePhotoCacheDirectory = `${FileSystem.cacheDirectory || FileSystem.documentDirectory || ""}profile-photos/`;
  
  function getProfilePhotoImageUrl(storageKey: string) {
    return `${API_URLS.CORE}/uploads/file?key=${encodeURIComponent(storageKey)}`;
  }
  function getProfilePhotoRequestHeaders(token?: string | null){
    const headers: Record<string, string> = {
      Accept: "image/*",
    };
  
    if(API_URLS.CORE.includes("ngrok-free")){
      headers["ngrok-skip-browser-warning"] = "true";
    }
  
    if(token){
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }
  
  function getProfilePhotoCacheFilename(storageKey: string, contentType?: string){
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
  ){
    if(!profilePhotoCacheDirectory){
      throw new Error("No hay directorio de cache para la foto de perfil")
    }
    await FileSystem.makeDirectoryAsync(profilePhotoCacheDirectory, {intermediates: true}).catch(() => undefined);
  
    const fileUri = `${profilePhotoCacheDirectory}${getProfilePhotoCacheFilename(storageKey, contentType)}`;const cachedFile = await FileSystem.getInfoAsync(fileUri);
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

  const {
    operationMode,
    setOperationMode,
  } = useAppSettings()


  //Esto es temporal para prueba rapida

  const [isActive, setIsActive] = useState(false)
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Pressable 
            style={styles.backButton}
            onPress={router.back}
          >
            <icons.BackButton/>
          </Pressable>
          <View style={styles.headerLogo}>
            <logos.irsPrincipal />
          </View>
        </View>
        <View style={styles.profileInformationContainer}>
          <View style={styles.userInfoRow}>
            <View style={styles.profileAvatarContainer}>
              {profileAvatarUri ? (
                <Image source={{ uri: profileAvatarUri }} style={styles.avatarImage} resizeMode="cover" />
              ): (
                <Text style={styles.avatarText}>
                  {advisorInitials}
                </Text>
              )}
            </View>
            <View style={styles.userinformationContainer}>
              <View style={styles.userTextContainer}>
                <Text style={styles.userName}>
                  {advisorName}
                </Text>
                <Text style={styles.adviserText}> 
                  Asesor de INICIO Real Estate
                </Text>
              </View>
              <Pressable style={styles.activeStatusContainer}>
                <View style={styles.activeStatus}>
                  <View style={styles.point}/>
                  <Text style={styles.statusText}>
                    Activo
                  </Text>
                </View>
                {/*<View style={styles.activeStatus}>
                  <Text style={styles.statusText}>
                    Ocupado
                  </Text>
                </View>*/}
              </Pressable>
            </View>
          </View>
          <View style={styles.editProfileRow}>
            <Pressable style={styles.editButton}>
              <icons.Pencil/>
              <Text style={styles.editText}>
                Editar perfil
              </Text>
            </Pressable>
            <Pressable style={styles.editButton}>
              <icons.Camera/>
              <Text style={styles.editText}>
                Cambiar Foto
              </Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.optionsSection}>
          <View style={styles.optionsHeader}>
            <icons.BriefcaseBussines />
            <Text style={styles.sectionTitle}>
              Perfil Comercial
            </Text>
          </View>
          <View style={styles.options}>
            {operationOptions.map((option, index) => {
              const position = 
                index === 0 
                  ? 'left' 
                : index === operationOptions.length - 1 
                  ? 'right' 
                : 'center';
              return (
                <SettingsOption
                  key={option.value}
                  {...option}
                  selectedValue={operationMode}
                  onSelect={setOperationMode}
                  position={position}
                />
              );
            })}
          </View>
        </View>
        <View style={styles.calendarSection}>
          <View style={styles.calendarHeader}>
            <icons.calendarDatesMobile width={20} height={20} fill='#d4b66f'/>
            <Text style={styles.sectionTitle}>
              Calendario
            </Text>
          </View>
          <View>

            <View>
              <Text>
                Calendarios Conectados
              </Text>
              <Pressable
                style={styles.calendarSmallButton}
                disabled={isCalendarSettingsLoading}
                onPress={loadGoogleCalendarSettings}
              >
                <Text style={styles.calendarSmallButtonText}>
                  {isCalendarSettingsLoading ? "Cargando" : "Actualizar"}
                </Text>
              </Pressable>
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
                          <Pressable
                            style={[
                              styles.calendarToggle,
                              isEnabled && styles.calendarToggleActive,
                            ]}
                            onPress={() => toggleGoogleCalendar(calendar)}
                          >
                            <Text
                              style={[
                                styles.calendarToggleText,
                                isEnabled && styles.calendarToggleTextActive,
                              ]}
                            >
                              {isEnabled ? "En uso" : "Usar"}
                            </Text>
                          </Pressable>
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
                              {selection?.appointmentType || getDefaultAppointmentType(calendar.summary)}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                </View>
              )}
              <View style={styles.calendarActionsRow}>
                <Pressable
                  style={styles.calendarActionButton}
                  disabled={isSavingCalendarSelection}
                  onPress={handleSaveGoogleCalendarSelection}
                >
                  <Text style={styles.calendarActionButtonText}>
                    {isSavingCalendarSelection
                      ? "Guardando..."
                      : "Guardar calendarios"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
          <View>
            <Pressable
              style={
                  isGoogleConnected && !needsGoogleReconnect
                    ? styles.outlineButton
                    : styles.centerButton
                }
                disabled={isConnectingCalendar || isDisconnectingCalendar}
                onPress={
                  isGoogleConnected && !needsGoogleReconnect
                    ? handleDisconnectGoogleCalendar
                    : handleConnectGoogleCalendar
                }
              >
                {isGoogleConnected && !needsGoogleReconnect ? (
                  <icons.BackButton/>
                ) : (
                  <icons.BackButton/>
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
            </Pressable>
          </View>
        </View>
        <View style={styles.finalSection}>
          <Pressable style={styles.logOutButton}>
            <icons.Power/>
            <Text style={styles.logOutText}>
              Cerrar Sesion
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default AppSettingsScreen
