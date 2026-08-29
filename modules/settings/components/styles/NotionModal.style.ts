import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#d1d8d5',
    borderRadius: 8,
    color: '#1e2d32',
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  error: {
    color: '#b42318',
    fontSize: 13,
    marginTop: 10,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    alignItems: 'center',
    borderColor: '#d1d8d5',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: '#526064',
    fontWeight: '600',
  },
  acceptButton: {
    alignItems: 'center',
    backgroundColor: '#3d5a40',
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  acceptButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.5,
  },
})