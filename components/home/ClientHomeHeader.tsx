import { Text, TouchableOpacity, View } from 'react-native'

import { Bell } from 'lucide-react-native'

type ClientHomeHeaderProps = {
  dynamicStyles: any
  firstName?: string
  onNotificationsPress: () => void
  styles: any
  subGreeting: string
  theme: any
}

export function ClientHomeHeader({
  dynamicStyles,
  firstName,
  onNotificationsPress,
  styles,
  subGreeting,
  theme,
}: ClientHomeHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={dynamicStyles.greeting}>Hola, {firstName}</Text>
        <Text style={dynamicStyles.subGreeting}>{subGreeting}</Text>
      </View>
      <TouchableOpacity style={dynamicStyles.notificationButton} onPress={onNotificationsPress}>
        <Bell size={24} color={theme.text} />
      </TouchableOpacity>
    </View>
  )
}
