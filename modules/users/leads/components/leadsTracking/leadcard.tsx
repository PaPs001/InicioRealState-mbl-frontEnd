import { View, Text, Pressable, StyleSheet } from "react-native";
import { icons } from "@/assets";
import type { PropertyLead } from "@/lib/types";
import {
  getLeadOrigin,
  getLeadOriginColors,
} from "../../constants/lead-origins";
import { getLastContactLabel } from "../../utils/leads-principal-utils";
import {
  openPhoneCall,
  openWhatsApp,
} from "@/modules/users/main/utils/dashboard-formatters";
import { leadTrackingStatusCards } from "../../constants/lead-tracking-layout";
import { isLeadStatus } from "../../constants/lead-tracking-statuses";
import { userColors } from "@/theme";
import { EllipsisVertical } from "lucide-react-native";

export const LeadCard = ({
  lead,
  propertyName,
  onOpen,
}: {
  lead: PropertyLead;
  propertyName: string;
  onOpen: () => void;
}) => {
  const classification = leadTrackingStatusCards.find((card) =>
    isLeadStatus(lead.status, card.title),
  );
  const originColors = getLeadOriginColors(lead.source);
  const hasPhone = Boolean(lead.phone?.replace(/\D/g, ""));
  const budget =
    lead.notes?.match(/(?:^|\n)Presupuesto:\s*([^\n]+)/)?.[1] ||
    "Sin registrar";
  return (
    <View style={styles.leadCard}>
      <View style={styles.firstSectionCard}>
        <View style={styles.leftFirstSection}>
          <View
            style={[
              styles.profileCircle,
              {
                backgroundColor: classification?.color ?? "#fa7878",
              },
            ]}
          ></View>
          <View style={styles.leadInfoContainer}>
            <Text numberOfLines={2} style={styles.nameLeadText}>
              {lead.name}
            </Text>
            <View style={styles.timeContainer}>
              <icons.ActionIcon color={"#db4646"} width={15} height={15} />
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={styles.timeLeadText}
              >
                {getLastContactLabel(lead)}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.rightFirstSection}>
          <View
            style={[
              styles.clasificationContainer,
              {
                backgroundColor: originColors?.backgroundColor ?? "#E5E7EB",
              },
            ]}
          >
            <Text
              style={[
                styles.clasificationText,
                {
                  color: originColors?.textColor ?? "#374151",
                },
              ]}
            >
              {getLeadOrigin(lead.source) || lead.source || "Sin origen"}
            </Text>
          </View>
          <EllipsisVertical />
        </View>
      </View>
      <View style={styles.secondSectionCard}>
        <View style={styles.secondSection}>
          <icons.BuildingTower
            width={15}
            height={15}
            style={{ transform: [{ scale: 1.5 }] }}
          />
          <View style={styles.budgetContainer}>
            <Text style={styles.upTextLeadCard}>Interés</Text>
            <Text style={styles.downTextLeadCard} numberOfLines={1}>
              {propertyName}
            </Text>
          </View>
        </View>
        <View style={styles.secondSection}>
          <icons.MoneyIcon
            width={15}
            height={15}
            style={{ transform: [{ scale: 1.5 }] }}
          />
          <View style={styles.budgetContainer}>
            <Text style={styles.upTextLeadCard}>Presupuesto</Text>
            <Text style={styles.downTextLeadCard} numberOfLines={1}>
              {budget}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.thirdSection}>
        <Pressable
          style={[
            styles.thirSectionButtons,
            !hasPhone && styles.disabledButton,
            {
              backgroundColor: userColors.adviser.primary,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Enviar WhatsApp a ${lead.name}`}
          accessibilityState={{ disabled: !hasPhone }}
          disabled={!hasPhone}
          onPress={() => openWhatsApp(lead.phone)}
        >
          <icons.WhatsAppWhite />
          <Text
            style={[
              styles.textOptionButton,
              {
                color: "#f1f1f1",
              },
            ]}
          >
            WhatsApp
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.thirSectionButtons,
            !hasPhone && styles.disabledButton,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Llamar a ${lead.name}`}
          accessibilityState={{ disabled: !hasPhone }}
          disabled={!hasPhone}
          onPress={() => openPhoneCall(lead.phone)}
        >
          <icons.Phone />
          <Text style={styles.textOptionButton}>Llamar</Text>
        </Pressable>
        <Pressable style={styles.thirSectionButtons} onPress={onOpen}>
          <icons.ActionIcon />
          <Text style={styles.textOptionButton}>Ver ficha</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  leadCard: {
    paddingTop: 15,
    paddingBottom: 25,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    borderRadius: 15,
    gap: 7,
  },
  firstSectionCard: {
    flexDirection: "row",
    gap: 7,
  },
  leftFirstSection: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    flex: 1,
    minHeight: 0,
  },
  leadInfoContainer: {
    flex: 1,
    minWidth: 0,
  },
  rightFirstSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  secondSectionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  secondSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: "#F4F1E7",
    borderRadius: 13,
    width: "50%",
    overflow: "hidden",
  },
  budgetContainer: {
    flex: 1,
    minWidth: 0,
  },
  thirdSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  thirSectionButtons: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#F4F1E7",
    borderRadius: 13,
  },

  disabledButton: {
    opacity: 0.5,
  },
  profileCircle: {
    width: 45,
    height: 45,
    borderRadius: 999,
    backgroundColor: "red",
  },
  timeContainer: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
  },
  clasificationContainer: {
    paddingVertical: 7,
    paddingHorizontal: 8,
    gap: 7,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "red",
    borderRadius: 15,
  },

  // Textos

  nameLeadText: {
    fontSize: 14,
    flexShrink: 1,
  },
  timeLeadText: {
    fontSize: 11,
    fontWeight: "500",
  },
  clasificationText: {
    fontSize: 10,
    fontWeight: "500",
  },
  downTextLeadCard: {
    fontSize: 12,
    fontWeight: "600",
  },
  upTextLeadCard: {
    fontSize: 11,
    fontWeight: "400",
  },
  textOptionButton: {
    fontSize: 12,
    fontWeight: "800",
  },
});
