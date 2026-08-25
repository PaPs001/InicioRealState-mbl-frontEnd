import { generalColors } from '@/theme'
import {StyleSheet} from 'react-native'


export const styles = StyleSheet.create({
  safeArea:{
    flex: 1,
    backgroundColor: generalColors.background,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 12,
  },
  eventCardsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#FCFAF8',
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    borderColor: generalColors.border,
    borderWidth: 1,
    paddingHorizontal: 10,
    overflow: 'hidden',
    zIndex: 1,
  },
  dragIndicator: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#9A9A9A',
  },
  dragHandle: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventsContent: {
    flex: 1,
    minHeight: 0,
    paddingTop: 8,
  },
  eventsScroll: {
    flex: 1,
  },
  contentEventCard: {
    gap: 18,
    paddingBottom: 20,
    paddingTop: 5,
  },
  appointmentGroup: {
    gap: 8,
  },
  appointmentGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  appointmentGroupDate: {
    color: '#474747',
    fontSize: 14,
    fontWeight: '600',
  },
  appointmentGroupLine: {
    flex: 1,
    height: 1,
    backgroundColor: generalColors.border,
  },
  appointmentGroupCards: {
    gap: 10,
  },
  screen: {
    flex: 1,
    position: 'relative',
    paddingHorizontal: 10,
    paddingTop: 42,
    paddingBottom: 70,
    gap: 5,
  },
  eventCardsTitleContainer:{
    flexDirection: 'row',
    gap: 8,
    alignContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  eventCardTitle:{
    fontSize: 15,
    fontWeight: '500',
    flexShrink: 1
  },
  dateContain:{
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  todayText:{
    fontSize: 17
  },
  dateText:{
    fontSize: 17
  },
  dayText:{
    fontSize: 15
  },
  eventSpace:{
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventText:{
    fontSize: 18
  },
  datesContainer:{
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },

  line:{
    borderWidth: .5,
    flex: 1,

  }
})
