import { Platform, StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 24, 21, 0.52)',
  },

  backdropPressArea: {
    ...StyleSheet.absoluteFillObject,
  },

  overlayCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  overlayBottom: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 0,
  },

  keyboardAvoidingView: {
    flex: 1,
    width: '100%',
    maxHeight: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  container: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: '#fffdf9',

    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: {
          width: 0,
          height: 8,
        },
        shadowOpacity: 0.18,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
    }),
  },

  containerSmall: {
    maxWidth: 380,
    maxHeight: '70%',
  },

  containerMedium: {
    maxWidth: 440,
    maxHeight: '82%',
  },

  containerLarge: {
    maxWidth: 560,
    maxHeight: '92%',
  },

  containerFullscreen: {
    maxWidth: 720,
    height: '100%',
    maxHeight: '100%',
    borderRadius: 0,
  },

  bottomContainer: {
    maxWidth: 620,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },

  header: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e4ded5',
    backgroundColor: '#fffdf9',
  },

  headerSide: {
    width: 38,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  headerRight: {
    alignItems: 'flex-end',
  },

  headerAction: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f2ede5',
  },

  headerCopy: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },

  title: {
    color: '#193a31',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },

  subtitle: {
    marginTop: 3,
    color: '#697b74',
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },

  scrollView: {
    flexGrow: 0,
    flexShrink: 1,
  },
  scrollWrapper: {
    flexShrink: 1,
  },

  content: { 
    flexShrink: 1, 
    minHeight: 0, 
    padding: 18, 
    gap: 14, 
  },

  scrollContent: {
    //flexGrow: 1,
  },

  footer: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e4ded5',
    backgroundColor: '#fffdf9',
  },

  
})
