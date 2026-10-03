import {
  View,
  Text,
  Pressable,
  ScrollView,
  RefreshControl,
  TextInput,
  Animated,
  Keyboard,
} from "react-native";
import { styles } from "./styles/LeadsTrackingSelecting.Style";
import { SafeAreaView } from "react-native-safe-area-context";
import { logos, icons } from "@/assets";
import { LeadCard } from "../components/leadsTracking/leadcard";

import { useEffect, useRef, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { usePropertyDomain } from "@/contexts/auth/use-property-domain";
import { useLeadTrackingRecords } from "../hooks/useLeadTrackingRecords";
import {
  filterTrackingLeads,
  searchTrackingLeadsByName,
} from "../utils/lead-tracking";
import { LEAD_ORIGINS } from "../constants/lead-origins";
import { leadTrackingStatusCards } from "../constants/lead-tracking-layout";
import { isLeadStatus } from "../constants/lead-tracking-statuses";

const LEADS_PER_PAGE = 12;

export const LeadsTrackingSelectingScreen = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const listRef = useRef<ScrollView>(null);
  const searchExpansion = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animation = Animated.timing(searchExpansion, {
      toValue: isSearchOpen ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [isSearchOpen, searchExpansion]);
  const params = useLocalSearchParams<{
    status?: string | string[];
    origin?: string | string[];
  }>();
  const status =
    (Array.isArray(params.status) ? params.status[0] : params.status) ||
    "LEAD NUEVO";
  const { leads, isLoading, error, reload } = useLeadTrackingRecords();
  const {
    getPropertyById,
    hasLoadedCatalog,
    isCatalogLoading,
    loadCatalogProperties,
  } = usePropertyDomain();
  useEffect(() => {
    if (!hasLoadedCatalog && !isCatalogLoading) void loadCatalogProperties();
  }, [loadCatalogProperties, hasLoadedCatalog]);
  const originParam = Array.isArray(params.origin)
    ? params.origin[0]
    : params.origin;
  const [origin, setOrigin] = useState<string | undefined>(originParam);
  useEffect(() => setOrigin(originParam), [status, originParam]);
  const matchingLeads = filterTrackingLeads(leads, status);
  const visibleLeads = searchTrackingLeadsByName(
    filterTrackingLeads(leads, status, origin),
    searchQuery,
  );
  const totalPages = Math.max(
    1,
    Math.ceil(visibleLeads.length / LEADS_PER_PAGE),
  );
  const currentPage = Math.min(page, totalPages);
  const pageLeads = visibleLeads.slice(
    (currentPage - 1) * LEADS_PER_PAGE,
    currentPage * LEADS_PER_PAGE,
  );
  useEffect(() => setPage(1), [status, origin, searchQuery]);
  useEffect(
    () => setPage((previous) => Math.min(previous, totalPages)),
    [totalPages],
  );
  useEffect(() => {
    listRef.current?.scrollTo({ y: 0, animated: false });
  }, [currentPage, status, origin, searchQuery]);
  const card = leadTrackingStatusCards.find((card) =>
    isLeadStatus(card.title, status),
  );
  const title =
    status === "unclassified" ? "Sin clasificar" : card?.title || status;
  const filters = [
    { value: undefined, count: matchingLeads.length },
    ...LEAD_ORIGINS.map((value) => ({
      value,
      count: filterTrackingLeads(matchingLeads, status, value).length,
    })).filter((filter) => filter.count > 0),
  ];
  useEffect(() => {
    if (
      !isLoading &&
      !error &&
      origin &&
      !filters.some((filter) => filter.value === origin)
    ) {
      setOrigin(undefined);
    }
  }, [isLoading, error, origin, matchingLeads]);
  return (
    <SafeAreaView style={styles.safeArea}>
      <View
        style={[
          styles.container,
          {
            paddingBottom: 15,
          },
        ]}
      >
        <View style={styles.logoSectionContainer}>
          <Pressable
            style={[styles.headerButton, styles.backButton]}
            onPress={() =>
              router.canGoBack()
                ? router.back()
                : router.replace("/userAdviser/lead-tracking")
            }
          >
            <icons.BackButton />
          </Pressable>
          <logos.irsPrincipal />
          <View style={styles.rightLogoSectionContainer}>
            <Pressable
              style={[styles.headerButton]}
              accessibilityRole="button"
              accessibilityLabel="Buscar leads por nombre"
              accessibilityState={{ expanded: isSearchOpen }}
              onPress={() => {
                if (isSearchOpen) {
                  setSearchQuery("");
                  Keyboard.dismiss();
                }
                setIsSearchOpen((previous) => !previous);
              }}
            >
              <icons.Searcher height={17} width={17} />
            </Pressable>
            {/*<Pressable style={[styles.headerButton]}>
              <icons.Filter width={20} height={20}/>
            </Pressable>*/}
          </View>
        </View>
        <Animated.View
          style={{
            height: searchExpansion.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 52],
            }),
            opacity: searchExpansion,
            overflow: "hidden",
          }}
        >
          {isSearchOpen && (
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar por nombre…"
              placeholderTextColor="#767676"
              accessibilityLabel="Nombre del lead"
              autoFocus
              autoCorrect={false}
              returnKeyType="search"
              onSubmitEditing={() => Keyboard.dismiss()}
            />
          )}
        </Animated.View>
        <View style={styles.headerContainer}>
          <View style={styles.headerTitlesContainer}>
            <Text numberOfLines={2} style={styles.titleHeader}>
              {title} ({isLoading || error ? "\u2014" : matchingLeads.length})
            </Text>
            <Text style={styles.subtitleHeader} numberOfLines={2}>
              {card?.subtitle || "Leads pendientes de clasificar por estado"}
            </Text>
          </View>
          {/*<Pressable style={styles.iaHelperButton}>
            <Text style={styles.iaHelperText} adjustsFontSizeToFit>
              Asistente IA
            </Text>
          </Pressable>*/}
        </View>
        <ScrollView
          contentContainerStyle={styles.filtersCarrouselContainer}
          showsHorizontalScrollIndicator={false}
          horizontal
        >
          {filters.map(({ value, count }) => (
            <Pressable
              key={value || "Todos"}
              onPress={() => setOrigin(value)}
              accessibilityRole="button"
              accessibilityState={{ selected: origin === value }}
              style={[
                styles.filterButton,
                origin === value && { backgroundColor: "#DDF0E2" },
              ]}
            >
              <Text style={styles.filterText}>
                {value || "Todos"} ({isLoading || error ? "\u2014" : count})
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      <ScrollView
        ref={listRef}
        style={styles.leadsList}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.container, styles.cardsContainer]}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={reload} />
        }
      >
        {isLoading && <Text>Cargando leads...</Text>}
        {error && (
          <Pressable onPress={reload}>
            <Text>{error} Reintentar</Text>
          </Pressable>
        )}
        {!isLoading && !error && visibleLeads.length === 0 && (
          <Text>
            {searchQuery.trim()
              ? "No hay leads que coincidan con este nombre."
              : "No hay leads para este filtro."}
          </Text>
        )}
        {!isLoading &&
          !error &&
          pageLeads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              propertyName={
                getPropertyById(lead.propertyId)?.title ||
                "Sin propiedad registrada"
              }
              onOpen={() =>
                router.push({
                  pathname: "/userAdviser/lead-tracking/detail",
                  params: {
                    selectedLeadId: lead.id,
                    status,
                    ...(origin ? { origin } : {}),
                    trackingOpenedAt: String(Date.now()),
                  },
                })
              }
            />
          ))}
        {!isLoading && !error && totalPages > 1 && (
          <View style={styles.paginationContainer}>
            <Text style={styles.paginationSummary}>
              {(currentPage - 1) * LEADS_PER_PAGE + 1}–
              {Math.min(currentPage * LEADS_PER_PAGE, visibleLeads.length)} de{" "}
              {visibleLeads.length} leads
            </Text>
            <View style={styles.paginationControls}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Página anterior"
                disabled={currentPage === 1}
                style={[
                  styles.pageButton,
                  currentPage === 1 && styles.pageButtonDisabled,
                ]}
                onPress={() => {
                  Keyboard.dismiss();
                  setPage(currentPage - 1);
                }}
              >
                <Text style={styles.filterText}>Anterior</Text>
              </Pressable>
              <Text style={styles.filterText}>
                Página {currentPage} de {totalPages}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Página siguiente"
                disabled={currentPage === totalPages}
                style={[
                  styles.pageButton,
                  currentPage === totalPages && styles.pageButtonDisabled,
                ]}
                onPress={() => {
                  Keyboard.dismiss();
                  setPage(currentPage + 1);
                }}
              >
                <Text style={styles.filterText}>Siguiente</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
