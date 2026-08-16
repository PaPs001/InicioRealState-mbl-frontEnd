import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { icons } from "@/assets";
import { AppointmentCard } from "@/components/userDashboard/DashboardCards";

type AppointmentsSectionProps = {
  visibleCalendarAppointments: any[];
  isCalendarLoading: boolean;
  calendarMessage: string;
  onRefresh: () => void;
  onViewCalendar: () => void;
  onAddAppointment: () => void;
  styles: any;
};

export function AppointmentsSection({
  visibleCalendarAppointments,
  isCalendarLoading,
  calendarMessage,
  onRefresh,
  onViewCalendar,
  onAddAppointment,
  styles,
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
        showsVerticalScrollIndicator={visibleCalendarAppointments.length > 5}
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
