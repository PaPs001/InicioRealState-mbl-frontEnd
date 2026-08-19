import { colors } from "@/lib/theme";
import { generalColors, textColor, userColors } from "@/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea:{
    flex: 1,
    backgroundColor: generalColors.background
  },
  container: {
    flex: 1,
  },
  contentContainer:{
    gap: 17,
    paddingHorizontal: 11,
  },
  logoContainer:{
    position: 'relative',
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
  },
  headerContainer:{

  },
  title:{
    fontSize: 22,
    lineHeight: 25,
    fontWeight: '700'
  },
  subtitle: {
    color: '#717171',
    fontSize: 13,
    lineHeight: 18,
  },
  detailScreen:{
    flex: 1
  },
  informationContainer:{
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4D3D3',
    paddingHorizontal: 9,
    paddingVertical: 12,
    gap: 12,

    shadowColor: '#0000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 9,
    elevation: 5
  },
  rowBlock:{
    gap: 8,
  },  
  headerInformationContainer:{
    gap: 8,
    flexDirection: 'row',  
    flex: 1,
  },
  profileAvatarContainer:{
    width: 100,
    height: 100,
    borderRadius: 999,
    alignContent:'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e5e7eb'
  },
  imageLead:{
    width: '100%',
    height: '100%'
  },
  avatarText:{
    fontSize: 22,

  },
  dataLeadContainer:{
    gap: 3
  },
  nameLead:{
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 22,
  },
  placeLead:{
    fontSize: 15,
    fontWeight: '600',
    color: textColor.accentGolden,
    //fontStyle: 'italic',
  },
  statusBar:{
    flexDirection: 'row',
    borderRadius: 12,
    borderColor: '#BDBDBD',
    borderWidth: .5,
    backgroundColor: '#EDF1E0',
    alignContent: 'center',
    alignItems:'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 4,
    width: 120
  },
  statusDot:{
    borderRadius: 99,
    width: 12,
    height: 12,
    backgroundColor: '#454A36'
  },
  statusText:{
    fontSize: 10
  },

  typeLeadContainer:{
    flexDirection: 'row',
    gap: 12,
  },
  typeLead:{
    flexDirection: 'row',
    gap: 4,
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceText:{
    fontSize: 10,

  },
  /// estilos de primer bloque
  tableInformation:{
    paddingHorizontal: 7,
    flexDirection: 'row',
  },
  lineInformation:{
    flex: 1,
    borderTopWidth: .5,
    borderLeftWidth: .5,
  },

  lineInformationNoBor: {
    borderLeftWidth: 0,
    borderTopWidth: .5
  },
  lineInformationInterior:{
    borderBottomWidth: .5,
    minHeight: 35,
    justifyContent: 'center',
    paddingHorizontal: 12 
  },
  lineInformationInteriorLast:{
    minHeight: 35,
    justifyContent: 'center',
    paddingHorizontal: 12
  },
  lineInformationEdge:{
    borderTopWidth: .5,
    borderLeftWidth: .5,
  },
  informationText:{
    fontSize: 9
  },
  informationTextRight:{
    textAlign: 'right'
  },

  // estilos bloque 2
  nextActionButton:{
    borderWidth: 1,
    borderColor: '#CED8A8',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 15,
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#F6F7F2'
  },
  iconCircle:{
    borderRadius: 999,
    backgroundColor: userColors.adviser.primaryDark,
    width: 60,
    height: 60,
    alignContent:'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTextContainer:{
    flex:1,
    minWidth: 0,
    overflow: 'hidden',
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  actionTitle:{
    fontSize: 17,
    lineHeight: 19,
    fontWeight: '700'
  },
  actionDateText:{
    fontSize: 12,
    lineHeight: 14,
    color: textColor.accentGolden,
    fontWeight: '600'
  },
  actionAdvisorText:{
    fontSize: 9,
    lineHeight: 12,
    color: textColor.softText
  },

  optionButton:{
    minWidth: 100,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4D3D3',
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignContent:'center',
    alignItems: 'center',
    gap: 3,
  },
  optionText:{
    fontSize: 10,
    lineHeight: 17,
    textAlign: 'center'
  },
  contentButtons:{
    gap: 6
  },
  headerIAInformation:{
    flexDirection: 'row',
    gap: 10,
    alignContent: 'center',
    alignItems: 'center',
  },


  iaRecommendationsContainer:{
    borderWidth: 1,
    borderColor: '#D7D7D7',
    borderRadius: 12,
    //paddingVertical: 9,
    //paddingHorizontal: 12,
    marginHorizontal: 15,
    overflow: 'hidden'
  },
  recommendationBlock:{
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,

    minHeight: 82,
    paddingVertical: 10,
    paddingHorizontal: 12,

    borderBottomWidth: 1,
    borderBottomColor: '#D7D7D7',
  },
  recommendationBlockLast:{
    borderBottomWidth: 0,
  },
  iaAnnotation:{
    flexDirection: 'row',
    gap: 7,
    alignContent:'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#FDF4E9',
    width: '100%',
    paddingVertical: 9,
    paddingHorizontal: 14
  },
  iaAnnotationText:{
    fontSize: 11,
    flexShrink: 1,

  },
  recommendationTextContainer:{
    flex: 1,
    minWidth: 0
  },
  recommendationTitle:{
    fontSize: 14,
    flexShrink: 1,
  },
  recommendationSubtitle:{
    fontSize: 12,
    flexShrink: 1
  },




  //para texxtos y pantallas de error
  invalidInformationContainer:{
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',

  },
  invalidInformationText:{
    fontSize: 17
  },


  ///

  timelineItem:{
    flexDirection: 'row',
    alignItems: 'stretch',
  },

  timelineRail: {
    width: 42,
    alignItems: 'center',
    alignSelf: 'stretch',
  },

  timelineDot: {
    width: 18,
    height: 18,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fefc',
    zIndex: 2,
    borderColor: '#0f0f0f',
    borderWidth: 1
  },

  timelineLine: {
    flex: 1,
    width: 1,
    backgroundColor: '#BDBDBD',

    marginBottom: -13,
  },
  timelineContent:{
    flex: 1,
    minWidth: 0,
    paddingBottom: 14,
  },
  timelineHeader:{
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  timelineHeaderLeft:{
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0
  },
  timelineDate:{
    fontSize: 11,
    fontWeight: '600',
    flexShrink: 1,
  },
  timelineType:{
    fontSize: 11,
    fontWeight: '600',
    flexShrink: 1,
  },
  timelineTime: {
    fontSize: 10,
  },
  timelineDescription:{
    marginTop: 3,
    fontSize: 11,
    lineHeight: 15,
    flexShrink: 1
  },
  attachmentList: {
    gap: 8,
    paddingTop: 8,
    paddingRight: 8,
  },



  bottomButtons:{
    flexDirection: 'row',
    paddingVertical: 9,
    paddingHorizontal: 9,
    gap: 4,
    borderRadius: 76,
    borderColor: '#B9A075',
    borderWidth: 1,
    marginBottom: 12
  },
  followingButton:{
    flex:1,
    borderColor: '#01302A',
    borderWidth: 1,
    borderRadius: 15,
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12  
  },
  iaButton:{
    //flex: 1,
    borderColor: '#DB9A28',
    borderWidth: 1,
    borderRadius: 15,
    flexDirection: 'row',
    paddingVertical: 9,
    paddingHorizontal: 12,
    gap: 5
  },
  seeFollowingsButton:{
    flex: 1,
    borderColor: '#417770',
    backgroundColor: '#003129',
    borderWidth: 1,
    borderRadius: 15,
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12  
  },
  buttonText:{
    fontSize: 10,
    lineHeight: 17,
  },
  whiteColor: {
    color: '#dbdbdb'
  },



  noActionContainer:{
    justifyContent: 'center',
    alignItems: 'center',
  },
})
