import { fontScale as appFontScale, textSize, platformLineHeight } from '@/theme/typography'
import { StyleSheet } from "react-native";
import { generalColors } from "@/theme";

export const styles = StyleSheet.create({
propertyCard: {
    width: '100%',
    alignSelf: 'center',
    //minHeight: 150,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.22)',
    flexDirection: 'row',
    padding: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  propertyCardSelected: {
    borderColor: '#0c6740',
    borderWidth: 1,
  },
  imageWrap: {
    flex: 2.5,
    minWidth: 0,
    //width: 198,
    //minHeight: 140,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#ead4bc',
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.22)',
  },
  propertyImage: {
    ...StyleSheet.absoluteFill
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: '#ead4bc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationPill: {
    //position: 'absolute',
      //left: 5,
      //top: 7,
    height: 17,
    maxWidth: 105,
    borderRadius: 7,
    backgroundColor: '#f6efe3',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 5,
  },
  SolarPanelPill: {
    //position: 'absolute',
    //left: 5,
    //top: 30,
    height: 17,
    maxWidth: 100,
    borderRadius: 7,
    backgroundColor: '#f5f389',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 5,
    justifyContent: 'center'
  },
  mantenancePill: {
    //position: 'absolute',
    //left: 5,
    //top: 30,
    height: 17,
    maxWidth: 84,
    borderRadius: 7,
    backgroundColor: '#474747',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 5,
    justifyContent: 'center'
  },
  mantenancePillText: {
    flexShrink: 1,
    color: '#f6f3f3',
    fontSize: textSize.tiny,
    fontWeight: '600',
  },
  locationPillText: {
    flexShrink: 1,
    color: '#363636',
    fontSize: textSize.tiny,
    fontWeight: '600',
  },
  availablePill: {
    position: 'absolute',
    right: 8,
    top: 7,
    width: 57,
    height: 17,
    borderRadius: 7,
    backgroundColor: '#0c6740',
    alignItems: 'center',
    justifyContent: 'center',
  },
  availablePillText: {
    color: '#ffffff',
    fontSize: textSize.tiny,
    fontWeight: '600',
  },
  selectionPill: {
    position: 'absolute',
    left: 5,
    bottom: 7,
    minWidth: 74,
    height: 18,
    borderRadius: 7,
    borderWidth: 0.5,
    borderColor: '#0c6740',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  selectionPillActive: {
    backgroundColor: '#0c6740',
  },
  selectionPillText: {
    color: '#0c6740',
    fontSize: textSize.tiny,
    fontWeight: '600',
  },
  selectionPillTextActive: {
    color: '#ffffff',
  },
  propertyInfo: {
    flex: 2,
    minWidth: 0,
    paddingLeft: 12,
    paddingTop: 1,
    paddingRight: 4,
  },
  propertyTitle: {
    color: '#0c6740',
    fontSize: textSize.bodySmall,
    //lineHeight: platformLineHeight(16),
    fontWeight: 'bold',
    textDecorationStyle: "solid",
  },
  propertyCode: {
    color: '#929594',
    fontSize: 11,
    lineHeight: platformLineHeight(13),
    fontWeight: 'bold'
  },
  priceRow: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center'
  },
  price: {
    color: '#0c6740',
    fontSize: 17,
    lineHeight: platformLineHeight(18),
    fontWeight: 'bold',
  },
  priceMeta: {
    color: '#c59b55',
    fontSize: appFontScale[9.5],
    marginBottom: 1,
  },
  rawDataBlock: {
    marginTop: 3,
    gap: 1,
  },
  rawInfoText: {
    color: '#5f6462',
    fontSize: appFontScale[7],
    lineHeight: platformLineHeight(9),
  },
  rawInfoLabel: {
    color: '#0c6740',
    fontWeight: '700',
  },
  featuresRow: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#d8d0c5',
  },
  feature: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
  },
  featureValueRow: {
    height: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  featureValue: {
    flexShrink: 1,
    color: '#0c6740',
    fontSize: 11,
    fontWeight: '800',
  },
  featureLabel: {
    color: '#929594',
    fontSize: appFontScale[7],
  },
  featureDivider: {
    width: 0.5,
    height: 19,
    backgroundColor: '#d8d0c5',
  },
  amenitiesRow: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: '#d8d0c5',
  },
  amenity: {
    width: '30%',
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amenityText: {
    color: '#929594',
    fontSize: appFontScale[6],
    lineHeight: platformLineHeight(8),
    textAlign: 'center',
  },
  detailTagsRow: {
    marginTop: 4,
    flexDirection: 'row',
    gap: 9,
  },
  detailTag: {
    flex: 1,
    minWidth: 0,
    height: 17,
    borderRadius: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 5,
  },
  detailTagBlue: {
    backgroundColor: 'rgba(107,223,255,0.48)',
    borderWidth: 0.5,
    borderColor: '#6bdfff',
  },
  detailTagWarm: {
    backgroundColor: 'rgba(197,155,85,0.48)',
  },
  detailTagText: {
    flexShrink: 1,
    color: '#0c6740',
    fontSize: appFontScale[7],
  },
  detailTagTextWarm: {
    color: '#bd7600',
  },
  amenitiesSpace:{
    alignItems: 'center',
    flexDirection: 'row',
    gap:5,
    marginTop: 5
  },
  viewBlock:{
    backgroundColor: '#6bdfff85',
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    flex: 1
  },
  furnishedBlock:{
    backgroundColor: '#c59c55a6',
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 3,
    paddingVertical: 3,
    borderRadius: 10,
    flex: 1
  },
  viewText:{
    fontSize: appFontScale[6],
    color: generalColors.greenTitle,
    fontWeight: 'bold'
  },
  amenitieText:{
    fontSize: appFontScale[6],
    color: generalColors.greenTitle,
    fontWeight: 'bold',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 10
  },
  detailLink: {
    color: '#0c6740',
    fontSize: textSize.label,
    fontWeight: '500',
  },
  landPropertyCar:{
    marginTop: 100
  }    
})
