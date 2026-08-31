import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { icons } from "@/assets";
import { AppointmentCard } from "./DashboardCards";
import type { AppointmentPreviewItem } from "../../types";

type AppointmentsSectionProps = {
  visibleCalendarAppointments: AppointmentPreviewItem[];
  isCalendarLoading: boolean;
  calendarMessage: string;
  onRefresh: () => void;
  onViewCalendar: () => void;
  onAddAppointment: () => void;
  styles: any;
  selectedAppointment: AppointmentPreviewItem | null;
  isAppointmentInformationVisible: boolean;
  isEditionSectionVisible: boolean;
  selectAppointment: (appointment: AppointmentPreviewItem) => void;
  openAppointmentEdition: () => void;
  closeAppointmentEdition: () => void;
  closeAppointmentInformation: () => void;
  handleDeleteAppointment: (dateId: string) => void;
};

export function AppointmentsSection({
  visibleCalendarAppointments,
  isCalendarLoading,
  calendarMessage,
  onRefresh,
  onViewCalendar,
  onAddAppointment,
  styles,
  selectedAppointment,
  isAppointmentInformationVisible,
  isEditionSectionVisible,
  selectAppointment,
  openAppointmentEdition,
  closeAppointmentEdition,
  closeAppointmentInformation,
  handleDeleteAppointment,
}: AppointmentsSectionProps) {
  return (
    <View style={[styles.panel, styles.appointmentsPanel]}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderTitle}>Citas de esta semana</Text>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onRefresh}
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
        showsVerticalScrollIndicator={false}
      >
        {visibleCalendarAppointments.length === 0 ? (
          <Text style={styles.panelSubtitle}>
            {isCalendarLoading ? "Cargando citas ..." : calendarMessage}
          </Text>
        ) : (
          visibleCalendarAppointments
            .slice(0, 15)
            .map((appointment) => (
              <AppointmentCard
                key={`${appointment.id ?? appointment.property}-${appointment.time}`}
                appointment={appointment}
                isSelected={
                  appointment.id
                    ? selectedAppointment?.id === appointment.id
                    : selectedAppointment === appointment
                }
                isAppointmentInformationVisible={isAppointmentInformationVisible}
                isEditionSectionVisible={isEditionSectionVisible}
                onPress={() => selectAppointment(appointment)}
                onEdit={openAppointmentEdition}
                onCloseInformation={closeAppointmentInformation}
                onCloseEdition={closeAppointmentEdition}
                onDelete={() => {
                  if (appointment.id) handleDeleteAppointment(appointment.id);
                }}
              />
            ))
        )}
      </ScrollView>
      <View style={styles.appointmentActionsRow}>
        <TouchableOpacity
          style={styles.centerButton}
          activeOpacity={0.85}
          onPress={onViewCalendar}
        >
          <Text style={styles.centerButtonText}>Ver calendario</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.centerButton}
          activeOpacity={0.85}
          onPress={onAddAppointment}
        >
          <icons.WhiteCalendar />
          <Text style={styles.centerButtonText}>Agregar cita</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
