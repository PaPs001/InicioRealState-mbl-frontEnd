import { colors } from "@/lib/theme";
import { generalColors, textColor } from "@/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea:{
    flex: 1,
    backgroundColor: generalColors.background
  },
  container: {
    
  },
  logoContainer:{
    alignItems: 'center',
    alignContent: 'center',
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
  },
  rowBlock:{
    gap: 8,
  },  
  headerInformationContainer:{
    gap: 20,
    flexDirection: 'row',  
    flex: 1,
  },
  profileAvatarContainer:{
    width: 120,
    height: 120,
    borderRadius: 999
  },
  imageLead:{
    width: '100%',
    height: '100%'
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
    fontStyle: 'italic',
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


  leadDetailScroll:{
    flex: 1,
  },
  leadDetailContent: {
    paddingTop: 14,
    paddingBottom: 19,
  },
  profileCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d8d1c8',
    backgroundColor: '#ffffff',
    padding: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 84,
  },
  profileAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#0c6740',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: {
    color: '#ffffff',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
  },
  profileCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 14,
  },
  profileName: {
    color: '#111111',
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
  },
  profileProperty: {
    marginTop: 2,
    color: '#b58526',
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '600',
  },
  statusBadgeStack: {
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 7,
  },
  stageBadge: {
    alignSelf: 'flex-start',
    minHeight: 24,
    borderRadius: 12,
    backgroundColor: '#f1eadf',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    marginTop: 7,
  },
  stageDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#3d5a40',
  },
  advisorStageBadge: {
    backgroundColor: '#fff9eb',
    borderWidth: 1,
    borderColor: '#e8c986',
  },
  advisorStageDot: {
    backgroundColor: '#c78d1c',
  },
  advisorStageText: {
    color: '#8a5d13',
  },
  stageText: {
    color: '#3d5a40',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
  },
  sourceRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
    marginLeft: 86,
  },
  infoGrid: {
    borderTopWidth: 0.5,
    borderTopColor: '#ded5c8',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  detailSection: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d8d1c8',
    backgroundColor: '#ffffff',
    padding: 10,
    marginTop: 12,
  },
  detailSectionTitle: {
    color: '#19191f',
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
    marginBottom: 8,
  },
  customStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 8,
  },
  customStatusSubtitle: {
    flexShrink: 1,
    color: '#0c6740',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
  },
  statusChipList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  customStatusChip: {
    maxWidth: '100%',
    minHeight: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#d8d1c8',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 11,
  },
  customStatusChipActive: {
    borderColor: '#064b38',
    backgroundColor: '#064b38',
  },
  customStatusChipText: {
    color: '#19191f',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
  },
  customStatusChipTextActive: {
    color: '#ffffff',
  },
  customStatusEmpty: {
    color: '#717171',
    fontSize: 12,
    lineHeight: 16,
  },
  customStatusForm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  customStatusInput: {
    flex: 1,
    minWidth: 0,
    minHeight: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d8d1c8',
    backgroundColor: '#ffffff',
    color: '#19191f',
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  customStatusButton: {
    minWidth: 82,
    minHeight: 38,
    borderRadius: 19,
    backgroundColor: '#064b38',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  customStatusButtonDisabled: {
    backgroundColor: '#9a9084',
  },
  customStatusButtonText: {
    color: '#ffffff',
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '800',
  },
  customStatusError: {
    marginTop: 7,
    color: '#a13b2f',
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
  },
  nextActionCard: {
    minHeight: 62,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d0dca8',
    backgroundColor: '#fbfcf5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  nextActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#064b38',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextActionCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 11,
  },
  nextActionTitle: {
    color: '#19191f',
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '700',
  },
  nextActionMeta: {
    color: '#c78d1c',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
  },
  nextActionAdvisor: {
    color: '#717171',
    fontSize: 10,
    lineHeight: 13,
  },
  nextActionForm: {
    gap: 8,
    marginTop: 10,
  },
  nextActionInput: {
    minHeight: 39,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d8d1c8',
    backgroundColor: '#ffffff',
    color: '#19191f',
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  nextActionSaveButton: {
    minHeight: 39,
    borderRadius: 20,
    backgroundColor: '#064b38',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  nextActionSaveButtonDisabled: {
    backgroundColor: '#9a9084',
  },
  nextActionSaveButtonText: {
    color: '#ffffff',
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '800',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  aiSection: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d8d1c8',
    backgroundColor: '#ffffff',
    padding: 10,
    marginTop: 12,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  aiTitle: {
    color: '#19191f',
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
  },
  emptyFollowState: {
    minHeight: 240,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  historySection: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d8d1c8',
    backgroundColor: '#ffffff',
    padding: 10,
    marginTop: 12,
  },
  emptyStateText: {
    color: '#717171',
    fontSize: 13,
    lineHeight: 25,
    textAlign: 'center',
  },

  detailBottomActions: {
    flexDirection: 'row',
    gap: 6,
  },
  secondaryDetailButton: {
    flex: 1.12,
    minWidth: 0,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#064b38',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  secondaryDetailButtonText: {
    color: '#19191f',
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '700',
  },

  aiDetailButton: {
    flex: 0.7,
    minWidth: 0,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#d8b57d',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 8,
  },
  aiDetailButtonText: {
    color: '#19191f',
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '700',
  },
  primaryDetailButton: {
    flex: 1.22,
    minWidth: 0,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#064b38',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  primaryDetailButtonText: {
    color: '#ffffff',
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '700',
  },

  screenHeader: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f3eee6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenHeaderCopy: {
    flex: 1,
    minWidth: 0,
  },

  



  infoPill: {
    maxWidth: 120,
    minHeight: 22,
    borderRadius: 11,
    backgroundColor: '#f8f2ee',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 9,
  },
  infoPillText: {
    color: '#19191f',
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '600',
  },



  detailMetric: {
    width: '50%',
    minHeight: 34,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ded5c8',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  detailMetricWide: {
    width: '100%',
    borderBottomWidth: 0,
  },
  detailMetricText: {
    flex: 1,
    minWidth: 0,
    color: '#19191f',
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
  },

  quickActionButton: {
    flex: 1,
    minWidth: 0,
    height: 62,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ded5c8',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  quickActionText: {
    color: '#19191f',
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
})
