import { StyleSheet, Text, View } from 'react-native'
import { CalendarDays, Home, MessageCircle, Target } from 'lucide-react-native'

type AdviserBottomNavProps = {
  activeBadge: number
}

export function AdviserBottomNav({ activeBadge }: AdviserBottomNavProps) {
  return (
    <View style={styles.bottomNav}>
      <View style={styles.navItem}>
        <Home size={24} color="#6c6c6c" />
        <Text style={styles.navLabel}>Propiedades</Text>
      </View>
      <View style={styles.navItem}>
        <CalendarDays size={25} color="#6c6c6c" />
        <Text style={styles.navLabel}>Citas</Text>
      </View>
      <View style={styles.navCenter}>
        <Text style={styles.navCenterText}>I</Text>
      </View>
      <View style={styles.navItem}>
        <Target size={24} color="#6c6c6c" />
        <Text style={styles.navLabel}>Seguimiento</Text>
      </View>
      <View style={styles.navItem}>
        <MessageCircle size={24} color="#6c6c6c" />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{activeBadge}</Text>
        </View>
        <Text style={styles.navLabel}>Chats</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 66,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 56,
  },
  navCenter: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4d5c2',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
  },
  navCenterText: {
    color: '#b98947',
    fontSize: 32,
    fontFamily: 'serif',
  },
  navLabel: {
    color: '#6c6c6c',
    fontSize: 8,
    marginTop: 2,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: 4,
    minWidth: 18,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#11b900',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '800',
  },
})
