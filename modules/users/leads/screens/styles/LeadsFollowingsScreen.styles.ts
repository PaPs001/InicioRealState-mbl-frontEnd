import { generalColors, textColor, userColors } from "@/theme";
import { Subtitles } from "lucide-react-native";
import { StyleSheet } from "react-native";
import GenericTouchable from "react-native-gesture-handler/lib/typescript/components/touchables/GenericTouchable";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: generalColors.background,
  },
  content: {
    minHeight: 0,
    paddingHorizontal: 12,
  },
  logoWrap: {
    position: "relative",
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    left: 0,
    zIndex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: 50,
    height: 50,
  },
  headerContainer: {
    gap: 7,
    marginTop: 22,
  },
  title: {
    fontSize: 22,
    lineHeight: 25,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: textColor.softText,
  },
  filtersContainer: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 9,
  },
  filterScroll: {
    flexGrow: 0,
    flexShrink: 0,
    maxHeight: 52,
    borderWidth: 0.8,
    borderColor: generalColors.borderSoft,
    borderBottomLeftRadius: 17,
    borderBottomRightRadius: 17,
    borderTopWidth: 0,
    marginTop: 6,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 15,
    borderColor: generalColors.borderSoft,
    borderWidth: 1,
    justifyContent: "center",
    backgroundColor: '#fff'
  },
  filterText:{
    fontSize: 12,
    textAlign: 'center',
    textAlignVertical: 'top'

  },
  followingsScroll: {
    flex: 1,
  },

  errorText: {
    fontSize: 17,
    flexShrink: 1,
    minWidth: 0,
    width: "100%",
    textAlign: "center",
  },

  buttonsContainer: {
    gap: 12,
    zIndex: 10,
    position: "absolute",
    bottom: 0,
    backgroundColor: generalColors.white,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderWidth: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 9,
    paddingVertical: 12,
    borderColor: generalColors.borderSoft,
  },
  topButtonsContainer: {
    flexDirection: "row",
    gap: 6,
  },
  buttonStyle: {
    flex: 1,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 8,
    minHeight: 40,
  },
  buttonStyleBottom: {
    width: "100%",
    backgroundColor: userColors.adviser.primary,
  },
  buttonText: {
    fontSize: 10,
  },

  followingsContainer: {
    flex: 1,
    minHeight: 0,
    borderRadius: 12,
    paddingHorizontal: 9,
  },
  contentFollowingContainer: {
    gap: 12,
    paddingTop: 12,
    paddingBottom: 140,
  },

  border: {
    borderWidth: 0.5,
    borderColor: generalColors.borderSoft,
    borderBottomRightRadius: 12,
    borderBottomLeftRadius: 12,
  },

  headerBlock: {
    gap: 15,
    paddingHorizontal: 11,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: generalColors.borderSoft,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: "hidden",
  },
  cardContainer: {
    borderWidth: 1.7,
    borderColor: generalColors.borderSoft,
    paddingVertical: 12,
    paddingHorizontal: 9,
    borderRadius: 12,
    gap: 10,
    backgroundColor: '#ffff',

    flex: 1,
    flexShrink: 1,
    minWidth: 0
  },
  headerCardContainer: {
    flexDirection: "row",
  },
  headerTimeContainer: {
    flexDirection: "row",
    gap: 15,
  },
  followingContainer: {
    flexDirection: "row",
    gap: 7,
    borderWidth: 2,
    overflow: "hidden",
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    borderColor: generalColors.borderSoft,
    alignItems: "center",
    
  },
  followingText: {
    flexWrap: "wrap",
    flexShrink: 1,
    fontSize: 12,
    fontWeight: "400",
  },
  dateText: {
    fontSize: 11,
    fontWeight: "400",
    color: userColors.adviser.primary,
  },
  timeText: {
    fontSize: 11,
    fontWeight: "400",
    color: userColors.adviser.primary,
  },

  timeLineContainer: {
    flexDirection: "row",
    alignItems: 'stretch',
    gap: 5,
  },
  circlesContainer: {
    position: 'relative',
    alignSelf:'stretch'
  },
  centerCirclesContainer: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    marginTop: 8,
  },
  firstCircle: {
    borderRadius: 99,
    width: 8,
    height: 8,
    borderWidth: 1,
    paddingVertical: 1,
    paddingHorizontal: 1,
  },
  centerLitteCircle:{
    backgroundColor: userColors.adviser.primary,
    flex: 1,
    borderRadius: 99
  },
  bigCircleIcon: {
    borderWidth: .5,
    borderRadius: 99,
    width: 30,
    height: 30,
    backgroundColor: userColors.adviser.primaryDark,
  },
  timelineLine: {
    position: "absolute",
    width: 1,
    backgroundColor: "#c4c4c4",
    top: 23,
    bottom: -35,
  },
});
