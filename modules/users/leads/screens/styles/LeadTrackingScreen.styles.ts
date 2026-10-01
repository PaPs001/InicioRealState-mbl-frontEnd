import { generalColors, textColor } from "@/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: generalColors.background,
    width: "100%",
    height: "100%",
  },
  container: {
    gap: 10,
    paddingHorizontal: 12,
    paddingBottom: 80
  },
  logoContainer: {
    alignSelf: "center",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleContainer: {
    flex: 1,
  },
  actionIconsContainer: {
    flexDirection: "row",
    gap: 25,
  },
  titleText: {
    fontSize: 20,
    fontWeight: "900",
  },
  subtitleText: {
    fontSize: 12,
    fontWeight: "600",
    color: textColor.softText,
  },
  cardsTrackingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  cardContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 9,
  },
  iconCard: {
    backgroundColor: "red",
    borderRadius: 99,
    padding: 16,
  },
  titleCardText: {
    fontSize: 13,
    color: "#f1f0f0",
  },
  subtitleCardText: {
    fontSize: 10,
    fontWeight: "600",
  },
  numberCardText: {
    fontSize: 25,
  },
  allClasificationsContainer: {
    gap: 15,
  },
  clasificationContainer: {
    gap: 10,
    backgroundColor: '#fff',
    paddingTop: 15,
    paddingBottom: 30,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  clasificationHeader: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  clasificationCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    paddingLeft: 20,
    paddingRight: 10,
    borderRadius: 12,
    gap: 8,
    overflow: 'hidden'
  },
  leftContainer: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },
  rightContainer: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: 'flex-end',
    flexShrink: 0
  },
  numberLeadContainer:{
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 17
  },
  textCardContainer:{
    flex: 1,
    minWidth: 0
  },
  timeContainer:{
    backgroundColor: '#FBDDE0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
  },

  //// textos

  titleCardLead:{
    fontSize: 15,
    fontWeight:'900',
    flexShrink: 1,
  },
  subtitleCardLead:{
    fontSize: 11,
    fontWeight: '400',
    flexWrap: 'wrap',
    flexShrink: 1
  },
  numberLeads:{
    fontSize: 12,
    fontWeight: '400'
  },
  clasificationTitleText:{
    fontSize: 17,
  },
  timeText:{
    fontSize: 10,
    color: "#AF474A",
    fontWeight: '400'
  }
});
