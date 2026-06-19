import { Text, View } from 'react-native'
import { CalendarDays, Flag, Home, MessageCircle, Users } from 'lucide-react-native'
import { styles } from './CoordinatorBottomNav.styles'
import type { ReactNode } from 'react'

export function CoordinatorBottomNav() {
  return (
    <View style={styles.bottomNav}>
      <NavItem icon={<Users size={24} color="#767676" />} label="Propiedades" />
      <NavItem icon={<CalendarDays size={25} color="#767676" />} label="Citas" />
      <View style={styles.navItemActive}>
        <View style={styles.navActiveScoop} />
        <View style={styles.navActiveButton}>
          <Home size={27} color="#c59b55" />
        </View>
      </View>
      <NavItem icon={<Flag size={24} color="#767676" />} label="Seguimiento" />
      <View style={styles.navItem}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>77</Text>
        </View>
        <MessageCircle size={24} color="#767676" />
        <Text style={styles.navLabel} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.82}>
          Chats
        </Text>
      </View>
    </View>
  )
}

function NavItem({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <View style={styles.navItem}>
      {icon}
      <Text style={styles.navLabel} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.82}>
        {label}
      </Text>
    </View>
  )
}
