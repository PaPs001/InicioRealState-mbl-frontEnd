import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePathname, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";

import { icons } from "@/assets";
import { generalColors } from "@/theme";
import LogoIRSPrincipal from "@/assets/logoIRSprincipal.svg";

import { useSessionDomain } from "@/contexts/auth/use-session-domain";
import {
  formatCurrentDashboardDate,
} from "@/modules/users/main/utils/dashboard-formatters";

import { AppointmentCreateFlow } from "../../components/AppointmentCreateFlow";
import { styles } from "./AdvisorScreen.styles";
import { useOperationMode, useDashboardAreaConfig } from "@/modules/settings";

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
import { AppointmentUpdateFlow } from "../../hooks/useAppointmentUpdateFlow";

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
  const { authToken } = useSessionDomain();

  const { advisorInitials, advisorName, profileAvatarUri, profileImageUpload } =
    useDashboardProfile({ fallbackName: areaConfig.fallbackName });
  const [isPropertyShortcutVisible, setIsPropertyShortcutVisible] = useState(false);
  const { isLeadsLoading, leadSummary } =
    useDashboardLeads({ authToken });

  const {
    rentSummary,
    saleSummary,
  } = useDashboardProperties();

  const {
    calendarMessage,
    isAppointmentModalVisible,
    isCalendarLoading,
    loadGoogleCalendarAppointments,
    setIsAppointmentModalVisible,
    visibleCalendarAppointments,
    selectedAppointment,
    isAppointmentInformationVisible,
    isEditionSectionVisible,
    selectAppointment,
    openAppointmentEdition,
    closeAppointmentEdition,
    closeAppointmentInformation,
    handleDeleteAppointment
  } = useDashboardCalendar({
    authToken,
    capabilities,
    returnPath: pathname,
  });

  const openPropertiesCatalog = (type: "rent" | "sale") => {
    router.push(`${areaConfig.basePath}/properties-list?type=${type}` as never);
  };

  const openCalendarScreen = () => {
    router.push(`${areaConfig.basePath}/date` as never);
  };

  const handleOpenAppointmentModal = () => {
    setIsAppointmentModalVisible(true);
  };

  const handleCloseAppointmentModal = () => {
    setIsAppointmentModalVisible(false);
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
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Mostrar acceso temporal a la propiedad"
          onPress={() => setIsPropertyShortcutVisible((isVisible) => !isVisible)}
          style={styles.logoWrap}
        >
          <LogoIRSPrincipal width={146} height={48} />
        </Pressable>

        {isPropertyShortcutVisible ? (
          <View style={styles.propertyShortcuts}>
            <Pressable
              onPress={() => router.push("/selected-property" as never)}
              style={styles.propertyShortcutButton}
            >
              <Text style={styles.propertyShortcutButtonText}>
                Abrir propiedad seleccionada
              </Text>
            </Pressable>
            <Pressable
              onPress={() => router.push(`${areaConfig.basePath}/properties-list-module` as never)}
              style={styles.propertyShortcutButton}
            >
              <Text style={styles.propertyShortcutButtonText}>
                Abrir nuevo listado
              </Text>
            </Pressable>
          </View>
        ) : null}
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
          selectedAppointment={selectedAppointment}
          isAppointmentInformationVisible={isAppointmentInformationVisible}
          isEditionSectionVisible={isEditionSectionVisible}
          selectAppointment={selectAppointment}
          openAppointmentEdition={openAppointmentEdition}
          closeAppointmentEdition={closeAppointmentEdition}
          closeAppointmentInformation={closeAppointmentInformation}
          handleDeleteAppointment={handleDeleteAppointment}
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
      {selectedAppointment ? (
        <AppointmentUpdateFlow
          appointment={selectedAppointment}
          visible={isEditionSectionVisible}
          onClose={closeAppointmentEdition}
        />
      ): null}  

      {isAppointmentModalVisible ? (
        <AppointmentCreateFlow
          helpedBy={advisorName}
          onClose={handleCloseAppointmentModal}
          visible
        />
      ) : null}
    </SafeAreaView>
  );
}

export function AdvisorScreen() {
  return <UserDashboardScreen area="adviser" />;
}
