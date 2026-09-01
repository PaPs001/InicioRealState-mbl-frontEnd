import { Pressable, Text, View } from "react-native";
import {
  Bell,
  CalendarDays,
  CalendarIcon,
  ChevronRight,
  Edit,
  HouseIcon,
  KeyRoundIcon,
  TextAlignStartIcon,
  Trash,
  User2Icon,
  UserIcon,
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
import { colors } from "@/lib/theme";

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
  const appointmentTone = getAppointmentTone(appointment.appointmentType);
  const isGeneralAppointment = appointmentTone === "general";
  const hasPrimaryDetails = [
    appointment.property,
    appointment.client,
    appointment.description,
    appointment.location,
    appointment.adviser,
    appointment.helpedBy,
    appointment.createdBy,
  ].some(hasText);

  const appointmentType = appointment.appointmentType;

  const appointmentTypeConfig =
    appointmentType === "renta"
      ? {
          label: "Cita renta",
          icon: <KeyRoundIcon size={18} stroke={'#caab5e'}/>,
        }
      : appointmentType === "venta"
        ? {
            label: "Cita venta",
            icon: <HouseIcon size={18} stroke={'#caab5e'}/>,
          }
        : {
            label: "Cita general",
            icon: <CalendarIcon size={18} stroke={'#caab5e'}/>,
          };
  return (
    <View>
      <Pressable
        onPress={onPress}
        style={[
          styles.container,
          appointmentTone === "rent" && styles.appointmentCardRent,
          appointmentTone === "sale" && styles.appointmentCardSale,
          appointmentTone === "general" && styles.appointmentCardGeneral,
        ]}
      >
        <View style={[styles.appointmentContent]}>
          <View style={styles.leftSection}>
            {hasText(appointment.title) ? (
              <View style={styles.appoinmentTitleRow}>
                <View style={styles.appointmentTypeIcon}>{appointmentTypeConfig.icon}</View>
                <View style={styles.appointmentTextRow}>
                  <Text style={styles.appointmentTitle} numberOfLines={1}>
                    {appointment.title}
                  </Text>
                  <View style={[styles.appointmentTypeGeneral,
                    appointmentTone === 'rent' && styles.appointmentTypeRent,
                    appointmentTone === 'sale' && styles.appointmentTypeSale
                  ]}>
                    <Text 
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      style={[styles.appointmentTypeText]}
                    >
                      {appointmentTypeConfig.label}
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
            ) : isGeneralAppointment ? (
              <>
                <View style={styles.contentDirection}>
                  {hasText(appointment.description) ? (
                    <View style={styles.detailRow}>
                      <TextAlignStartIcon
                        width={20}
                        height={20}
                        stroke="#ba902e"
                        strokeWidth={1}
                      />
                      <View style={styles.detailLabel}>
                        <Text
                          style={styles.detailTitle}
                          numberOfLines={1}
                          adjustsFontSizeToFit
                        >
                          DESCRIPCIÓN:{" "}
                        </Text>
                      </View>
                      <Text style={styles.detailText}>
                        {appointment.description}
                      </Text>
                    </View>
                  ) : null}
                  {hasText(appointment.location) ? (
                    <View style={styles.detailRow}>
                      <icons.Place
                        width={20}
                        height={20}
                        stroke="#ba902e"
                        strokeWidth={0.4}
                      />

                      <Text style={styles.detailText} numberOfLines={1}>
                        Lugar cita en {appointment.location}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </>
            ) : (
              <>
                <View style={styles.contentDirection}>
                  {hasText(appointment.property) ? (
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
                      <Text style={styles.detailText} numberOfLines={1}>
                        {appointment.property}
                      </Text>
                    </View>
                  ) : null}

                  {hasText(appointment.client) ? (
                    <View style={styles.detailRow}>
                      <View style={styles.detailLabel}>
                        <UserIcon stroke="#ba902e" width={20} height={20} />

                        <Text style={styles.detailTitle}>CLIENTE: </Text>
                      </View>

                      <Text
                        style={styles.detailText}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                      >
                        {appointment.client}
                      </Text>
                    </View>
                  ) : null}

                  {hasText(appointment.description) ? (
                    <View style={styles.detailRow}>
                      <View style={styles.detailLabel}>
                        <TextAlignStartIcon
                          width={20}
                          height={20}
                          stroke="#ba902e"
                          strokeWidth={1}
                        />
                        <Text
                          style={styles.detailTitle}
                          numberOfLines={1}
                          adjustsFontSizeToFit
                        >
                          DESCRIPCIÓN:{" "}
                        </Text>
                      </View>
                      <Text style={styles.detailText} numberOfLines={2}>
                        {appointment.description}
                      </Text>
                    </View>
                  ) : null}

                  {hasText(appointment.location) ? (
                    <View style={styles.detailRow}>
                      <icons.Place
                        width={20}
                        height={20}
                        stroke="#ba902e"
                        strokeWidth={0.4}
                      />

                      <Text style={styles.detailText} numberOfLines={1}>
                        Lugar cita {appointment.location}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </>
            )}
          </View>

          <View style={styles.rightSection}>
            <View style={styles.dayPill}>
              <CalendarDays size={10} color="#ffffff" />
              <Text
                style={styles.appointmentDay}
                adjustsFontSizeToFit
                numberOfLines={1}
              >
                {appointment.day}
              </Text>
            </View>
            <Text style={styles.appointmentTime}>{appointment.time}</Text>

            {(
              isGeneralAppointment
                ? hasText(appointment.createdBy)
                : hasText(appointment.adviser) || hasText(appointment.helpedBy)
            ) ? (
              <View style={styles.rightDivider} />
            ) : null}

            {isGeneralAppointment ? (
              <>
                {hasText(appointment.createdBy) ? (
                  <View style={styles.adviserInformationContainer}>
                    <View style={styles.circularIconAdviser}>
                      <User2Icon stroke="white" width={18} height={18} />
                    </View>

                    <View style={styles.personInfo}>
                      <Text style={styles.detailText}>CREADO POR</Text>

                      <Text style={styles.detailText} numberOfLines={1}>
                        {appointment.createdBy}
                      </Text>
                    </View>
                  </View>
                ) : null}
              </>
            ) : (
              <>
                {hasText(appointment.adviser) ? (
                  <View style={styles.adviserInformationContainer}>
                    <View style={styles.circularIconAdviser}>
                      <User2Icon stroke="white" width={18} height={18} />
                    </View>

                    <View style={styles.personInfo}>
                      <Text style={styles.detailText}>ASESOR</Text>

                      <Text style={styles.detailText} numberOfLines={1}>
                        {appointment.adviser}
                      </Text>
                    </View>
                  </View>
                ) : null}

                {hasText(appointment.adviser) &&
                hasText(appointment.helpedBy) ? (
                  <View style={styles.rightDivider} />
                ) : null}

                {hasText(appointment.helpedBy) ? (
                  <View style={styles.adviserInformationContainer}>
                    <View style={styles.circularIconHelp}>
                      <User2Icon stroke="white" width={18} height={18} />
                    </View>

                    <View style={styles.personInfo}>
                      <Text style={styles.detailText}>APOYO DE</Text>

                      <Text style={styles.detailText} numberOfLines={1}>
                        {appointment.helpedBy}
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

function getAppointmentTone(appointmentType?: string | null) {
  const normalizedType = appointmentType?.trim().toLowerCase();
  if (normalizedType === "renta") return "rent";
  if (normalizedType === "venta") return "sale";
  if (normalizedType === "general") return "general";
  return null;
}

function formatAppointmentType(appointmentType: string) {
  const normalizedType = appointmentType.trim().toLowerCase();
  if (normalizedType === "renta") return "Renta";
  if (normalizedType === "venta") return "Venta";
  if (normalizedType === "general") return "General";
  return appointmentType;
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
