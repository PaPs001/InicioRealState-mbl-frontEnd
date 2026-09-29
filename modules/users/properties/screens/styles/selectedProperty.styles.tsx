import { generalColors, textColor, userColors } from "@/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: generalColors.background,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 5,
    gap: 10,
  },
  propertyListContent: {
    paddingBottom: 92,
  },
  listSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  operationContainer: {
    flexDirection: "row",
    gap: 6,
    alignContent: "center",
    alignItems: "center",
  },
  operationIcon: {
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 3,
  },
  operationText: {
    fontSize: 12,
    //color: textColor.softText,
  },
  propertyTitle: {
    fontSize: 30,
    flexShrink: 1,
    lineHeight: 35,
  },
  propertyInformation: {
    gap: 6,
  },
  propertyAddressView: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingRight: 5,
  },
  propertyAddress: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  addressText: {
    flex: 1,
    fontSize: 13,
    color: textColor.softText,
  },
  propertyView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 12,
    backgroundColor: "#6bdfff7a",
    width: 95,
    flexShrink: 0,
  },
  viewText: {
    fontSize: 7,
    fontWeight: "500",
  },

  propertyFeaturesContainer: {
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    backgroundColor: "#FDFBF9",
    borderColor: "#00000055",
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 17,
    gap: 10,
    justifyContent: 'center',

  },
  extrasTtitleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  propertyMetricContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  propertyMetricHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    justifyContent: "center",
  },
  metricNumber: {
    fontSize: 18,
    color: userColors.adviser.primaryDark,
  },
  metricText: {
    fontSize: 12,
    color: textColor.softText,
  },
  moreFeaturesContainer: {
    flexDirection: "row",
    gap: 5,
  },
  moreFeaturesText: {
    flexShrink: 1,
    fontSize: 12,
  },

  detailsContainer: {
    gap: 5,
  },
  detailsTitle: {
    fontSize: 15,
    color: userColors.adviser.primary,
  },
  detailsInformation: {
    fontSize: 13,
    color: textColor.softText,
    flexShrink: 1,
    lineHeight: 15,
  },
  sectionContainer: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    color: userColors.adviser.primary,
  },
  priceSection: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",

    position: "absolute",
    left: 22,
    right: 22,
    bottom: 16,
    zIndex: 10,

    paddingVertical: 12,
    paddingHorizontal: 18,
  },

  mapTextAdviseContainer: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
  },
  mapText: {
    fontSize: 12,
    color: textColor.softText,
  },
});
