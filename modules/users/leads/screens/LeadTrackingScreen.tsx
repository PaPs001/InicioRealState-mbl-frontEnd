import { styles } from "./styles/LeadTrackingScreen.styles";
import { View, Text, Image, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { logos, icons } from "@/assets";
import { generalColors, userColors } from "@/theme";
import {
  ClasificationLeads,
  LeadsTypes,
  mockLeads,
  clasificationLeads,
} from "../mock/leads";
export const LeadTrackingScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <logos.irsPrincipal style={styles.logoContainer} />
        <View style={styles.headerContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>Seguimiento de Leads</Text>
            <Text style={styles.subtitleText}>
              Gestiona y da seguimiento de tus prospectos
            </Text>
          </View>
          <View style={styles.actionIconsContainer}>
            <icons.ActionIcon width={20} height={20} />
            <icons.ActionIcon width={20} height={20} />
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
              <icons.ActionIcon />
            </View>
            <View>
              <Text style={styles.titleCardText}>Prioritarios</Text>
              <Text style={[styles.numberCardText, {
                color: '#fff'
              }]}>8</Text>
              <Text style={[styles.subtitleCardText, {
                color: '#C4D6C1'
              }]}>Perfilamento / Cierre</Text>
            </View>
          </View>
          <View
            style={[
              styles.cardContainer
            ]}
          >
            <View
              style={[
                styles.iconCard,
                {
                  backgroundColor: "#d7b76687",
                },
              ]}
            >
              <icons.ActionIcon />
            </View>
            <View>
              <Text style={[styles.titleCardText, {
                color: '#080808'
              }]}>Leads Nuevos</Text>
              <Text style={styles.numberCardText}>12</Text>
              <Text style={styles.subtitleCardText}>Por Contactar hoy</Text>
            </View>
          </View>
        </View>
        <View style={styles.allClasificationsContainer}>
          {clasificationLeads.map((classification: ClasificationLeads) => {
            const Icon = classification.icon;

            const leads = mockLeads.filter(
              (lead) => lead.type === classification.name,
            );

            return (
              <View
                style={styles.clasificationContainer}
                key={classification.name}
              >
                <View style={styles.clasificationHeader}>
                  <Icon width={18} height={18} />
                  <Text
                    adjustsFontSizeToFit
                    style={styles.clasificationTitleText}
                    numberOfLines={2}
                  >
                    {classification.name}
                  </Text>

                  {classification.extra && (
                    <View style={styles.timeContainer}>
                      <Text style={styles.timeText}>{classification.extra}</Text>
                    </View>
                  )}
                </View>
                {leads.map((lead) => (
                  <View>
                    <View
                      style={[
                        styles.clasificationCard,
                        {
                          backgroundColor: lead.color,
                        },
                      ]}
                    >
                      <View style={styles.leftContainer}>
                        <Icon width={18} height={18} />
                        <View style={styles.textCardContainer}>
                          <Text style={styles.titleCardLead} numberOfLines={3}>
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
                          <Text style={styles.numberLeads} adjustsFontSizeToFit>
                            {lead.numberLeads} leads
                          </Text>
                        </View>
                        <icons.ArrowLeft
                          width={18}
                          strokeWidth={3}
                          height={18}
                        />
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
