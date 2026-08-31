import { Platform, StyleSheet } from "react-native";
import { generalColors } from "@/theme";

const numberFont = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "serif",
});

export const styles = StyleSheet.create({
  container: {
    paddingLeft: 15,
    paddingRight: 10,
    paddingVertical: 10,
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
  appointmentCardRent: {
    backgroundColor: generalColors.rentColor,
  },
  appointmentCardSale: {
    backgroundColor: generalColors.saleColor,
  },
  appointmentCardGeneral: {
    backgroundColor: "#434e31",
  },
  appointmentTitle: {
    color: "#d4b66f",
    fontSize: 12,
    fontWeight: "700",
  },
  dayPill: {
    alignSelf: "center",
    minHeight: 16,
    borderRadius: 4,
    backgroundColor: "#d4b66f",
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 5,
  },
  appointmentDay: {
    color: "#ffffff",
    fontSize: 8,
    fontWeight: "700",
  },
  appointmentTime: {
    color: "#d4b66f",
    fontSize: 10,
    marginTop: 2,
    textAlign: "center",
  },
  adviserInformationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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
  },

  detailLabel: {
    width: 85,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
  detailText: {
    fontSize: 8,
    flexShrink: 1,
    color: generalColors.white,
  },

  rightDivider: {
    borderWidth: 0.7,
    height: 1,
    width: "92%",
    alignSelf: "center",
    marginVertical: 4,
    borderRadius: 12,
    borderColor: "#d8c596",
  },
  appointmentContent: {
    flexDirection: "row",
  },

  leftSection: {
    flex: 2,
    paddingRight: 10,
    gap: 6,
  },

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
    borderLeftWidth: 1,
    borderLeftColor: "#d8c596",
    paddingLeft: 8,
  },



  contentDirection:{
    justifyContent: 'center',
    flex: 1,
    gap: 5
  },


  selectionButtons:{
    position: 'absolute',
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00000095',
    borderRadius: 12,
    gap: 19,
  },
  button:{
    height: 50,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 99,
    flexDirection: 'row',
    backgroundColor:'#fff'
  },
  editionButton:{
    
  },
  deleteButton:{
  },
});
