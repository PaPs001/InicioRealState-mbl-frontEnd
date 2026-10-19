import { textSize } from '@/theme/typography'
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
    gap: 4,
    marginBottom: 10,
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
    paddingVertical: 5,
    paddingHorizontal: 7,
    gap: 5,
  },
  zoneContainer:{
    flexDirection: 'row',
    gap: 3,
    alignItems: 'center',

  },
  zoneText: {
    fontSize: textSize.label,
    color: generalColors.development,
    fontStyle: 'normal',
    fontWeight: '900',
  },
  nameText:{
    fontSize: textSize.titleSmall,
    fontWeight: '900'
  },
  locationText: {
    fontSize: textSize.caption,
    color: textColor.softText
  },
  fromText:{
    fontSize: textSize.caption,
    color: textColor.softText
  },
  priceFrom: {
    fontSize: textSize.subtitle,
    color: generalColors.development
  },
  toText:{
    fontSize: textSize.captionSmall,
    color: textColor.softText
  },
  extraInformationContainer:{
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 7
  },
  footerInformationContainer:{
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: generalColors.borderSoft,
    flex: 1,
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  extraInformationText:{
    fontSize: textSize.micro
  },
});
