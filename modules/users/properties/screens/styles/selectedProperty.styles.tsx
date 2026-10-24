import { textSize, platformLineHeight } from "@/theme/typography";
import { generalColors, textColor, userColors } from "@/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  propertyStateContainer: {
    flex: 1,
    backgroundColor: generalColors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 24,
  },
  propertyStateBackButton: {
    backgroundColor: generalColors.greenTitle,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  propertyStateBackText: {
    color: generalColors.white,
    fontSize: textSize.subtitle,
    fontWeight: "600",
  },
  propertyStateContent: {
    alignItems: "center",
    gap: 12,
    width: "100%",
    maxWidth: 400,
  },
  propertyStateTitle: {
    fontSize: textSize.title,
    fontWeight: "600",
    color: generalColors.title,
    textAlign: "center",
  },
  propertyStateMessage: {
    fontSize: textSize.body,
    lineHeight: platformLineHeight(21),
    color: generalColors.textMuted,
    textAlign: "center",
  },
  propertyStateCode: {
    fontSize: textSize.body,
    fontWeight: "600",
    color: generalColors.error,
    textAlign: "center",
  },
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
    fontSize: textSize.caption,
    //color: textColor.softText,
  },
  propertyTitle: {
    fontSize: textSize.displaySmall,
    flexShrink: 1,
    lineHeight: platformLineHeight(35),
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
    fontSize: textSize.bodySmall,
    color: textColor.softText,
  },
  propertyView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 9,
    borderRadius: 12,
    backgroundColor: "#6bdfff7a",
    flexShrink: 0,
  },
  viewText: {
    fontSize: textSize.tiny,
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
    justifyContent: "center",
    overflow: 'hidden', 
  },
  extrasTtitleContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  extrasTitle: {
    fontSize: textSize.body,
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
    fontSize: textSize.titleSmall,
    color: userColors.adviser.primaryDark,
  },
  metricText: {
    fontSize: textSize.caption,
    color: textColor.softText,
  },
  moreFeaturesContainer: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  moreFeaturesText: {
    flexShrink: 1,
    fontSize: textSize.label,
  },

  detailsContainer: {
    gap: 5,
  },
  detailsTitle: {
    fontSize: textSize.bodyLarge,
    color: userColors.adviser.primary,
  },
  detailsInformation: {
    fontSize: textSize.body,
    color: textColor.softText,
    flexShrink: 1,
    lineHeight: platformLineHeight(15),
  },
  descriptionAction: {
    alignSelf: "flex-start",
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  descriptionActionText: {
    color: userColors.adviser.primary,
    fontSize: textSize.body,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  descriptionModalText: {
    lineHeight: platformLineHeight(22),
  },
  sectionContainer: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: textSize.titleSmall,
    color: userColors.adviser.primary,
  },
  priceSection: {
    backgroundColor: "#fffffff6",
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

    paddingVertical: 17,
    paddingHorizontal: 18,
    boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.42)",
  },

  mapPrincipalContainer: {
    flexDirection: "column",
    gap: 14,
    alignItems: "center",
  },
  mapTextAdviseContainer: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
  },
  mapText: {
    fontSize: textSize.caption,
    color: textColor.softText,
  },

  mapShadowContainer: {
    width: "100%",
    height: 300,
    borderRadius: 17,
    boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.42)",
  },

  mapContainer: {
    flex: 1,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: "#ecebeb",
    overflow: "hidden",
  },

  map: {
    width: "100%",
    height: "100%",
  },

  markerContainer: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    paddingBottom: 10,
  },
  circle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    overflow: "hidden",
    zIndex: 2,
    elevation: 2,
    backgroundColor: userColors.adviser.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 52,
    height: 52,
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 11,
    borderRightWidth: 11,
    borderTopWidth: 16,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#fdfdfd",
    marginTop: -3,
  },
});
