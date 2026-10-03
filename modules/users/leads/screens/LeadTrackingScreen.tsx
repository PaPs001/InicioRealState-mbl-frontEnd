import { styles } from "./styles/LeadTrackingScreen.styles";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { logos, icons } from "@/assets";
import { userColors } from "@/theme";
import {
  ClasificationLeads,
  clasificationLeads,
} from "../constants/lead-tracking-layout";
import { router } from "expo-router";
import { useLeadTrackingRecords } from "../hooks/useLeadTrackingRecords";
import {
  buildLeadTrackingGroups,
  isUnclassifiedTrackingLead,
} from "../utils/lead-tracking";

export const LeadTrackingScreen = () => {
  const { leads: records, isLoading, error, reload } = useLeadTrackingRecords();
  const groups = buildLeadTrackingGroups(records);
  const priorityCount = groups
    .filter((group) => group.type === "ALTA PRIORIDAD")
    .reduce((sum, group) => sum + group.numberLeads, 0);
  const newCount =
    groups.find((group) => group.title === "LEAD NUEVO")?.numberLeads ?? 0;
  const unclassifiedCount = records.filter(isUnclassifiedTrackingLead).length;
  const openStatus = (status: string) =>
    router.push({
      pathname: "/userAdviser/lead-tracking/selecting",
      params: { status },
    });
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={reload} />
        }
      >
        <logos.irsPrincipal style={styles.logoContainer} />
        <View style={styles.headerContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>Seguimiento de Leads</Text>
            <Text style={styles.subtitleText}>
              Gestiona y da seguimiento de tus prospectos
            </Text>
          </View>
        </View>
        <View style={styles.cardsTrackingContainer}>
          <View
            style={[
              styles.cardContainer,
              {
                backgroundColor: userColors.adviser.primarySoft,
              },
            ]}
          >
            <View
              style={[
                styles.iconCard,
                {
                  backgroundColor: "#638363",
                },
              ]}
            >
              <icons.People
                width={24}
                height={24}
                style={{ transform: [{ scale: 1.5 }] }}
              />
            </View>
            <View>
              <Text style={styles.titleCardText}>Prioritarios</Text>
              <Text
                style={[
                  styles.numberCardText,
                  {
                    color: "#fff",
                  },
                ]}
              >
                {isLoading || error ? "—" : priorityCount}
              </Text>
              <Text
                style={[
                  styles.subtitleCardText,
                  {
                    color: "#C4D6C1",
                  },
                ]}
              >
                Perfilamento / Cierre
              </Text>
            </View>
          </View>
          <View style={[styles.cardContainer]}>
            <View
              style={[
                styles.iconCard,
                {
                  backgroundColor: "#d7b76687",
                },
              ]}
            >
              <icons.Lighting
                width={24}
                height={24}
                style={{ transform: [{ scale: 1.5 }] }}
                color={"#D7B766"}
              />
            </View>
            <View>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={[
                  styles.titleCardText,
                  {
                    color: "#080808",
                  },
                ]}
              >
                Leads Nuevos
              </Text>
              <Text style={styles.numberCardText}>
                {isLoading || error ? "—" : newCount}
              </Text>
              <Text style={styles.subtitleCardText}>Por Contactar hoy</Text>
            </View>
          </View>
        </View>
        {error && (
          <Pressable onPress={reload}>
            <Text>{error} Reintentar</Text>
          </Pressable>
        )}
        {isLoading && <Text>Cargando leads...</Text>}
        {!isLoading && !error && records.length === 0 && (
          <Text>No hay leads registrados.</Text>
        )}
        {unclassifiedCount > 0 && (
          <View style={styles.clasificationContainer}>
            <Pressable
              style={[
                styles.clasificationCard,
                {
                  backgroundColor: "#fa7878",
                },
              ]}
              onPress={() => openStatus("unclassified")}
            >
              <View style={styles.leftContainer}>
                <View style={styles.textCardContainer}>
                  <Text
                    style={[
                      styles.titleCardLead,
                      {
                        color: "#fff",
                      },
                    ]}
                    numberOfLines={3}
                  >
                    Sin clasificar
                  </Text>
                  <Text
                    style={[
                      styles.subtitleCardLead,
                      {
                        color: "#fff",
                      },
                    ]}
                    numberOfLines={3}
                  >
                    Estos leads no tienes un estado de clasificacion correcto
                  </Text>
                </View>
              </View>
              <View style={[styles.rightContainer]}>
                <View
                  style={[
                    styles.numberLeadContainer,
                    {
                      backgroundColor: "#b12d2d",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.numberLeads,
                      {
                        color: "#fff",
                      },
                    ]}
                    adjustsFontSizeToFit
                  >
                    {unclassifiedCount} leads
                  </Text>
                </View>
                <icons.ArrowLeft width={18} strokeWidth={3} height={18} />
              </View>
            </Pressable>
          </View>
        )}
        <View style={styles.allClasificationsContainer}>
          {clasificationLeads.map((classification: ClasificationLeads) => {
            const Icon = classification.icon;

            const leads = groups.filter(
              (lead) => lead.type === classification.name,
            );

            return (
              <View
                style={styles.clasificationContainer}
                key={classification.name}
              >
                <View style={styles.clasificationHeader}>
                  <Icon
                    width={15}
                    height={15}
                    style={{ transform: [{ scale: 1.5 }] }}
                    color={classification.iconColor}
                    {...(classification.iconFill ? { fill: classification.iconFill } : {})}
                  />
                  <Text
                    adjustsFontSizeToFit
                    style={styles.clasificationTitleText}
                    numberOfLines={2}
                  >
                    {classification.name}
                  </Text>

                  {classification.extra && (
                    <View style={styles.timeContainer}>
                      <Text style={styles.timeText}>
                        {classification.extra}
                      </Text>
                    </View>
                  )}
                </View>
                {leads.map((lead) => {
                  const StatusIcon = lead.icon;
                  return (
                    <View key={lead.title}>
                      <Pressable
                        onPress={() => openStatus(lead.title)}
                        disabled={isLoading || !!error}
                        style={[
                          styles.clasificationCard,
                          {
                            backgroundColor: lead.color,
                          },
                        ]}
                      >
                        <View style={styles.leftContainer}>
                          <StatusIcon
                            width={15}
                            height={15}
                            style={{ transform: [{ scale: 1.5 }] }}
                            color={lead.iconColor}
                            {...(lead.iconFill ? { fill: lead.iconFill } : {})}
                          />
                          <View style={styles.textCardContainer}>
                            <Text
                              style={styles.titleCardLead}
                              numberOfLines={3}
                            >
                              {lead.title}
                            </Text>
                            <Text
                              style={styles.subtitleCardLead}
                              numberOfLines={3}
                            >
                              {lead.subtitle}
                            </Text>
                          </View>
                        </View>
                        <View style={[styles.rightContainer]}>
                          <View
                            style={[
                              styles.numberLeadContainer,
                              {
                                backgroundColor: lead.countColor,
                              },
                            ]}
                          >
                            <Text
                              style={styles.numberLeads}
                              adjustsFontSizeToFit
                            >
                              {isLoading || error ? "—" : lead.numberLeads}{" "}
                              leads
                            </Text>
                          </View>
                          <icons.ArrowLeft
                            width={8}
                            height={8}
                            color={"#d41e1e"}
                            style={{ transform: [{ scale: 1.5 }] }}
                          />
                        </View>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
