import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePathname, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import {
  Bell,
  CalendarDays,
  Eye,
  LogOut,
  Settings,
  CameraIcon,
} from "lucide-react-native";

import { icons } from "@/assets";

import { generalColors } from "@/theme";

import LogoIRSPrincipal from "@/assets/logoIRSprincipal.svg";
import { useSessionDomain } from "@/contexts/auth/use-session-domain";
import {
  createGoogleCalendarDate,
  type CreateGoogleCalendarDatePayload,
  type SelectedGoogleCalendar,
} from "@/lib/api";
import type { Property, PropertyLead } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  AppointmentCard,
  FunnelMetric,
  LeadAlertRow,
  LeadMetricCard,
} from "./DashboardCards";
import {
  formatCurrentDashboardDate,
  getAppointmentEndDateTime,
  getDefaultAppointmentEndDateTime,
  getDefaultAppointmentStartDateTime,
  getDefaultAppointmentType,
} from "./dashboard-formatters";
import { AppointmentCreateModal } from "@/modules/users/main/components/AppointmentCreateModal";
import { styles } from "./UserDashboardScreen.styles";
import { useOperationMode } from "@/modules/settings";
import { ProfileImageModal } from "@/modules/profile";
import {
  useDashboardCalendar,
  useDashboardLeads,
  useDashboardProfile,
  useDashboardProperties,
} from "@/modules/users/main/hooks";
import { HeroCards } from "@/modules/users/main/components/Advisors/HeroCards";
WebBrowser.maybeCompleteAuthSession();
////////

//A eliminar a futuro no tiene necesidad de existencia
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
////////
export function UserDashboardScreen({ area }: UserDashboardScreenProps) {
  const { operationMode, capabilities } = useOperationMode()
  const router = useRouter();
  const pathname = usePathname();
  const {
    authToken,
    currentUser,
  } = useSessionDomain();

  const areaConfig = dashboardAreaConfig[area];
  const {
    advisorInitials,
    advisorName,
    profileAvatarUri,
    profileImageUpload,
  } = useDashboardProfile({ fallbackName: areaConfig.fallbackName });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);

  const [testAppointmentForm, setTestAppointmentForm] = useState<CreateGoogleCalendarDatePayload>({
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

  const {
    appointmentLeadOptions,
    isLeadsLoading,
    leadSummary,
    loadLeads,
  } = useDashboardLeads({ authToken });

  const {
    filteredAppointmentPropertyOptions,
    isCatalogLoading,
    rentSummary,
    saleSummary,
  } = useDashboardProperties(testAppointmentForm.appointmentType);

  const {
    appointmentLeadMode,
    appointmentSelectionScreen,
    calendarMessage,
    changeAppointmentLeadMode: changeCalendarAppointmentLeadMode,
    connectGoogleCalendar,
    disconnectCalendar,
    enabledSelectedCalendars,
    getCalendarSelection,
    googleCalendars,
    isAppointmentModalVisible,
    isCalendarLoading,
    isCalendarSettingsLoading,
    isConnectingCalendar,
    isDisconnectingCalendar,
    isGoogleConnected,
    isSavingCalendarSelection,
    loadGoogleCalendarAppointments,
    loadGoogleCalendarSettings,
    markPrimaryGoogleCalendar,
    needsGoogleReconnect,
    provisionalAppointmentLead,
    saveGoogleCalendarSelection,
    setAppointmentSelectionScreen,
    setIsAppointmentModalVisible,
    toggleGoogleCalendar,
    updateProvisionalAppointmentLead,
    visibleCalendarAppointments,
  } = useDashboardCalendar({
    authToken,
    capabilities,
    returnPath: pathname,
  });

  const selectedAppointmentLead = useMemo(
    () =>
      appointmentLeadOptions.find(
        (lead) => lead.id === testAppointmentForm.leadId,
      ),
    [appointmentLeadOptions, testAppointmentForm.leadId],
  );

  const selectedAppointmentProperty = useMemo(
    () =>
      filteredAppointmentPropertyOptions.find(
        (property) =>
          (property.id || property._id) === testAppointmentForm.propertyId,
      ),
    [filteredAppointmentPropertyOptions, testAppointmentForm.propertyId],
  );

  const openPropertiesCatalog = (type: "rent" | "sale") => {
    router.push(`${areaConfig.basePath}/properties-list?type=${type}` as never);
  };

  const openCalendarScreen = () => {
    router.push(`${areaConfig.basePath}/date` as never);
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

  const changeAppointmentLeadMode = (mode: "existing" | "provisional") => {
    changeCalendarAppointmentLeadMode(mode);

    if (mode === "provisional") {
      setTestAppointmentForm((currentForm) => ({
        ...currentForm,
        leadId: null,
      }));
    }
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
    const property = filteredAppointmentPropertyOptions.find(
      (item) => (item.id || item._id) === lead.propertyId,
    );
    const advisorId = lead.advisorId || lead.agentId || currentUser?.id || null;

    setTestAppointmentForm((currentForm) => ({
      ...currentForm,
      leadId: lead.id,
      propertyId: property ? lead.propertyId || currentForm.propertyId : currentForm.propertyId,
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
    void loadGoogleCalendarSettings();
  };

  const handleCloseAppointmentModal = () => {
    setAppointmentSelectionScreen(null);
    setIsAppointmentModalVisible(false);
  };

  const handleCreateAppointment = async () => {
    if (!authToken || isCreatingAppointment) return;
    const appointmentType =
      testAppointmentForm.appointmentType?.trim().toLowerCase() || "general";
    const isGeneralAppointment = appointmentType === "general";

    if (
      !testAppointmentForm.title.trim() ||
      !testAppointmentForm.startDateTime.trim()
    ) {
      Alert.alert("Faltan datos", "Titulo e inicio son obligatorios.");
      return;
    }

    if (
      !isGeneralAppointment &&
      appointmentLeadMode === "existing" &&
      !testAppointmentForm.leadId
    ) {
      Alert.alert(
        "Falta lead",
        "Selecciona el lead al que se le agendara la cita.",
      );
      return;
    }

    if (
      !isGeneralAppointment &&
      appointmentLeadMode === "provisional" &&
      !provisionalAppointmentLead.fullName.trim()
    ) {
      Alert.alert(
        "Falta nombre",
        "Escribe el nombre del lead provisional para crear la cita.",
      );
      return;
    }

    const canResolveCalendarByType =
      (appointmentType === "renta" || appointmentType === "venta") &&
      enabledSelectedCalendars.some(
        (calendar) => calendar.appointmentType?.trim().toLowerCase() === appointmentType,
      );

    if (!testAppointmentForm.calendarId && !canResolveCalendarByType) {
      Alert.alert(
        "Falta calendario",
        appointmentType === "renta" || appointmentType === "venta"
          ? `Configura un calendario para citas de ${appointmentType}.`
          : "Selecciona el calendario donde quieres crear la cita.",
      );
      return;
    }

    setIsCreatingAppointment(true);
    try {
      const basePayload: CreateGoogleCalendarDatePayload = {
        ...testAppointmentForm,
        leadId: isGeneralAppointment ? null : testAppointmentForm.leadId,
        propertyId: isGeneralAppointment ? null : testAppointmentForm.propertyId,
        endDateTime: getAppointmentEndDateTime(
          testAppointmentForm.startDateTime,
        ),
        advisorId: testAppointmentForm.advisorId || currentUser?.id || null,
        helpedBy: testAppointmentForm.helpedBy || advisorName,
      };
      const appointmentPayload: CreateGoogleCalendarDatePayload =
        isGeneralAppointment
          ? {
              ...basePayload,
              lead: null,
            }
          : appointmentLeadMode === "provisional"
          ? {
              ...basePayload,
              leadId: null,
              lead: {
                fullName: provisionalAppointmentLead.fullName.trim(),
                phone: provisionalAppointmentLead.phone.trim() || null,
                email: provisionalAppointmentLead.email.trim() || null,
              },
            }
          : {
              ...basePayload,
              lead: null,
            };
      const response = await createGoogleCalendarDate(authToken, appointmentPayload);
      await Promise.all([
        loadGoogleCalendarAppointments({ sync: true }),
        loadLeads(),
      ]);
      Alert.alert(
        "Cita creada",
        response.leadResolution.duplicateWarning
          ? "La cita se creo correctamente. Encontramos posibles leads existentes con ese telefono o correo."
          : "La cita se creo correctamente.",
      );
      setIsAppointmentModalVisible(false);
    } catch (error) {
      console.warn("No se pudo crear la cita desde asesor:", error);
      Alert.alert("Error", "No se pudo crear la cita.");
    } finally {
      setIsCreatingAppointment(false);
    }
  };

  const heroColors = useMemo(() => ({
    rent: {
      backgroundColor: generalColors.rentColor,
      accentColor: '#d4b66f',
      textColor: '#ffffff',
    },
    sale: {
      backgroundColor: generalColors.saleColor,
      accentColor: '#d4b66f',
      textColor: '#ffffff',
    },
  }), [])

  const activeHeroColors = operationMode === 'sale'
    ? heroColors.sale
    : heroColors.rent

  const activeHeroSummary = operationMode === 'sale'
    ? saleSummary.propertyCount
    : rentSummary.propertyCount

  const activeHeroCatalogType = operationMode === 'sale'
    ? 'sale'
    : 'rent'

  const activeOpportunityAmount = operationMode === 'sale'
    ? saleSummary.opportunityAmount
    : rentSummary.opportunityAmount

  if (profileImageUpload.isOpen) {
    return (
      <ProfileImageModal
        visible={profileImageUpload.isOpen}
        title={profileImageUpload.title}
        imageUri={profileImageUpload.selectedImage?.uri}
        error={profileImageUpload.error}
        isSaving={profileImageUpload.isSaving}
        onSelectImage={profileImageUpload.pickImage}
        onSave={profileImageUpload.save}
        onClose={profileImageUpload.close}
      />
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
          <View style={styles.datePill}>
            <Text style={styles.dateText}>{formatCurrentDashboardDate()}</Text>
          </View>
        </View>
        <View style={styles.profileRow}>
          <View style={styles.profileLeft}>
            <TouchableOpacity
              style={styles.avatar}
              activeOpacity={0.85}
              onPress={() => {
                router.push(`${areaConfig.basePath}/settings` as never)
              }}
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
          </View>
          <TouchableOpacity style={styles.notification} activeOpacity={0.85}>
            <Bell size={20} color="#c79443" />
          </TouchableOpacity>
        </View>
        <View style={styles.heroCards}>
          {operationMode === 'both' ? (
            <>
              <HeroCards
                Summary={rentSummary.propertyCount}
                OnPress={() => openPropertiesCatalog("rent")}
                colors={heroColors.rent}
              />
              <HeroCards
                Summary={saleSummary.propertyCount}
                OnPress={() => openPropertiesCatalog("sale")}
                colors={heroColors.sale}
              />
            </>
          ): 
          <>
            <HeroCards
              OnPress={() => openPropertiesCatalog(activeHeroCatalogType)}
              Summary={activeHeroSummary}
              colors={activeHeroColors}
            />
          </>
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
                  {formatCurrency(activeOpportunityAmount)}
                </Text>
                <Text style={styles.currency}>MXN</Text>
              </View>
              <Text style={styles.earningsCaption}>Comision aprox.</Text>
            </View>
          ) : null}
        </View>
        <View style={[styles.panel, styles.appointmentsPanel]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderTitle}>Citas de esta semana</Text>
            <TouchableOpacity
              //style={styles.centerButton}
              activeOpacity={0.85}
              onPress={() => loadGoogleCalendarAppointments({ sync: true })}
              disabled={isCalendarLoading}
            >
              <Text style={styles.sectionAction}>
                {isCalendarLoading ? "Cargando..." : "Recargar"}
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.appointmentsScroll}
            contentContainerStyle={styles.appointmentList}
            nestedScrollEnabled
            showsVerticalScrollIndicator={visibleCalendarAppointments.length > 5}
          >
            {visibleCalendarAppointments.length === 0 ? (
              <Text style={styles.panelSubtitle}>
                {isCalendarLoading
                  ? "Cargando citas ..."
                  : calendarMessage}
              </Text>
            ) : (
              visibleCalendarAppointments
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
              onPress={openCalendarScreen}
            >
              <Text style={styles.centerButtonText}>
                Ver calendario
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.centerButton}
              activeOpacity={0.85}
              onPress={handleOpenAppointmentModal}
            >
              <icons.WhiteCalendar />
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
        appointmentLeadMode={appointmentLeadMode}
        appointmentLeadOptions={appointmentLeadOptions}
        appointmentPropertyOptions={filteredAppointmentPropertyOptions}
        enabledSelectedCalendars={enabledSelectedCalendars}
        isCatalogLoading={isCatalogLoading}
        isCreatingAppointment={isCreatingAppointment}
        isGoogleConnected={isGoogleConnected && !needsGoogleReconnect}
        needsGoogleReconnect={needsGoogleReconnect}
        isLeadsLoading={isLeadsLoading}
        onClose={handleCloseAppointmentModal}
        onCreateAppointment={handleCreateAppointment}
        onLeadModeChange={changeAppointmentLeadMode}
        onSelectCalendar={selectTestAppointmentCalendar}
        onSelectLead={selectAppointmentLead}
        onSelectProperty={selectAppointmentProperty}
        onSelectionScreenChange={setAppointmentSelectionScreen}
        onUpdateProvisionalLead={updateProvisionalAppointmentLead}
        onUpdateForm={updateTestAppointmentForm}
        provisionalLead={provisionalAppointmentLead}
        selectedAppointmentLead={selectedAppointmentLead}
        selectedAppointmentProperty={selectedAppointmentProperty}
        selectionScreen={appointmentSelectionScreen}
        testAppointmentForm={testAppointmentForm}
        visible={isAppointmentModalVisible}
      />
    </SafeAreaView>
  );
}
