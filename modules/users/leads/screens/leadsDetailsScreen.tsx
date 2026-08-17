import { SafeAreaView } from 'react-native-safe-area-context'

import {useMemo, useState, type ReactNode} from 'react'
import { icons, images, logos } from '@/assets'
import { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { 
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  Image
} from 'react-native'

import { useHideBottomNav } from '@/lib/navigation/bottom-nav-visibility'

import type { PropertyLead } from '@/lib/types'
import {styles} from './styles/LeadsDetailsScreen'

type LeadDetailScreenProps= {
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
}

export function LeadDetailScreen({
  customLeadStatuses = [],
  getPropertyName,
  isLoadingCustomLeadStatuses = false,
  lead,
  mode = "coordinator",
  onApplyCustomStatus,
  onApplyNextAction,
  onBack,
  onViewFollowUps,
}: LeadDetailScreenProps){
  useHideBottomNav()

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

  return(
    <SafeAreaView
      style={styles.safeArea} edges={['top', 'bottom']}
    >
      <ScrollView style={styles.container}>
        <View style={styles.logoContainer}> #Este es el logo
          <logos.irsPrincipal/>
        </View> #Este es el header
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Detalle del lead</Text>
          <Text style={styles.subtitle}>Seguimiento de andrea Ortiz</Text>
        </View>
        ## Primer bloque de informacion del lead
        <View  style={styles.rowBlock}>
          <View style={styles.informationContainer}>
            <View style={styles.headerInformationContainer}>
              <Image 
                resizeMode='cover'
                style={styles.imageLead}
                
              />
              <View style={styles.dataLeadContainer}>
                <Text style={styles.nameLead}>Andrea Oritz</Text>
                <Text style={styles.placeLead}>Aldea Hortus D-506</Text>
                <View style={styles.statusBar}>
                  <icons.Power/>
                  <Text style={styles.statusText}>En seguimiento </Text>
                </View>
                <View style={styles.typeLeadContainer}>
                  <View style={styles.typeLead}>
                    <icons.ArrowDown/>
                    <Text>ManyChat</Text>
                  </View>
                  <View>
                    <icons.ArrowDown/>
                    <Text>Instagram</Text>
                  </View>
                </View>
              </View>
            </View>
            <View> ## aqui comienza el bloque de informacion del usuario
              <View>
                <View>
                  <Text>Numero de telefono alt</Text>
                </View>
                <View>
                  <Text>Correo electronico alt</Text>
                </View>
              </View>
              <View>
                <View>
                  <Text>Numeor de telefono alt</Text>
                </View>
                <View>
                  <Text>Correo electronico alt</Text>
                </View>
              </View>
              <View>
                <View>
                  <Text>Numero de telefono alt</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}




// funciones de apoyo (utils) que apoyan a que algunas funcionalidades esten completas tales como normalizacion de estatus de leads, formateo de fecha, formateo de numero de telefono y apoyo para enviar al whatssap, son funcionales y con uso constante por lo que por ahora se mantiene hasta moverlos a sus espacios especificos
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
