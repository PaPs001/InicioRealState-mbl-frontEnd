import { StyleSheet } from "react-native";
import { generalColors, textColor } from "@/theme";

export const styles = StyleSheet.create({
  cardContainer: {
    width: "100%",
    minHeight: 100,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: generalColors.borderSoft,
    backgroundColor: "#fff",
    flexDirection: 'row',
    overflow: 'hidden',
    gap: 4
  },
  imageContainer:{
    flex: 1,
  },
  imageCard:{
    width: '100%',
    height: '100%',
    borderRadius: 12

  },
  informationContainer:{
    flex: 1,
  },
  zoneContainer:{
    flexDirection: 'row',
    gap: 3,
    alignItems: 'center',

  },
  zoneText: {
    fontSize: 11,
    color: generalColors.development,
    fontStyle: 'normal',
    fontWeight: '900',
  },
  nameText:{
    fontSize: 18,
    fontWeight: '900'
  },
  locationText: {
    fontSize: 12,
    color: textColor.softText
  },
  fromText:{
    fontSize: 12,
    color: textColor.softText
  },
  priceFrom: {
    fontSize: 16,
    color: generalColors.development
  },
  toText:{
    fontSize: 10,
    color: textColor.softText
  },
  extraInformationContainer:{
    flexDirection: 'row',
    alignItems: 'center',
    
  },
  footerInformationContainer:{
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: generalColors.borderSoft,
    flex: 1,
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 7
  },
  extraInformationText:{
    fontSize: 10
  },
});
