import {useMemo, useState, type ReactNode} from 'react'
import { icons, images, logos } from '@/assets'
import { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { 
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
  Image
} from 'react-native'
import { getInitials } from '@/components/userDashboard/dashboard-formatters'

import { useHideBottomNav } from '@/lib/navigation/bottom-nav-visibility'
import { useSessionDomain } from '@/contexts/auth/use-session-domain'

import type { PropertyLead } from '@/lib/types'
import {styles} from './styles/LeadsDetailsScreen'
import { BackendLeadV2FollowingRecord } from '@/lib/api'
import {
  isFollowingImageAttachment,
} from '@/modules/users/leads/hooks/useFollowingAttachmentImage'
import {FollowingImageAttachment, type FollowingImagePreview} from '@/modules/users/leads/components/FollowingImageAttachment'
import {FollowingImagePreviewModal} from '@/modules/users/leads/components/FollowingImagePreviewModal'
import {AppointmentCreateFlow} from '@/modules/users/main/components/AppointmentCreateFlow'
import {CreateLeadFollowingModal} from '@/modules/users/leads/components/CreateLeadFollowingModal'
import {NextActionModal} from '@/modules/users/leads/components/NextActionModal'
import { colors } from '@/lib/theme'
import { fontFamily } from '@/theme'
import { router } from 'expo-router'
import { formatDateFollowing, formatTime } from '@/components/userDashboard/dashboard-formatters'
import { formatDateInput, normalizeDateInput, openPhoneCall, openWhatsApp } from '@/components/userDashboard/dashboard-formatters'
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
  followings?: BackendLeadV2FollowingRecord[]
  followingsError?: string | null
  isLoadingFollowings?: boolean
  onReloadFollowings?: () => Promise<void> | void
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
  followings,
  followingsError,
  isLoadingFollowings,
  onReloadFollowings,

}: LeadDetailScreenProps){
  useHideBottomNav()
  const {authToken} = useSessionDomain()
  const [previewImage, setPreviewImage] = useState<FollowingImagePreview | null>(null)
  const [isAppointmentModalVisible, setIsAppointmentModalVisible] = useState(false)
  const [isFollowingModalVisible, setIsFollowingModalVisible] = useState(false)
  const [isNextActionModalVisible, setIsNextActionModalVisible] = useState(false)

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

    const openNextActionModal = () => {
      setNextActionInput(lead.nextAction || '')
      setNextActionAtInput(
        formatDateInput(lead.nextActionAt || lead.nextFollowUpAt || ''),
      )
      setNextActionError(null)
      setIsNextActionModalVisible(true)
    }
  
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
        setIsNextActionModalVisible(false)
      } catch (error) {
        console.warn("No se pudo actualizar la proxima accion del lead:", error);
        setNextActionError(
          "No se pudo guardar la proxima accion. Intenta de nuevo.",
        );
      } finally {
        setIsSavingNextAction(false);
      }
    };

    const latestFollowings = useMemo(() => {
      return [...(followings || [])]
        .sort((current, next) => {
          const currentDate = new Date(current.createdAt || 0).getTime();
          const nextDate = new Date(next.createdAt || 0).getTime();

          return nextDate - currentDate;
        })
        .slice(0, 3);
    }, [followings]);


    /*Esto se eliminara y se enviara al componente de informacion de recomendaciones de ia e incluso se eliminara sin problema es solo pruebas

    const recommendations = [
      {
        id: 1,
        titulo: "agendar cita",
        descripcion: "Llámele hoy entre 5:30 pm y 6:15 pm. es el horario en el que mas responde"
      },
      {
        id: 2,
        titulo: "agendar cita",
        descripcion: "Llámele hoy entre 5:30 pm y 6:15 pm. es el horario en el que mas responde"
      },
      {
        id: 3,
        titulo: "agendar cita",
        descripcion: "Llámele hoy entre 5:30 pm y 6:15 pm. es el horario en el que mas responde"
      }
    ]

    const iaAnnotation = "algo en especial como evitar insistir nuevamente en temas ya resueltos su mayor interes actual es terraza, amenidades y facilidad de credito"*/
    
  return(
    <View style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoContainer}> #Este es el logo
          <Pressable style={styles.backButton} onPress={onBack}>
            <icons.BackButton/>
          </Pressable>
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
              <View style={styles.profileAvatarContainer}>
                {lead.imageUri ? (
                  <Image
                    source={{uri: lead.imageUri}}
                    resizeMode='cover'
                    style={styles.imageLead}
                  />
                ): (
                  <Text style={styles.avatarText}>{getInitials(lead.name)}</Text>
                )}
              </View>
              <View style={styles.dataLeadContainer}>
                <Text style={styles.nameLead}>{lead.name}</Text>
                <Text style={styles.placeLead}>{propertyName}</Text>
                <View style={styles.statusBar}>
                  <View style={styles.statusDot}/>
                  <Text style={styles.statusText}>{lead.systemStatus} </Text>
                </View>
                <View style={styles.typeLeadContainer}>
                  <View style={styles.typeLead}>
                    <Text style={styles.sourceText}>{formatLeadSource(lead.source)} </Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.tableInformation}> ## aqui comienza el bloque de informacion del usuario
              <View style={[styles.lineInformation,styles.lineInformationNoBor]}>
                <View style={styles.lineInformationInterior}>
                  {lead.phone ? (
                    <Text style={styles.informationText}>{lead.phone}</Text>
                  ): (
                    <Text style={styles.informationText}>Telefono sin registrar </Text>
                  )}
                </View>
                <View style={styles.lineInformationInterior}>
                  <Text style={styles.informationText}>Presupuesto:</Text>
                </View>
                <View style={styles.lineInformationInteriorLast}>
                  <Text style={styles.informationText}>Forma de pago</Text>
                </View>
              </View>
              <View style={[styles.lineInformation, styles.lineInformationEdge]}>
                <View style={styles.lineInformationInterior}>
                  {lead.email ? (
                    <Text style={[styles.informationText, styles.informationTextRight]}>{lead.email}</Text>
                  ): (
                    <Text style={[styles.informationText, styles.informationTextRight]}>Correo sin registrar </Text>
                  )}
                </View>
                <View style={styles.lineInformationInterior}>
                  <Text style={[styles.informationText, styles.informationTextRight]}>Zona Preferida</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.informationContainer}>
            <View> #titulo del bloque
              <Text>Proxima accion</Text>
            </View>
            <View style={styles.nextActionButton}>## primer boton sobre las citas
              {!nextAction ? (
                <>
                  <View style={styles.iconCircle}/> ##aqui es el circulo con el icono
                    <View style={styles.actionTextContainer}>
                      <View>
                        <Text 
                          style={styles.actionTitle}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {nextAction}   
                        </Text>
                        <Text style={styles.actionDateText}>{formatDateFollowing(lead.nextActionAt)}</Text>
                        <Text style={styles.actionAdvisorText}>Asesor: {lead.assignedAgentName}</Text>
                      </View> 
                    </View>
                    </>
                  ): (
                    <View style={styles.noActionContainer}>
                      <Text>No hay accion definida todavia</Text>
                    </View>
                  )}
                {/*<icons.ArrowLeft/>*/}
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.contentButtons}
            >
              <Pressable style={styles.optionButton}
                onPress={() => openWhatsApp(lead.phone)}
              >
                <icons.WhatsAppIcon />
                <Text style={styles.optionText}>Whatsapp </Text>
              </Pressable>

              <Pressable style={styles.optionButton}
                onPress={() => openPhoneCall(lead.phone)}
              >
                <icons.Phone />
                <Text style={styles.optionText}>Llamar </Text>
              </Pressable>

              <Pressable style={styles.optionButton} onPress={() => setIsAppointmentModalVisible(true)}>
                <icons.CalendarAction />
                <Text style={styles.optionText}>Agendar Cita </Text>
              </Pressable>

              <Pressable style={styles.optionButton}
                onPress={openNextActionModal}
                disabled={!canManageNextAction}
              >
                <icons.ActionIcon />
                <Text style={styles.optionText}>Cambiar acción </Text>
              </Pressable>
            </ScrollView>
          </View>

          ##esto se enviara componente externo se mantendra una funcionalidad relativa para obtener los datos rapidamente
          {/*<View style={[styles.informationContainer]}>
            <View style={[styles.headerIAInformation]}>
              <icons.BackButton/>
              <Text>Acompañamiento de IA </Text> ##aun no mantiene funcionalidad, estos es solo para tenerlo a futuro
            </View>
            <View style={styles.iaRecommendationsContainer}>
              {recommendations.length === 0 ? (
                <View style={styles.invalidInformationContainer}>
                  <icons.BackButton/>
                  <Text style={styles.invalidInformationText}>
                    Aun no tienes recomendaciones disponibles
                  </Text>  
                </View>
              ): (
                recommendations.map((recommendation, Index) => {
                  const isLast = Index === recommendations.length - 1
                  return(
                    <View
                      key={recommendation.id}
                      style={[styles.recommendationBlock, isLast && styles.recommendationBlockLast]}
                    >
                      <icons.BackButton/>
                      <View style={styles.recommendationTextContainer}>
                        <Text style={styles.recommendationTitle}>{recommendation.titulo}</Text>
                        <Text style={styles.recommendationSubtitle}>{recommendation.descripcion}</Text>
                      </View>
                    </View>
                  )
                })
              )}
            </View>
            <View style={styles.iaAnnotation}>
              <icons.BackButton/>
              <Text style={styles.iaAnnotationText}>Nota de ia: {iaAnnotation}</Text>
            </View>
          </View>*/}
          <View style={styles.informationContainer}>
            <Text>Historial de seguimiento</Text>
            {isLoadingFollowings ? (
              <Text>Cargando seguimientos...</Text>
            ) : followingsError ? (
              <Pressable onPress={onReloadFollowings}>
                <Text>{followingsError}</Text>
                <Text>Presiona para intentar de nuevo</Text>
              </Pressable>
            ): followings?.length === 0 ? (
              <Text>Sin seguimientos para mostrar</Text>
            ): (
              latestFollowings?.map((following, Index) => {
                const isLast = Index === latestFollowings.length - 1 
                const imageAttachments = following.attachments.filter(isFollowingImageAttachment)

                return(
                  <View
                    key={following.id}
                    style={styles.timelineItem}
                  >
                    <View style={styles.timelineRail}>
                      <View style={styles.timelineDot}/>

                      {!isLast && (
                        <View style={styles.timelineLine}/>
                      )}
                    </View>

                    <View style={styles.timelineContent}>
                      <View style={styles.timelineHeader}>
                        <View style={styles.timelineHeaderLeft}>
                          <Text style={styles.timelineDate}>
                            {formatDateFollowing(following.createdAt)}
                          </Text>
                          {/*<Text style={styles.timelineType}>
                            Sin nota
                          </Text>*/}
                        </View>
                        <Text style={styles.timelineTime}>
                          {formatTime(following.createdAt)}
                        </Text>
                      </View>
                      <Text style={styles.timelineDescription}>
                        {following.text}
                      </Text>
                      {imageAttachments.length > 0 ? (
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={styles.attachmentList}
                        >
                          {imageAttachments.map((attachment, attachmentIndex) => (
                            <FollowingImageAttachment
                              attachment={attachment}
                              followingId={following.id}
                              index={attachmentIndex}
                              key={attachment._id || attachment.storageKey || `${following.id}-${attachmentIndex}`}
                              leadId={following.leadId || lead.id}
                              onOpenImage={setPreviewImage}
                              token={authToken}
                            />
                          ))}
                        </ScrollView>
                      ) : null}
                    </View>
                  </View>
                )
              })
            )}
          </View>
        </View>
      </ScrollView>
      <View style={{paddingHorizontal: 12}}>
        <View style={styles.bottomButtons}>
          <Pressable style={styles.followingButton} onPress={onViewFollowUps}>
            <Text style={styles.buttonText}>Ver seguimiento </Text>
          </Pressable>
          {/*<Pressable style={styles.iaButton}>
            <icons.BackButton/>
            <Text style={styles.buttonText}>Usar IA</Text>
          </Pressable>*/}
          <Pressable style={styles.seeFollowingsButton} onPress={() => setIsFollowingModalVisible(true)}> 
            <Text style={[styles.buttonText, styles.whiteColor]}>Registrar seguimiento </Text>
          </Pressable>
          
        </View>
      </View>
      <FollowingImagePreviewModal image={previewImage} onClose={() => setPreviewImage(null)} />
      {isAppointmentModalVisible ? (
        <AppointmentCreateFlow
          initialLead={lead}
          visible
          onClose={() => setIsAppointmentModalVisible(false)}
        />
      ) : null}
      {isFollowingModalVisible ? (
        <CreateLeadFollowingModal
          leadId={lead.id}
          visible
          onClose={() => setIsFollowingModalVisible(false)}
          onCreated={onReloadFollowings}
        />
      ) : null}

      <NextActionModal
        visible={isNextActionModalVisible}
        action={nextActionInput}
        actionAt={nextActionAtInput}
        error={nextActionError}
        isSaving={isSavingNextAction}
        onActionChange={setNextActionInput}
        onActionAtChange={setNextActionAtInput}
        onClose={() => setIsNextActionModalVisible(false)}
        onSubmit={applyNextAction}
      />
    </View>
  )
}







// funciones de apoyo (utils) que apoyan a que algunas funcionalidades esten completas tales como normalizacion de estatus de leads, formateo de fecha, formateo de numero de telefono y apoyo para enviar al whatssap, son funcionales y con uso constante por lo que por ahora se mantiene hasta moverlos a sus espacios especificos

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

function formatLeadSource(source?: string) {
  if (!source) return "Sin origen";

  return source.trim().toLowerCase() === "appointment"
    ? "Creado por cita "
    : source;
}

