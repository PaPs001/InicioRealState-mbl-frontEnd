import { useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  ChevronDown,
  ChevronUp,
  EllipsisVertical,
  MapPin,
  Pencil,
  Trash,
  UserRound,
  UsersRound,
} from "lucide-react-native";

import type { GoogleCalendarDate } from "@/lib/api";
import { generalColors } from "@/theme";

type EventCardProps = {
  appointment: GoogleCalendarDate;
  onDelete: (appointment: GoogleCalendarDate) => void;
  onEdit: (appointment: GoogleCalendarDate) => void;
};

function formatTime(value?: string | null, timeZone?: string | null) {
  if (!value || !value.includes("T")) return null;
  try {
    return new Intl.DateTimeFormat("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: timeZone || undefined,
    }).format(new Date(value));
  } catch {
    return new Intl.DateTimeFormat("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(value));
  }
}

function getAppointmentSchedule(appointment: GoogleCalendarDate) {
  const startTime = formatTime(appointment.startDateTime, appointment.timeZone);
  const endTime = formatTime(appointment.endDateTime, appointment.timeZone);
  if (!startTime || !endTime) return "Todo el día";
  return `${startTime} – ${endTime}`;
}

function getAppointmentType(value?: string | null) {
  if (!value) return "General";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function getAdvisorName(appointment: GoogleCalendarDate) {
  return (
    appointment.advisor?.name ||
    appointment.externalAdvisorName ||
    "Sin asignar"
  );
}

export function EventCard({ appointment, onDelete, onEdit }: EventCardProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [showInformation, setShowInformation] = useState(false);
  const appointmentType = appointment.appointmentType?.toLowerCase();
  const isRent = appointmentType === "renta";
  const isSale = appointmentType === "venta";
  const clientName = appointment.lead?.name || "Sin cliente relacionado";

  return (
    <View
      style={[
        styles.container,
        isRent && styles.rentContainer,
        isSale && styles.saleContainer,
      ]}
    >
      <View style={styles.mainRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            showInformation
              ? "Ocultar información de la cita"
              : "Mostrar información de la cita"
          }
          style={styles.informationContainer}
          onPress={() => setShowInformation((current) => !current)}
        >
          <View style={styles.summaryTopRow}>
            <View style={styles.schedulePill}>
              <Text style={styles.scheduleText}>
                {getAppointmentSchedule(appointment)}
              </Text>
            </View>
            <Text style={styles.typeText}>
              {getAppointmentType(appointment.appointmentType)}
            </Text>
          </View>
          <View style={styles.titleRow}>
            <Text style={styles.titleText} numberOfLines={2}>
              {appointment.title || "Cita sin título"}
            </Text>
            {showInformation ? (
              <ChevronUp size={18} color="#ffffff" />
            ) : (
              <ChevronDown size={18} color="#ffffff" />
            )}
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Opciones de la cita"
          style={styles.optionsButton}
          onPress={() => setShowOptions((current) => !current)}
        >
          <EllipsisVertical size={22} color="#ffffff" />
        </Pressable>

        {showOptions ? (
          <View style={styles.actionsContainer}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Editar cita"
              style={styles.actionButton}
              onPress={() => {
                setShowOptions(false);
                onEdit(appointment);
              }}
            >
              <Pencil size={19} color="#25483e" />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Eliminar cita"
              style={styles.actionButton}
              onPress={() => {
                setShowOptions(false);
                onDelete(appointment);
              }}
            >
              <Trash size={19} color="#a83e3e" />
            </Pressable>
          </View>
        ) : null}
      </View>

      {showInformation ? (
        <View style={styles.detailsContainer}>
          <DetailRow
            icon={<UserRound size={18} color="#3d5a40" />}
            label="Cliente"
            value={clientName}
          />
          <DetailRow
            icon={<UserRound size={18} color="#3d5a40" />}
            label="Asesor encargado"
            value={getAdvisorName(appointment)}
          />
          {appointment.helpedBy ? (
            <DetailRow
              icon={<UsersRound size={18} color="#3d5a40" />}
              label="Persona de apoyo"
              value={appointment.helpedBy}
            />
          ) : null}
          <DetailRow
            icon={<MapPin size={18} color="#3d5a40" />}
            label="Ubicación"
            value={appointment.location || "No especificada"}
          />
          <View style={styles.descriptionContainer}>
            <Text style={styles.detailLabel}>Descripción</Text>
            <Text style={styles.descriptionText}>
              {appointment.description ||
                "No se agregó una descripción para esta cita."}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>{icon}</View>
      <View style={styles.detailCopy}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "hidden",
    borderRadius: 16,
    backgroundColor: generalColors.general     ,
    elevation: 2,
    shadowColor: "#17251f",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
  },
  rentContainer: { backgroundColor: generalColors.rentColor },
  saleContainer: { backgroundColor: generalColors.saleColor },
  mainRow: { flexDirection: "row", alignItems: "stretch" },
  informationContainer: {
    flex: 1,
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  summaryTopRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  schedulePill: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  scheduleText: { color: "#ffffff", fontSize: 11, fontWeight: "700" },
  typeText: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 12,
    fontWeight: "600",
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  titleText: {
    flex: 1,
    color: "#ffffff",
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "700",
  },
  optionsButton: { width: 45, alignItems: "center", justifyContent: "center" },
  actionsContainer: { flexDirection: "row", backgroundColor: "#fffdf9" },
  actionButton: { width: 44, alignItems: "center", justifyContent: "center" },
  detailsContainer: {
    gap: 13,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fffdf9",
  },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 11 },
  detailIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    backgroundColor: "#eef1eb",
  },
  detailCopy: { flex: 1, gap: 2 },
  detailLabel: {
    color: "#738078",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  detailValue: {
    color: "#20352e",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "600",
  },
  descriptionContainer: {
    gap: 5,
    marginTop: 2,
    padding: 12,
    borderRadius: 11,
    backgroundColor: "#f3f0e9",
  },
  descriptionText: { color: "#3e4c46", fontSize: 13, lineHeight: 19 },
});
