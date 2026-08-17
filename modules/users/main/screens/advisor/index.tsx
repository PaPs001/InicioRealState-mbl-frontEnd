import { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePathname, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";

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

import {
  formatCurrentDashboardDate,
  getAppointmentEndDateTime,
  getDefaultAppointmentStartDateTime,
} from "@/components/userDashboard/dashboard-formatters";

import { AppointmentCreateModal } from "../../components/AppointmentCreateModal";
import { styles } from "./AdvisorScreen.styles";
import { useOperationMode, useDashboardAreaConfig } from "@/modules/settings";
import { ProfileImageModal } from "@/modules/profile";
import {
  useDashboardCalendar,
  useDashboardLeads,
  useDashboardProfile,
  useDashboardProperties,
} from "../../hooks";

import {
  ProfileHeader,
  HeroCardsSection,
  AppointmentsSection,
  LeadsSection,
} from "../../components/Advisors";

WebBrowser.maybeCompleteAuthSession();

export type UserDashboardArea = "adviser" | "coordinator";

type UserDashboardScreenProps = {
  area: UserDashboardArea;
};

export function UserDashboardScreen({ area }: UserDashboardScreenProps) {
  const { operationMode, capabilities } = useOperationMode();
  const areaConfig = useDashboardAreaConfig(area);
  const router = useRouter();
  const pathname = usePathname();
  const { authToken, currentUser } = useSessionDomain();

  const { advisorInitials, advisorName, profileAvatarUri, profileImageUpload } =
    useDashboardProfile({ fallbackName: areaConfig.fallbackName });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);

  const [testAppointmentForm, setTestAppointmentForm] =
    useState<CreateGoogleCalendarDatePayload>({
      title: "",
      startDateTime: getDefaultAppointmentStartDateTime(),
      endDateTime: getAppointmentEndDateTime(getDefaultAppointmentStartDateTime()),
      timeZone: "America/Mexico_City",
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

  const { appointmentLeadOptions, isLeadsLoading, leadSummary, loadLeads } =
    useDashboardLeads({ authToken });

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
      propertyId: property
        ? lead.propertyId || currentForm.propertyId
        : currentForm.propertyId,
      advisorId,
    }));
    setAppointmentSelectionScreen(null);
  };
  const selectAppointmentProperty = (property: Property) => {
    const propertyId = property.id || property._id;
    if (!propertyId) return;

    setTestAppointmentForm((currentForm) => ({
      ...currentForm,
      propertyId,
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
        (calendar) =>
          calendar.appointmentType?.trim().toLowerCase() === appointmentType,
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
        propertyId: isGeneralAppointment
          ? null
          : testAppointmentForm.propertyId,
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
      const response = await createGoogleCalendarDate(
        authToken,
        appointmentPayload,
      );
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

  const heroColors = useMemo(
    () => ({
      rent: {
        backgroundColor: generalColors.rentColor,
        accentColor: "#d4b66f",
        textColor: "#ffffff",
      },
      sale: {
        backgroundColor: generalColors.saleColor,
        accentColor: "#d4b66f",
        textColor: "#ffffff",
      },
    }),
    [],
  );

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
            {operationMode === "rent"
              ? "Asesor de renta"
              : operationMode === "sale"
                ? "Asesor de venta"
                : operationMode === "both"
                  ? "Asesor Mixto"
                  : null}
          </Text>
          <View style={styles.datePill}>
            <Text style={styles.dateText}>{formatCurrentDashboardDate()}</Text>
          </View>
        </View>

        <ProfileHeader
          advisorInitials={advisorInitials}
          advisorName={advisorName}
          profileAvatarUri={profileAvatarUri}
          areaConfig={areaConfig}
          styles={styles}
        />

        <HeroCardsSection
          operationMode={operationMode}
          area={area}
          rentSummary={rentSummary}
          saleSummary={saleSummary}
          onOpenRent={() => openPropertiesCatalog("rent")}
          onOpenSale={() => openPropertiesCatalog("sale")}
          heroColors={heroColors}
          styles={styles}
        />

        <AppointmentsSection
          visibleCalendarAppointments={visibleCalendarAppointments}
          isCalendarLoading={isCalendarLoading}
          calendarMessage={calendarMessage}
          onRefresh={() => loadGoogleCalendarAppointments({ sync: true })}
          onViewCalendar={openCalendarScreen}
          onAddAppointment={handleOpenAppointmentModal}
          styles={styles}
        />

        <LeadsSection
          isLeadsLoading={isLeadsLoading}
          leadSummary={leadSummary}
          onViewMore={() =>
            router.push(`${areaConfig.basePath}/leads` as never)
          }
          onViewDetail={() =>
            router.push(`${areaConfig.basePath}/leads` as never)
          }
          styles={styles}
        />
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

export function AdvisorScreen() {
  return <UserDashboardScreen area="adviser" />;
}
