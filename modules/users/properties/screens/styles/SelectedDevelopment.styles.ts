import { textSize } from '@/theme/typography'
import { generalColors } from "@/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: generalColors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 20,
  },
  optionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rightOptionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  developmentContainer: {
    gap: 10,
  },
  headerContainer: {},
  ubicationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  firstSectionContainer: {
    flexDirection: "row",
    alignItems: "stretch",
    height: 190,
    gap: 12,
    overflow: "hidden",
  },
  descriptionContainer: {
    flex: 1,
    minWidth: 0,
    gap: 5,
  },
  imageContainer: {
    flex: 1,
    height: "100%",
    borderRadius: 12,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  secondSectionContainer: {
    gap: 5,
  },
  galleryContainer: {
    gap: 5,
    flexDirection: "row",
  },
  galleryBlock: {
    width: 100,
    gap: 6,
    alignItems: "center",
  },
  galleryImage: {
    width: "100%",
    height: 100,
    borderRadius: 12,
  },
  galleryTextContainer: {
    paddingHorizontal: 2,
  },
  thirdSection: {
    gap: 5,
  },
  modelsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  modelPressable: {
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: "#F6F6F7",
    borderRadius: 12,
    paddingVertical: 7,
    paddingHorizontal: 5,
    width: 150,
    borderWidth: 0.5,
    borderColor: "#E5E5E8",
  },
  modelInformationBlock: {
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "#E5E5E8",
    height: 250,
    overflow: "hidden",
    paddingHorizontal: 7,
    paddingVertical: 7,
  },
  insideBlock: {
    flexDirection: "row",
    gap: 7,
  },
  modelImage: {
    height: "100%",
    flex: 1.5,
  },
  informationContainer: {
    flex: 2,
    gap: 6,
  },
  headerModelBlock: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: 'wrap'
  },
  typeContainer:{
    paddingVertical: 4,
    paddingHorizontal: 7,
    borderRadius: 12,
    backgroundColor: "#FAE8E8",
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer:{
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
  },
  contentBlock: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  addedContainer:{
    gap: 7
  },
  addedAmenitiesContainer:{
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12, 
  },
  amenitieObject:{
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,

  },



  fourthSection:{
    gap: 5, 
  },
  amenitiesContainer:{
    gap: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

  },
  amenitieBlock:{
    width: 90,
    height: 50,
    paddingVertical: 7,
    paddingHorizontal: 7,
    borderRadius: 12,
    borderWidth: .5,
    borderColor: "#E5E5E8",
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,

  },


  //// textos
  titleDevelopment: {
    fontSize: textSize.display,
    color: generalColors.black,
    fontWeight: "900",
    flexShrink: 1,
  },
  titleSections: {
    fontSize: textSize.subtitle,
    color: generalColors.development,
  },
  ubicationText: {
    fontSize: textSize.bodySmall,
    fontWeight: "600",
  },
  descriptionText: {
    fontSize: textSize.label,
    textAlign: "left",
  },
  galleryText: {
    fontSize: textSize.captionSmall,
  },
  nameModelText: {
    fontSize: textSize.label,
  },
  priceModelText: {
    fontSize: textSize.captionSmall,
  },
  typeText:{
    fontSize: textSize.tiny,
  },
  amenitieText:{
    fontSize: textSize.micro,
    textAlign: 'center',
  },
  contentText:{
    fontSize: textSize.captionSmall,
  },
  contentNumberText:{
    fontSize: textSize.caption
  },
  addedText:{
    fontSize: textSize.bodySmall,
    color: generalColors.development,
  },
  amenitieObjectText:{
    fontSize: textSize.captionSmall
  },
});
