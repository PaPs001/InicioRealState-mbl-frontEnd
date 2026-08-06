import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  preview: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    borderRadius: 75,
  },
  instructions: { color: '#6b6b6b' },
  error: { color: '#b42318' },
  secondaryButton: {
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#315b41',
    borderRadius: 10,
  },
  secondaryButtonText: { color: '#315b41', fontWeight: '700' },
  primaryButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#315b41',
  },
  disabledButton: { opacity: 0.6 },
  primaryButtonText: { color: '#ffffff', fontWeight: '700' },
  cancelButton: { alignItems: 'center', padding: 8 },
  cancelButtonText: { color: '#6b6b6b' },
})
