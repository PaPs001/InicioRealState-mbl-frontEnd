import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  container: {
    width: '100%',
    maxWidth: 420,
    padding: 20,
    borderRadius: 18,
    backgroundColor: '#ffffff',
  },
  title: {
    color: '#12382f',
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    marginTop: 14,
    gap: 14,
  },
})
