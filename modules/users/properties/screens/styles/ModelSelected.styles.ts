import { generalColors, textColor } from "@/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: generalColors.background,
  },
  scrollView:{
    flex: 1
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 110,
    gap: 10,
  },
  headerContainer: {
    paddingLeft: 15,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  headerTitleContainerStacked: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  typeContainer: {
    flexShrink: 0,
    paddingVertical: 4,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAE8E8",
    borderRadius: 12,
  },
  ubicationContainer: {
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
  },
  roulleteContainer: {
    gap: 10,
  },
  imagesRoulleteContainer: {
    gap: 10,
    flexDirection: "row",
  },
  principalImage: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 12,
  },
  imagesHouseContainer: {
    width: 100,
    alignItems: "center",
    gap: 5,
  },
  imageRoullete: {
    width: "100%",
    height: 90,
    borderRadius: 12,
  },

  modelStatsContainer: {
    flexDirection: "row",
    alignItems: "stretch",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: generalColors.borderSoft,
    paddingVertical: 18,
    width: "100%",
    overflow: "hidden",
  },
  contentBlock: {
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 4,
  },
  contentDivider: {
    borderRightWidth: 1,
    borderColor: generalColors.borderSoft,
  },
  addedContainer: {
    gap: 7,
    width: '100%'
  },
  addedAmenitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 12,
    rowGap: 8,
    width: '100%',
    alignItems: 'flex-start'
  },
  amenitieObject: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    maxWidth: "100%"
  },
  principalRenderContainer:{
    gap: 8
  },
  rendersContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  renderBlock: {
    flex: 1,
    gap: 5,
    borderRadius: 15,
    borderWidth: .5,
    borderColor: generalColors.borderSoft,
    overflow: 'hidden'
  },
  renderImage: {
    width: '100%',
    aspectRatio: 1,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  renderTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingBottom: 10,
    paddingTop: 3,
    gap: 7,
    overflow: 'hidden',

  },
  buttonsContainer: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 16,
    zIndex: 10,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    overflow: 'hidden',
    backgroundColor: '#fdfbf98e',
    borderRadius: 12,
  },
  availabilityButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'red',
    paddingVertical: 12,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: generalColors.white
  },
  dateButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: 'red',
    paddingVertical: 12,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },

  //&&&&/// textos

  titleText: {
    fontSize: 26,
    width: "65%",
    flexShrink: 1,
    minWidth: 0,
  },
  titleTextStacked: {
    width: "100%",
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
  },
  typeText: {
    fontSize: 10,
  },
  ubicationText: {
    fontSize: 12,
    flexGrow: 1,
  },
  titleImageText: {
    fontSize: 12,
    textAlign: "center",
  },
  contentText: {
    fontSize: 10,
    textAlign: "center",
  },
  contentNumberText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 17,
    color: generalColors.development,
  },
  amenitieObjectText: {
    fontSize: 13,
    flexShrink: 1,
  },
  renderTitle: {
    fontSize: 11
  },
  renderText: {
    fontSize: 8,
    color: textColor.softText
  },
  availabilityTextButton: {
    fontSize: 13,
    color: 'red',

  },
  dateTextButton: {
    fontSize: 13,
    color: generalColors.white
  },
});
