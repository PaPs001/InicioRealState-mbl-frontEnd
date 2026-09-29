import { Pressable, Text, View } from "react-native";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  Edit,
  Hourglass,
  HourglassIcon,
  Trash,
} from "lucide-react-native";

import { styles } from "./styles/DashboardCards.styles";
import type {
  AppointmentPreviewItem,
  DashboardLeadAlert,
  DashboardMetric,
  DashboardPriority,
} from "@/modules/users/main/types";
import { icons } from "@/assets";
import { generalColors, textColor } from "@/theme";
import { capitalizeWords } from "@/lib/utils";
import { getAppointmentTypeConfig } from "@/lib/config/appointment-Types";

const toneColors = {
  neutral: { background: "#ffffff", border: "#e4e4e4", text: "#2a2d31" },
  success: { background: "#e5f8e9", border: "#b5dfbd", text: "#2c7a3f" },
  warning: { background: "#ecdab5", border: "#d8bd85", text: "#c27a20" },
  danger: { background: "#ffe1dd", border: "#ffc5bc", text: "#f05a64" },
} as const;

export function PriorityCard({
  priority,
  highlight,
}: {
  priority: DashboardPriority;
  highlight?: boolean;
}) {
  return (
    <View style={styles.priorityCard}>
      <Text
        style={[styles.priorityValue, highlight && styles.priorityValueGold]}
      >
        {priority.value}
      </Text>
      <Text style={styles.priorityLabel}>{priority.label}</Text>
    </View>
  );
}

export function AppointmentCard({
  appointment,
  onPress,
  isSelected,
  onEdit,
  onDelete,
}: {
  onPress: () => void;
  appointment: AppointmentPreviewItem;
  isSelected: boolean;
  isAppointmentInformationVisible: boolean;
  isEditionSectionVisible: boolean;
  onEdit: () => void;
  onCloseInformation: () => void;
  onCloseEdition: () => void;
  onDelete: () => void;
}) {
  const appointmentTypeConfig = getAppointmentTypeConfig(
    appointment.appointmentType,
  );
  const isIndependentAppointment =
    appointmentTypeConfig.lead === "none" &&
    appointmentTypeConfig.property === "none";
  const hasPrimaryDetails = [
    appointment.property,
    appointment.client,
    appointment.description,
    appointment.location,
    appointment.adviser,
    appointment.helpedBy,
    appointment.createdBy,
  ].some(hasText);

  function getAppointmentDuration(
    startDateTime?: string | null,
    endDateTime?: string | null,
  ) {
    if (!startDateTime || !endDateTime) return null;

    const durationMs =
      new Date(endDateTime).getTime() - new Date(startDateTime).getTime();

    if (durationMs <= 0) return null;

    return Math.round(durationMs / 60_000);
  }

  const minutes = getAppointmentDuration(
    appointment.startDateTime,
    appointment.endDateTime,
  );

  function formatDuration(minutes: number | null) {
    if (!minutes || minutes <= 0) return "Duración no definida";

    if (minutes < 60) {
      return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return `${hours}:${String(remainingMinutes).padStart(2, "0")} h`;
  }

  const subdivision = appointmentTypeConfig.subdivisionTypes?.find(
    option => option.value === appointment.subtypeCalendar,
  );

  const appointmentColor = subdivision?.color ?? appointmentTypeConfig.color;
  return (
    <View>
      <Pressable
        onPress={onPress}
        style={[
          styles.container,
          {
            backgroundColor: appointmentColor,
          },
        ]}
      >
        <View style={[styles.appointmentContent]}>
          <View style={styles.leftSection}>
            {hasText(appointment.title) ? (
              <View style={styles.appoinmentTitleRow}>
                <View style={styles.appointmentTextRow}>
                  <View>
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      style={[styles.appointmentTypeText]}
                    >
                      {(
                        appointmentTypeConfig.cardLabel ??
                        `${appointmentTypeConfig.label}`
                      ).toUpperCase()}{" "}
                      :
                    </Text>
                  </View>
                  {/*<View
                    style={[
                      styles.appointmentTypeGeneral,
                      appointmentTone === "rent" && styles.appointmentTypeRent,
                      appointmentTone === "sale" && styles.appointmentTypeSale,
                    ]}
                  ></View>*/}
                  <View
                    style={{
                      marginLeft: 10,
                    }}
                  >
                    <Text style={styles.appointmentTitle} numberOfLines={2}>
                      {appointment.title.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
            ) : null}
            {!hasPrimaryDetails ? (
              <View style={styles.googleCalendarEmptyState}>
                <Text style={styles.googleCalendarEmptyText}>
                  Esta cita proviene de Google Calendar o no fue creada con
                  contexto suficiente.
                </Text>
              </View>
            ) : isIndependentAppointment ? (
              <>
                <View style={styles.contentDirection}>
                  {hasText(appointment.location) ? (
                    <View style={styles.detailRow}>
                      <icons.MapPin width={20} height={20} />
                      <View style={styles.detailCopy}>
                        <Text
                          style={styles.titleDetailText}
                          numberOfLines={2}
                          adjustsFontSizeToFit
                        >
                          Lugar de la cita:
                        </Text>
                        <Text style={styles.subtitleDetailText}>
                          {appointment.location.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  ) : null}
                </View>
              </>
            ) : (
              <>
                <View style={styles.contentDirection}>
                  {/*{hasText(appointment.property) ? (
                    <View style={styles.detailRow}>
                      <View style={styles.detailLabel}>
                        <icons.BuildingApartment
                          stroke="#ba902e"
                          strokeWidth={0.5}
                          width={20}
                          height={20}
                        />
                        <Text
                          style={styles.detailTitle}
                          adjustsFontSizeToFit
                          numberOfLines={1}
                        >
                          PROYECTO:
                        </Text>
                      </View>
                      <Text style={styles.titleDetailText} numberOfLines={1}>
                        {appointment.property}
                      </Text>
                    </View>
                  ) : null}*/}

                  {hasText(appointment.client) ? (
                    <View style={styles.detailRow}>
                      <View style={styles.detailLabel}>
                        <icons.User width={20} height={20} />
                        <View style={styles.detailCopy}>
                          <Text style={styles.titleDetailText}>Cliente</Text>
                          <Text
                            style={styles.subtitleDetailText}
                            numberOfLines={2}
                          >
                            {appointment.client.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ) : null}

                  {hasText(appointment.location) ? (
                    <View style={styles.detailRow}>
                      <icons.MapPin width={20} height={20} />
                      <View style={styles.detailCopy}>
                        <Text style={styles.titleDetailText} numberOfLines={2}>
                          Lugar de la cita:
                        </Text>
                        <Text style={styles.subtitleDetailText}>
                          {appointment.location.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  ) : null}
                </View>
              </>
            )}
          </View>

          <View style={styles.rightSection}>
            <View style={styles.verticalDivider} />
            <View style={styles.dayPill}>
              <CalendarDays size={10} color={appointmentTypeConfig.color} />
              <Text
                style={[
                  styles.appointmentDay,
                  {
                    color: appointmentTypeConfig.color,
                  },
                ]}
                adjustsFontSizeToFit
                numberOfLines={1}
              >
                {appointment.day}
              </Text>
            </View>
            <View
              style={{
                marginTop: 27,
                flexDirection: 'row',
                gap: 5,
                alignItems: 'baseline',
              }}
            >
              <Text style={styles.appointmentTime}>{appointment.time}</Text>
              <View style={styles.dateDurationContainer}>
                <HourglassIcon size={6}/>
                <Text style={{
                  fontSize: 7,
                  color: appointmentTypeConfig.color
                }}>{formatDuration(minutes)}</Text>
              </View>
            </View>
            <View style={styles.rightDivider} />

            {/*{(
              isIndependentAppointment
                ? hasText(appointment.createdBy)
                : hasText(appointment.adviser) || hasText(appointment.helpedBy)
            )? (
            ) : null}*/}

            {isIndependentAppointment ? (
              <>
                {hasText(appointment.createdBy) ? (
                  <View style={styles.adviserInformationContainer}>
                    <View style={styles.circularIconAdviser}>
                      <icons.User width={18} height={18} />
                    </View>

                    <View style={styles.personInfo}>
                      <Text style={styles.titleAdviserText}>Creado por</Text>

                      <Text style={styles.adviserNameText} numberOfLines={1}>
                        {capitalizeWords(appointment.createdBy)}
                      </Text>
                    </View>
                  </View>
                ) : null}
              </>
            ) : (
              <>
                {hasText(appointment.adviser) ? (
                  <View
                    style={[
                      styles.adviserInformationContainer,
                      {
                        paddingBottom: 8,
                      },
                    ]}
                  >
                    <View style={styles.circularIconAdviser}>
                      <icons.User width={18} height={18} />
                    </View>

                    <View style={styles.personInfo}>
                      <Text style={styles.titleAdviserText}>Asesor</Text>

                      <Text style={styles.adviserNameText} numberOfLines={1}>
                        {capitalizeWords(appointment.adviser)}
                      </Text>
                    </View>
                  </View>
                ) : null}

                {hasText(appointment.helpedBy) ? (
                  <View style={styles.adviserInformationContainer}>
                    <View style={styles.circularIconHelp}>
                      <icons.User width={18} height={18} />
                    </View>

                    <View style={styles.personInfo}>
                      <Text style={styles.titleAdviserText}>Apoyo de</Text>

                      <Text style={styles.adviserNameText} numberOfLines={1}>
                        {capitalizeWords(appointment.helpedBy)}
                      </Text>
                    </View>
                  </View>
                ) : null}
              </>
            )}
          </View>
        </View>
      </Pressable>
      {isSelected ? (
        <View pointerEvents="box-none" style={styles.selectionButtons}>
          <Pressable
            onPress={onEdit}
            style={[styles.editionButton, styles.button]}
          >
            <Edit
              height={"45%"}
              width={"45%"}
              stroke={textColor.accentGolden}
            />
          </Pressable>
          <Pressable
            onPress={onDelete}
            style={[styles.deleteButton, styles.button]}
          >
            <Trash height={"45%"} width={"45%"} stroke={"red"} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function hasText(value?: string | null): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function LeadMetricCard({ metric }: { metric: DashboardMetric }) {
  const tone = toneColors[metric.tone];

  return (
    <View
      style={[
        styles.metricCard,
        { backgroundColor: tone.background, borderColor: tone.border },
      ]}
    >
      <Text style={[styles.metricValue, { color: tone.text }]}>
        {metric.value}
      </Text>
      <Text style={styles.metricLabel}>{metric.label}</Text>
    </View>
  );
}

export function FunnelMetric({ metric }: { metric: DashboardMetric }) {
  return (
    <View style={styles.funnelItem}>
      <Text style={styles.funnelValue}>{metric.value}</Text>
      <Text style={styles.funnelLabel}>{metric.label}</Text>
    </View>
  );
}

export function LeadAlertRow({ alert }: { alert: DashboardLeadAlert }) {
  return (
    <View style={styles.alertRow}>
      <Bell size={15} color="#e95454" />
      <Text style={styles.alertText} numberOfLines={1}>
        {alert.message}
      </Text>
      <ChevronRight size={14} color="#2a2d31" />
    </View>
  );
}
