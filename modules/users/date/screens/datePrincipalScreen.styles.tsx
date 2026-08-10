import {StyleSheet} from 'react-native'


export const styles = StyleSheet.create({
  safeArea:{
    flex: 1,
    backgroundColor: '#FCFAF8',
  },
  eventCardsContainer: {
    flex: 1,
    minHeight: 0,
  },
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  monthNavigationButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F4F4F6",
  },
  monthSelectorText: {
    color: "#19191F",
    fontSize: 20,
    fontWeight: "700",
  },
  eventsScroll: {
    flex: 1,
  },
  contentEventCard: {
    gap: 10,
    paddingBottom: 20,
  },
  screen: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 16,
    paddingBottom: 70,
    gap: 5,
  },
  eventCardsTitleContainer:{
    flexDirection: 'row',
    gap: 15,
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  eventCardTitle:{
    fontSize: 15,
    fontWeight: '500',
    flexShrink: 1
  },
  dateContain:{
    alignItems: 'center',
    alignContent: 'center',
    gap: 2,
  },
  todayText:{
    fontSize: 17
  },
  dateText:{
    fontSize: 25
  },
  dayText:{
    fontSize: 14
  },
  eventSpace:{
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  eventText:{
    fontSize: 17
  },
  viewAllButton:{
    borderRadius: 12,
    padding: 5,
    borderColor: '#155721',
    backgroundColor: '#064936',
    borderWidth: 1
  },
  viewAllText:{
    color:'#ffffff'
  },
})
