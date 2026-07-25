import { useMemo, useState, type ReactNode } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import {
  ArrowLeft,
  Bot,
  CalendarDays,
  CalendarPlus,
  CreditCard,
  Mail,
  MessageCircle,
  MessageSquareText,
  Phone,
  Repeat2,
  Sparkles,
  UserRound,
} from "lucide-react-native";
import { useHideBottomNav } from "@/lib/navigation/bottom-nav-visibility";
import type { PropertyLead } from "@/lib/types";
import { styles } from "./leads.styles";

export function LeadDetailView({
  customLeadStatuses = [],
  getPropertyName,
  isLoadingCustomLeadStatuses = false,
  lead,
  mode = "coordinator",
  onApplyCustomStatus,
  onApplyNextAction,
  onBack,
  onViewFollowUps,
}: {
  customLeadStatuses?: string[];
  getPropertyName: (propertyId: string) => string | undefined;
  isLoadingCustomLeadStatuses?: boolean;
  lead: PropertyLead;
  mode?: "coordinator" | "advisor";
  onApplyCustomStatus?: (
    leadId: string,
    status: string,
  ) => Promise<unknown> | unknown;
  onApplyNextAction?: (
    leadId: string,
    nextAction: string,
    nextActionAt: string,
  ) => Promise<unknown> | unknown;
  onBack: () => void;
  onViewFollowUps: () => void;
}) {
  useHideBottomNav();

  const [customStatusInput, setCustomStatusInput] = useState("");
  const [customStatusError, setCustomStatusError] = useState<string | null>(
    null,
  );
  const [isSavingCustomStatus, setIsSavingCustomStatus] = useState(false);
  const [nextActionInput, setNextActionInput] = useState(lead.nextAction || "");
  const [nextActionAtInput, setNextActionAtInput] = useState(
    formatDateInput(lead.nextActionAt || lead.nextFollowUpAt || ""),
  );
  const [nextActionError, setNextActionError] = useState<string | null>(null);
  const [isSavingNextAction, setIsSavingNextAction] = useState(false);

  const propertyName =
    getPropertyName(lead.propertyId) || "Sin propiedad asignada";
  const nextAction =
    lead.nextAction || lead.notes || "Definir siguiente accion";
  const advisorName = lead.assignedAgentName || "Sin asesor";
  const advisorStatusLabel = formatAdvisorStatus(
    lead.advisorStatus || lead.status,
  );
  const systemStatusLabel = formatSystemStatus(lead.systemStatus);
  const primaryStatusLabel =
    mode === "coordinator" ? systemStatusLabel : advisorStatusLabel;
  const canManageCustomStatus =
    mode === "advisor" && Boolean(onApplyCustomStatus);
  const canManageNextAction = mode === "advisor" && Boolean(onApplyNextAction);
  const visibleCustomStatuses = useMemo(() => {
    const statuses = new Set(
      customLeadStatuses.map((status) => status.trim()).filter(Boolean),
    );
    if (lead.advisorStatus) statuses.add(lead.advisorStatus);
    return Array.from(statuses);
  }, [customLeadStatuses, lead.advisorStatus]);

  const applyCustomStatus = async (status: string) => {
    const normalizedStatus = status.trim();
    if (!normalizedStatus || !onApplyCustomStatus) return;

    setIsSavingCustomStatus(true);
    setCustomStatusError(null);
    try {
      await onApplyCustomStatus(lead.id, normalizedStatus);
      setCustomStatusInput("");
    } catch (error) {
      console.warn(
        "No se pudo actualizar el estado personalizado del lead:",
        error,
      );
      setCustomStatusError(
        "No se pudo actualizar el estado. Intenta de nuevo.",
      );
    } finally {
      setIsSavingCustomStatus(false);
    }
  };

  const applyNextAction = async () => {
    const normalizedAction = nextActionInput.trim();
    const normalizedDate = normalizeDateInput(nextActionAtInput);

    if (!normalizedAction) {
      setNextActionError("Escribe la accion a realizar.");
      return;
    }

    if (!normalizedDate) {
      setNextActionError("Escribe una fecha valida.");
      return;
    }

    if (!onApplyNextAction) return;

    setIsSavingNextAction(true);
    setNextActionError(null);
    try {
      await onApplyNextAction(lead.id, normalizedAction, normalizedDate);
    } catch (error) {
      console.warn("No se pudo actualizar la proxima accion del lead:", error);
      setNextActionError(
        "No se pudo guardar la proxima accion. Intenta de nuevo.",
      );
    } finally {
      setIsSavingNextAction(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.subScreenContainer}
    >
      <View style={styles.detailScreen}>
        <ScreenHeader
          title="Detalle del lead"
          subtitle={`Seguimiento de ${lead.name}`}
          onBack={onBack}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.leadDetailContent}
          style={styles.leadDetailScroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.profileCard}>
            <View style={styles.profileTopRow}>
              <View style={styles.profileAvatar}>
                <Text style={styles.profileAvatarText}>
                  {getInitial(lead.name)}
                </Text>
              </View>
              <View style={styles.profileCopy}>
                <Text style={styles.profileName} numberOfLines={1}>
                  {lead.name}
                </Text>
                <Text style={styles.profileProperty} numberOfLines={1}>
                  {propertyName}
                </Text>
                <View style={styles.statusBadgeStack}>
                  <View style={styles.stageBadge}>
                    <View style={styles.stageDot} />
                    <Text style={styles.stageText}>{primaryStatusLabel}</Text>
                  </View>
                  {mode === "coordinator" ? (
                    <View style={[styles.stageBadge, styles.advisorStageBadge]}>
                      <View style={[styles.stageDot, styles.advisorStageDot]} />
                      <Text style={[styles.stageText, styles.advisorStageText]}>
                        {advisorStatusLabel}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>

            <View style={styles.sourceRow}>
              <InfoPill label={lead.source || "Backend"} />
              <InfoPill
                label={lead.searchIntent === "rent" ? "Renta" : "Venta"}
              />
            </View>

            <View style={styles.infoGrid}>
              <DetailMetric
                icon={<Phone size={13} color="#0c6740" />}
                value={lead.phone || "Sin telefono"}
              />
              <DetailMetric
                icon={<Mail size={13} color="#0c6740" />}
                value={lead.email || "Sin correo"}
              />
              <DetailMetric
                icon={<CreditCard size={13} color="#0c6740" />}
                value="Presupuesto sin registrar"
              />
              <DetailMetric
                icon={<CalendarDays size={13} color="#0c6740" />}
                value={formatDate(lead.createdDate)}
              />
              <DetailMetric
                icon={<UserRound size={13} color="#0c6740" />}
                value={`Asesor: ${advisorName}`}
                wide
              />
              <DetailMetric
                icon={<MessageCircle size={13} color="#0c6740" />}
                value={lead.notes || "Sin notas iniciales"}
                wide
              />
            </View>
          </View>

          {canManageCustomStatus ? (
            <View style={styles.detailSection}>
              <View style={styles.customStatusHeader}>
                <Text style={styles.detailSectionTitle}>Estado del asesor</Text>
                <Text style={styles.customStatusSubtitle} numberOfLines={1}>
                  {isLoadingCustomLeadStatuses
                    ? "Cargando estados..."
                    : advisorStatusLabel}
                </Text>
              </View>

              {visibleCustomStatuses.length > 0 ? (
                <View style={styles.statusChipList}>
                  {visibleCustomStatuses.map((status) => {
                    const isActive = status === lead.advisorStatus;
                    return (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.customStatusChip,
                          isActive && styles.customStatusChipActive,
                        ]}
                        activeOpacity={0.85}
                        disabled={isSavingCustomStatus}
                        onPress={() => applyCustomStatus(status)}
                      >
                        <Text
                          style={[
                            styles.customStatusChipText,
                            isActive && styles.customStatusChipTextActive,
                          ]}
                          numberOfLines={1}
                        >
                          {formatAdvisorStatus(status)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.customStatusEmpty}>
                  Sin estados personalizados guardados.
                </Text>
              )}

              <View style={styles.customStatusForm}>
                <TextInput
                  style={styles.customStatusInput}
                  value={customStatusInput}
                  onChangeText={(value) => {
                    setCustomStatusInput(value);
                    setCustomStatusError(null);
                  }}
                  placeholder="Nuevo estado"
                  placeholderTextColor="#8d8783"
                />
                <TouchableOpacity
                  style={[
                    styles.customStatusButton,
                    (!customStatusInput.trim() || isSavingCustomStatus) &&
                      styles.customStatusButtonDisabled,
                  ]}
                  activeOpacity={0.85}
                  disabled={!customStatusInput.trim() || isSavingCustomStatus}
                  onPress={() => applyCustomStatus(customStatusInput)}
                >
                  <Text style={styles.customStatusButtonText} numberOfLines={1}>
                    {isSavingCustomStatus ? "Guardando" : "Aplicar"}
                  </Text>
                </TouchableOpacity>
              </View>
              {customStatusError ? (
                <Text style={styles.customStatusError}>
                  {customStatusError}
                </Text>
              ) : null}
            </View>
          ) : null}

          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>Proxima accion</Text>
            <View style={styles.nextActionCard}>
              <View style={styles.nextActionIcon}>
                <CalendarDays size={21} color="#ffffff" />
              </View>
              <View style={styles.nextActionCopy}>
                <Text style={styles.nextActionTitle} numberOfLines={1}>
                  {nextAction}
                </Text>
                <Text style={styles.nextActionMeta} numberOfLines={1}>
                  {lead.nextActionAt
                    ? formatDate(lead.nextActionAt)
                    : lead.nextFollowUpAt
                      ? formatDate(lead.nextFollowUpAt)
                      : "Sin fecha programada"}
                </Text>
                <Text style={styles.nextActionAdvisor} numberOfLines={1}>
                  Asesor: {advisorName}
                </Text>
              </View>
            </View>

            {canManageNextAction ? (
              <View style={styles.nextActionForm}>
                <TextInput
                  style={styles.nextActionInput}
                  value={nextActionInput}
                  onChangeText={(value) => {
                    setNextActionInput(value);
                    setNextActionError(null);
                  }}
                  placeholder="Accion a realizar"
                  placeholderTextColor="#8d8783"
                />
                <NextActionDatePicker
                  value={nextActionAtInput}
                  onChange={(value) => {
                    setNextActionAtInput(value);
                    setNextActionError(null);
                  }}
                />
                <TouchableOpacity
                  style={[
                    styles.nextActionSaveButton,
                    (!nextActionInput.trim() ||
                      !nextActionAtInput.trim() ||
                      isSavingNextAction) &&
                      styles.nextActionSaveButtonDisabled,
                  ]}
                  activeOpacity={0.85}
                  disabled={
                    !nextActionInput.trim() ||
                    !nextActionAtInput.trim() ||
                    isSavingNextAction
                  }
                  onPress={applyNextAction}
                >
                  <Text
                    style={styles.nextActionSaveButtonText}
                    numberOfLines={1}
                  >
                    {isSavingNextAction
                      ? "Guardando"
                      : "Guardar proxima accion"}
                  </Text>
                </TouchableOpacity>
                {nextActionError ? (
                  <Text style={styles.customStatusError}>
                    {nextActionError}
                  </Text>
                ) : null}
              </View>
            ) : null}
            <View style={styles.quickActionsGrid}>
              <QuickAction
                icon={<MessageCircle size={19} color="#0c6740" />}
                label="WhatsApp"
                onPress={() => openWhatsApp(lead.phone)}
              />
              <QuickAction
                icon={<Phone size={19} color="#0c6740" />}
                label="Llamar"
                onPress={() => openPhoneCall(lead.phone)}
              />
              <QuickAction
                icon={<CalendarPlus size={19} color="#0c6740" />}
                label="Agendar cita"
                onPress={() => undefined}
              />
              <QuickAction
                icon={<Repeat2 size={19} color="#0c6740" />}
                label="Cambiar etapa"
                onPress={() => undefined}
              />
            </View>
          </View>

          <View style={styles.aiSection}>
            <View style={styles.aiHeader}>
              <Sparkles size={15} color="#c78d1c" />
              <Text style={styles.aiTitle}>Acompañamiento de IA</Text>
            </View>
            <View style={styles.emptyFollowState}>
              <Bot size={34} color="#c8c1b8" />
              <Text style={styles.emptyStateText}>Muy pronto </Text>
            </View>
          </View>

          <View style={styles.historySection}>
            <Text style={styles.detailSectionTitle}>
              Historial de seguimiento
            </Text>
            <View style={styles.emptyFollowState}>
              <MessageSquareText size={34} color="#c8c1b8" />
              <Text style={styles.emptyStateText}>
                {" "}
                Sin seguimientos para revisar{" "}
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.detailBottomDock}>
          <View style={styles.detailBottomActions}>
            <TouchableOpacity
              style={styles.secondaryDetailButton}
              activeOpacity={0.85}
              onPress={onViewFollowUps}
            >
              <Text style={styles.secondaryDetailButtonText} numberOfLines={1}>
                Ver seguimientos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.aiDetailButton}
              activeOpacity={0.85}
            >
              <Sparkles size={13} color="#c78d1c" />
              <Text style={styles.aiDetailButtonText} numberOfLines={1}>
                Usar IA
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryDetailButton}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryDetailButtonText} numberOfLines={1}>
                Registrar seguimiento
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function ScreenHeader({
  title,
  subtitle,
  onBack,
}: {
  title: string;
  subtitle: string;
  onBack: () => void;
}) {
  return (
    <View style={styles.screenHeader}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        activeOpacity={0.85}
      >
        <ArrowLeft size={20} color="#19191f" />
      </TouchableOpacity>
      <View style={styles.screenHeaderCopy}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

function InfoPill({ label }: { label: string }) {
  return (
    <View style={styles.infoPill}>
      <Text style={styles.infoPillText} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function DetailMetric({
  icon,
  value,
  wide = false,
}: {
  icon: ReactNode;
  value: string;
  wide?: boolean;
}) {
  return (
    <View style={[styles.detailMetric, wide && styles.detailMetricWide]}>
      {icon}
      <Text style={styles.detailMetricText} numberOfLines={wide ? 2 : 1}>
        {value}
      </Text>
    </View>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.quickActionButton}
      activeOpacity={0.85}
      onPress={onPress}
    >
      {icon}
      <Text style={styles.quickActionText} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

type NextActionPickerMode = "date" | "time";

function NextActionDatePicker({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value: string;
}) {
  const date = getPickerDate(value);
  const [pickerMode, setPickerMode] = useState<NextActionPickerMode | null>(
    null,
  );

  const handlePickerChange = (
    _event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (!selectedDate || !pickerMode) {
      setPickerMode(null);
      return;
    }

    const nextDate = getPickerDate(value);
    if (pickerMode === "date") {
      nextDate.setFullYear(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
      );
    } else {
      nextDate.setHours(
        selectedDate.getHours(),
        selectedDate.getMinutes(),
        0,
        0,
      );
    }

    setPickerMode(null);
    onChange(nextDate.toISOString());
  };

  return (
    <View style={styles.nextActionDatePicker}>
      <View style={styles.nextActionDateValue}>
        <CalendarDays size={14} color="#0c6740" />
        <Text style={styles.nextActionDateText} numberOfLines={1}>
          {value ? formatDateTimeInput(value) : "Seleccionar fecha y hora"}
        </Text>
      </View>
      <View style={styles.nextActionDateActions}>
        <TouchableOpacity
          style={styles.nextActionDateButton}
          activeOpacity={0.85}
          onPress={() => setPickerMode("date")}
        >
          <Text style={styles.nextActionDateButtonText}>Fecha</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.nextActionDateButton}
          activeOpacity={0.85}
          onPress={() => setPickerMode("time")}
        >
          <Text style={styles.nextActionDateButtonText}>Hora</Text>
        </TouchableOpacity>
      </View>
      {pickerMode ? (
        <DateTimePicker
          value={date}
          mode={pickerMode}
          display="default"
          onChange={handlePickerChange}
        />
      ) : null}
    </View>
  );
}

function getInitial(name: string) {
  return name.trim().slice(0, 1).toUpperCase() || "L";
}

function formatSystemStatus(status?: PropertyLead["systemStatus"]) {
  const labels: Record<string, string> = {
    nuevo: "Nuevo",
    seguimiento: "Seguimiento",
    frio: "Frio",
    congelado: "Congelado",
    en_espera: "En espera",
    con_cita: "Con cita",
    lead_muerto: "Muerto",
    lead_ganador: "Ganado",
    lead_perdido: "Perdido",
    spam: "Spam",
    duplicado: "Duplicado",
  };

  return status ? (labels[status] ?? status) : "Nuevo";
}
function formatAdvisorStatus(status?: string) {
  if (!status) return "Sin estado";
  return formatLeadStatus(status as PropertyLead["status"]) || status;
}

function formatLeadStatus(status: PropertyLead["status"]) {
  const labels: Record<PropertyLead["status"], string> = {
    nuevo: "Nuevo",
    contactado: "Contactado",
    cita_agendada: "Cita agendada",
    visitado: "Visitado",
    negociando: "En seguimiento",
    cerrado: "Cerrado",
    descartado: "Descartado",
  };

  return labels[status] ?? status;
}

function formatDateInput(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function normalizeDateInput(value: string) {
  const normalizedValue = value.trim();
  if (!normalizedValue) return null;

  const date = new Date(
    normalizedValue.includes("T")
      ? normalizedValue
      : normalizedValue.replace(" ", "T"),
  );
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function getPickerDate(value: string) {
  const normalizedValue = normalizeDateInput(value);
  const date = normalizedValue ? new Date(normalizedValue) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function formatDateTimeInput(value: string) {
  const normalizedValue = normalizeDateInput(value);
  if (!normalizedValue) return value;
  return formatDateInput(normalizedValue);
}

function formatDate(value?: string) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function openWhatsApp(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return;
  Linking.openURL(`https://wa.me/${digits}`).catch(() => undefined);
}

function openPhoneCall(phone: string) {
  const digits = phone.replace(/[^\d+]/g, "");
  if (!digits) return;
  Linking.openURL(`tel:${digits}`).catch(() => undefined);
}
