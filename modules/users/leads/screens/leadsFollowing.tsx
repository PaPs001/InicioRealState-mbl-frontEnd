import { View, Pressable, Image, ScrollView, Text, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { icons, logos } from "@/assets";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { router, useLocalSearchParams, usePathname } from "expo-router";
import { styles } from "./styles/LeadsFollowingsScreen.styles";
import {
  ArrowLeft,
  AudioLinesIcon,
  Clock3,
  FileText,
  Image as ImageIcon,
  ListFilter,
  MessageCircle,
  Mic,
  NotebookPen,
  NotebookTabs,
  Phone,
  Plus,
  Sparkles,
  Star,
  TimerReset,
  UploadCloud,
} from "lucide-react-native";
import { useSessionDomain } from "@/contexts/auth/use-session-domain";
import {
  getBackendLeadV2Followings,
  type BackendLeadV2FollowingRecord,
} from "@/lib/api";
import { useHideBottomNav } from "@/lib/navigation/bottom-nav-visibility";
import { isFollowingImageAttachment } from "@/modules/users/leads/hooks/useFollowingAttachmentImage";
import {
  FollowingImageAttachment,
  type FollowingImagePreview,
} from "@/modules/users/leads/components/FollowingImageAttachment";
import { FollowingImagePreviewModal } from "@/modules/users/leads/components/FollowingImagePreviewModal";
import { CreateLeadFollowingModal } from "@/modules/users/leads/components/CreateLeadFollowingModal";
import { mockFollowings } from "../mockFollowings";
import { buttonColor } from "@/theme";
type LeadFollowUpHistoryParams = {
  leadId?: string;
  leadName?: string;
  returnTo?: string;
};

type HistoryFilter = {
  id: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
  warm?: boolean;
};

const filters: HistoryFilter[] = [
  {
    id: "all",
    label: "Todos",
    icon: <ListFilter size={14} color="#12382f" />,
    active: true,
  },
  {
    id: "messages",
    label: "Mensajes",
    icon: <MessageCircle size={14} color="#12382f" />,
  },
  { id: "calls", label: "Llamadas", icon: <Phone size={16} color="#12382f" /> },
  {
    id: "ai",
    label: "IA",
    icon: <Sparkles size={14} color="#c98412" />,
    warm: true,
  },
  {
    id: "files",
    label: "Archivos",
    icon: <FileText size={14} color="#12382f" />,
  },
];

export default function LeadFollowUpScreen() {
  useHideBottomNav();

  const pathname = usePathname();
  const params = useLocalSearchParams<LeadFollowUpHistoryParams>();
  const { authToken } = useSessionDomain();
  const leadId = getParamValue(params.leadId);
  const leadName = getParamValue(params.leadName) || "Lead seleccionado";
  const returnTo = getParamValue(params.returnTo);
  const [followings, setFollowings] = useState<BackendLeadV2FollowingRecord[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [previewImages, setPreviewImages] = useState<FollowingImagePreview[]>(
    [],
  );
  const loadedLeadIdRef = useRef<string | null>(null);

  const orderedFollowings = [...followings].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();

    return dateB - dateA;
  });

  const loadFollowings = useCallback(async () => {
    if (!authToken || !leadId) {
      setFollowings([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      /// estos es para activar la consulta real de datos reales para produccion
      const records = await getBackendLeadV2Followings(leadId, authToken);
      setFollowings(records)
      //setFollowings(mockFollowings);
    } catch (error) {
      console.warn("No se pudieron cargar los seguimientos v2:", error);
      setErrorMessage("No se pudieron cargar los seguimientos");
      setFollowings([]);
    } finally {
      setIsLoading(false);
    }
  }, [authToken, leadId]);

  useEffect(() => {
    if (!authToken || !leadId || loadedLeadIdRef.current === leadId) return;

    loadedLeadIdRef.current = leadId;
    console.info("[LeadV2FollowUps][initial-load]", {
      service: "followings",
      leadId,
    });
    loadFollowings();
  }, [authToken, leadId, loadFollowings]);

  const goBackToLeadDetail = () => {
    const fallbackPath = pathname.startsWith("/userAdviser")
      ? "/userAdviser/leads"
      : "/userCoordinator/leads";

    router.replace({
      pathname: (returnTo || fallbackPath) as never,
      params: leadId ? { selectedLeadId: leadId } : undefined,
    } as never);
  };

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <View style={styles.content}>
        <View style={styles.logoWrap}>
          <Pressable style={styles.backButton} onPress={goBackToLeadDetail}>
            <icons.BackButton />
          </Pressable>
          <logos.irsPrincipal />
        </View>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Historial de seguimiento</Text>
          <Text style={styles.subtitle}>
            Conversacion y acciones de {leadName}
          </Text>
        </View>
      </View>
      <ScrollView
        horizontal
        scrollEnabled={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
        style={styles.filterScroll}
      >
        {filters.map((filter) => (
          <View style={styles.filterButton}>
            {filter.icon}
            <Text style={styles.filterText}>{filter.label}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.followingsContainer}>
        <ScrollView
          contentContainerStyle={styles.contentFollowingContainer}
          showsVerticalScrollIndicator={false}
          style={styles.followingsScroll}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={loadFollowings}
            />
          }
          
        >
          {errorMessage && !isLoading ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : followings.length === 0 && !isLoading && !errorMessage ? (
            <Text style={styles.errorText}>
              Este lead todavia no tiene seguimientos
            </Text>
          ) : (
            orderedFollowings.map((following) => (
              <View style={styles.timeLineContainer}>
                <FollowingTimeLineItem />
                <FollowingCard
                  key={following.id}
                  following={following}
                  authToken={authToken}
                  onOpenImages={setPreviewImages}
                />
              </View>
            ))
          )}
        </ScrollView>
      </View>
      <View style={styles.buttonsContainer}>
        <View style={styles.topButtonsContainer}>
          <Pressable style={styles.buttonStyle}>
            <NotebookTabs width={15} height={15} />
            <Text
              style={styles.buttonText}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              Agregar Nota
            </Text>
          </Pressable>
          <Pressable style={styles.buttonStyle}>
            <AudioLinesIcon width={15} height={15} />
            <Text
              style={styles.buttonText}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              Dictar Audio
            </Text>
          </Pressable>
          <Pressable style={styles.buttonStyle}>
            <UploadCloud width={15} height={15} />
            <Text
              style={styles.buttonText}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              Subir Imagen
            </Text>
          </Pressable>
          <Pressable style={styles.buttonStyle}>
            <Star height={15} width={15} />
            <Text
              style={styles.buttonText}
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              Asistente IA
            </Text>
          </Pressable>
        </View>
        <Pressable
          style={[styles.buttonStyleBottom, styles.buttonStyle]}
          onPress={() => setIsActivityModalOpen(true)}
        >
          <Plus color={"#f2f0f0"} width={20} height={20} />
          <Text
            style={[
              styles.buttonText,
              {
                color: "#f2f0f0",
              },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            Agregar Actividad
          </Text>
        </Pressable>
      </View>
      {isActivityModalOpen ? (
        <CreateLeadFollowingModal
          leadId={leadId}
          visible={isActivityModalOpen}
          onClose={() => setIsActivityModalOpen(false)}
          onCreated={loadFollowings}
        />
      ) : null}
      <FollowingImagePreviewModal
        images={previewImages}
        onClose={() => setPreviewImages([])}
      />
    </SafeAreaView>
  );
}

const FollowingTimeLineItem = () => {
  return (
    <View style={styles.circlesContainer}>
      <View style={[styles.timelineLine, { left: 3.5 }]} />
      <View style={[styles.timelineLine, { left: 27.8 }]} />
      <View style={styles.centerCirclesContainer}>
        <View style={styles.firstCircle}>
          <View style={styles.centerLitteCircle}></View>
        </View>
        <View style={styles.bigCircleIcon}></View>
      </View>
    </View>
  );
};

type FollowingCardProps = {
  following: BackendLeadV2FollowingRecord;
  authToken: string | null;
  onOpenImages: (images: FollowingImagePreview[]) => void;
};
const FollowingCard = ({
  following,
  authToken,
  onOpenImages,
}: FollowingCardProps) => {
  const imageAttachments = following.attachments.filter(
    isFollowingImageAttachment,
  );
  const attachs = imageAttachments.slice(0, 1);
  const hiddenAttachs = Math.max(imageAttachments.length - attachs.length, 0);
  const galleryImages = imageAttachments.flatMap((attachment, index) => {
    if (!attachment.url) return [];

    return [
      {
        uri: attachment.url,
        title: attachment.filename || `Imagen ${index + 1}`,
      },
    ];
  });
  return (
    <View style={styles.cardContainer}>
      <View style={styles.headerCardContainer}>
        <View style={styles.headerTimeContainer}>
          <Text style={styles.dateText}>{formatDate(following.createdAt)}</Text>
          <Text style={styles.timeText}>{formatTime(following.createdAt)}</Text>
        </View>
      </View>
      <View style={styles.followingContainer}>
        <View>
          {attachs.map((attach, index) => (
            <FollowingImageAttachment
              key={attach._id || `${following.id}-${index}`}
              attachment={attach}
              followingId={following.id}
              index={index}
              leadId={following.leadId}
              token={authToken}
              onOpenImage={(openedImage) => {
                const images = galleryImages.length
                  ? [...galleryImages]
                  : [openedImage];

                images[index] = openedImage;
                onOpenImages(images);
              }}
              numAttachs={hiddenAttachs}
            />
          ))}
        </View>
        <Text numberOfLines={8} style={styles.followingText}>
          {following.text}
        </Text>
      </View>
    </View>
  );
};

function getParamValue(value?: string | string[]) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function formatAuthorType(value: string) {
  if (value === "coordinator") return "Coordinador";
  if (value === "agent") return "Asesor";
  return "Seguimiento";
}

function formatDate(value?: string) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return "Hoy";
  return date.toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
}

function formatTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date
    .toLocaleTimeString("es-MX", { hour: "numeric", minute: "2-digit" })
    .toLowerCase();
}
