import { StyleSheet } from 'react-native'

const GREEN = '#004b36'
export const TIME_ROW_HEIGHT = 60

export const timeSelectorStyles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
    paddingTop: 20,
    paddingBottom: 12,
    gap: 18,
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clock: { flex: 1, minWidth: 0 },
  labels: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
  },
  label: {
    flex: 1,
    textAlign: 'center',
    color: GREEN,
    fontSize: 15,
    fontWeight: '700',
  },
  separatorSpace: { width: 20 },
  wheels: {
    flexDirection: 'row',
    height: TIME_ROW_HEIGHT * 3,
    alignItems: 'center',
  },
  selection: {
    position: 'absolute',
    top: TIME_ROW_HEIGHT,
    left: 0,
    right: 0,
    height: TIME_ROW_HEIGHT,
    borderRadius: 18,
    backgroundColor: '#e2ecdf',
  },
  viewport: {
    flex: 1,
    height: TIME_ROW_HEIGHT * 3,
    overflow: 'hidden',
  },
  wheelContent: {
    paddingVertical: TIME_ROW_HEIGHT,
  },
  wheelRow: {
    height: TIME_ROW_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  number: {
    width: '100%',
    textAlign: 'center',
    fontSize: 30,
    lineHeight: TIME_ROW_HEIGHT,
    fontWeight: '800',
    color: GREEN,
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
    opacity: 0.35,
  },
  numberSelected: {
    fontSize: 52,
    opacity: 1,
  },
  separatorContainer: {
    width: 20,
    height: TIME_ROW_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    color: GREEN,
    fontSize: 42,
    fontWeight: '700',
    includeFontPadding: false,
  },
  periods: {
    width: '24%',
    maxWidth: 108,
    marginTop: 30,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#efeeec',
  },
  periodButton: {
    minHeight: 78,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  periodSelected: { backgroundColor: GREEN },
  periodText: { fontSize: 26, fontWeight: '800', color: GREEN },
  periodTextSelected: { color: '#ffffff' },
  disabled: { opacity: 0.35 },
  summary: {
    textAlign: 'center',
    color: '#3d5a40',
    fontSize: 16,
    fontWeight: '700',
  },
})
