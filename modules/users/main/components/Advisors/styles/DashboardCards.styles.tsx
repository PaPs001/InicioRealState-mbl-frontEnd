import { Platform, StyleSheet } from "react-native";
import { borderColor, generalColors } from "@/theme";

const numberFont = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "serif",
});

export const styles = StyleSheet.create({
  container: {
    //paddingLeft: 10,
    //paddingRight: 8,
    //paddingVertical: 10,
    minHeight: 65,
    borderRadius: 12,
  },
  priorityCard: {
    flex: 1,
    height: 85,
    borderRadius: 8,
    backgroundColor: "#3d5f42",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    gap: 2,
  },
  priorityValue: {
    color: "#ffffff",
    fontFamily: numberFont,
    fontSize: 27,
    lineHeight: 29,
  },
  priorityValueGold: {
    color: "#d4b66f",
  },
  priorityLabel: {
    color: "#ffffff",
    fontSize: 10,
    lineHeight: 10,
    textAlign: "center",
  },
  appointmentTitle: {
    color: generalColors.white,
    fontSize: 12,
    fontWeight: "700",
  },
  dayPill: {
    minHeight: 27,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 6,
    backgroundColor: "#fbfbf9",
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 8,
    position: "absolute",
    top: 1,
    right: 1.5,
    left: 0,
  },
  appointmentDay: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "700",
    flex: 1,
  },
  appointmentTime: {
    color: "#fff",
    fontSize: 10,
    marginTop: 2,
    textAlign: "center",
  },
  dateDurationContainer:{
    flexDirection: 'row',
    gap: 3,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: generalColors.white,
    borderRadius: 12,
    height: 12,
  },
  adviserInformationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 5,
  },
  circularIconAdviser: {
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    height: 24,
    backgroundColor: "#ba902e",
  },
  circularIconHelp: {
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    height: 24,
    backgroundColor: "#84a5d6",
  },

  personInfo: {
    flexShrink: 1,
    flex: 1,
  },
  metricCard: {
    flex: 1,
    minHeight: 77,
    borderRadius: 5,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e4e4e4",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  metricValue: {
    color: "#2a2d31",
    fontFamily: numberFont,
    fontSize: 28,
    lineHeight: 32,
  },
  metricLabel: {
    color: "#7b8780",
    fontSize: 9,
    textAlign: "center",
    lineHeight: 11,
  },
  funnelItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  funnelValue: {
    color: "#2a2d31",
    fontFamily: numberFont,
    fontSize: 20,
  },
  funnelLabel: {
    color: "#7b8780",
    fontSize: 8,
    textAlign: "center",
    lineHeight: 10,
  },
  alertRow: {
    height: 36,
    borderRadius: 5,
    backgroundColor: "#ffe1dd",
    borderWidth: 1,
    borderColor: "#ffc5bc",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    gap: 8,
    marginTop: 6,
  },
  alertText: {
    flex: 1,
    color: "#4d4747",
    fontSize: 12,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    width: "100%",
  },

  detailLabel: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailCopy: {
    flex: 1,
    minWidth: 0,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  headerLeft: {
    flex: 2,
    justifyContent: "center",
    paddingRight: 10,
  },

  headerRight: {
    flex: 1,
    alignItems: "center",
    borderLeftWidth: 1,
    borderLeftColor: "#d8c596",
    paddingLeft: 8,
  },

  contentRow: {
    flexDirection: "row",
  },

  leftContent: {
    flex: 2,
    paddingRight: 10,
    justifyContent: "center",
    gap: 6,
  },

  rightContent: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: "#d8c596",
    paddingLeft: 8,
  },

  detailTitle: {
    fontSize: 10,
    flexShrink: 1,
    color: "#d4b66f",
  },
  titleDetailText: {
    fontSize: 9,
    flexShrink: 1,
    color: generalColors.white,
    fontWeight: "600",
    flex: 1,
  },
  subtitleDetailText: {
    fontSize: 10,
    color: generalColors.white,
  },
  titleAdviserText: {
    fontSize: 11,
    color: generalColors.white,
    fontWeight: "600",
  },
  adviserNameText: {
    fontSize: 12,
    color: generalColors.white,
    fontWeight: "700",
  },

  rightDivider: {
    borderWidth: 0.7,
    height: 1,
    width: "92%",
    alignSelf: "center",
    marginVertical: 5,
    marginRight: 7,
    borderRadius: 12,
    borderColor: "#d8c596",
  },
  verticalDivider: {
    position: "absolute",
    left: 0,
    top: 33,
    height: "65%",
    width: 1,
    backgroundColor: "#d8c596",
  },
  appointmentContent: {
    flexDirection: "row",
  },
  leftSection: {
    flex: 1.5,
    paddingRight: 10,
    gap: 6,
    paddingLeft: 10,
    paddingVertical: 10,
  },
  appoinmentTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  appointmentTypeIcon: {},
  appointmentTextRow: {
    gap: 3,
  },
  appointmentTypeText: {
    fontSize: 12,
    lineHeight: 14,
    color: generalColors.white,
  },
  appointmentTypeRent: {
    backgroundColor: generalColors.rentColor,
    borderColor: "#fff",
    borderWidth: 0.5,
  },
  appointmentTypeSale: {
    backgroundColor: generalColors.saleColor,
    borderColor: "#fff",
    borderWidth: 0.5,
  },
  appointmentTypeGeneral: {},
  googleCalendarEmptyState: {
    flex: 1,
    justifyContent: "center",
  },

  googleCalendarEmptyText: {
    color: generalColors.white,
    fontSize: 10,
    lineHeight: 14,
  },

  rightSection: {
    flex: 1,
    paddingLeft: 8,
    alignItems: "center",
    paddingBottom: 10,
  },

  contentDirection: {
    justifyContent: "center",
    flex: 1,
    gap: 5,
  },

  selectionButtons: {
    position: "absolute",
    width: "100%",
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00000095",
    borderRadius: 12,
    gap: 19,
  },
  button: {
    height: 50,
    width: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 99,
    flexDirection: "row",
    backgroundColor: "#fff",
  },
  editionButton: {},
  deleteButton: {},
});
