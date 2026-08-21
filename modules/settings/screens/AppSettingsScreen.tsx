import {
  ScrollView, 
  Text, 
  View, 
  Pressable, 
  Alert 
} from 'react-native'
import { router } from 'expo-router'
import { usePathname } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { HeaderInfo } from '../components/HeaderInfo'
import { CalendarSection } from '../components/CalendarSection'
import { useAppSettings } from '../hooks'
import { useGoogleCalendarSettings } from '../hooks/useGoogleCalendarSettings'
import { UserDashboardScreenProps } from '../types'
import {
  dashboardAreaConfig,
  operationOptions
} from '../constants'
import { 
  icons,
  logos
} from '@/assets'
import { useState } from 'react'
import {useSessionDomain} from "@/contexts/auth/use-session-domain"
import {
  ProfileImageModal,
  useProfileAvatar,
  useProfileImageUpload,
} from '@/modules/profile'
import {
  getInitials,
} from "@/components/userDashboard/dashboard-formatters"
import {styles} from './AppSettingsScreen.style'
import { useHideBottomNav } from '@/lib/navigation/bottom-nav-visibility'

export function AppSettingsScreen(
  { area }: UserDashboardScreenProps
) {
  useHideBottomNav();

  const {
    authToken,
    currentUser,
    logout,
  } = useSessionDomain();
  const pathname = usePathname();
  const googleCalendar = useGoogleCalendarSettings({ authToken, returnPath: pathname })
  const { profileAvatarUri, setProfileAvatarUri } = useProfileAvatar()
  const profileImageUpload = useProfileImageUpload({ setProfileAvatarUri })
  const areaConfig = dashboardAreaConfig[area];
  const advisorName = 
  currentUser?.name.trim() || 
  currentUser?.email?.split("@")[0] ||
  areaConfig.fallbackName;
  const advisorInitials = getInitials(advisorName);
  
  const {
    operationMode,
    setOperationMode,
  } = useAppSettings()


  const handleLogOut = () => Alert.alert("Cerrar sesion", "¿Seguro que deseas cerrar la sesion", [
    {text: "Cancelar", style: "cancel"},
    {
      text: "Cerrar sesion",
      style: "destructive",
      onPress: async() => {
        await logout();
        router.replace("/login/login");
      },
    },
  ]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Pressable
            style={styles.backButton}
            onPress={router.back}
          >
            <icons.BackButton/>
          </Pressable>
          <View style={styles.headerLogo}>
            <logos.irsPrincipal width={146} height={48}/>
          </View>
        </View>
        <HeaderInfo
          profileAvatarUri={profileAvatarUri}
          advisorInitials={advisorInitials}
          advisorName={advisorName}
          operationOptions={operationOptions}
          operationMode={operationMode}
          onSelectOperationMode={setOperationMode}
          onAddAgentPresentation={() => profileImageUpload.open('agentpresentation')}
          hasAgentPresentation={Boolean(
            currentUser?.agentpresentation ?? currentUser?.agentPresentation,
          )}
          onChangeProfilePhoto={() => profileImageUpload.open('profile')}
        />
        <CalendarSection
          onAssignCalendarTypes={googleCalendar.assignCalendarType}
          googleCalendars={googleCalendar.calendars}
          selectedGoogleCalendars={googleCalendar.selectedCalendars}
          isCalendarSettingsLoading={googleCalendar.isLoading}
          isSavingCalendarSelection={googleCalendar.isSaving}
          isGoogleConnected={googleCalendar.isConnected}
          needsGoogleReconnect={googleCalendar.needsReconnect}
          isConnectingCalendar={googleCalendar.isConnecting}
          isDisconnectingCalendar={googleCalendar.isDisconnecting}
          onReloadCalendars={googleCalendar.reload}
          onToggleCalendar={googleCalendar.toggleCalendar}
          onSaveCalendarSelection={googleCalendar.saveSelection}
          onConnectCalendar={googleCalendar.connect}
          onDisconnectCalendar={googleCalendar.disconnect}
        />
        <View style={styles.finalSection}>
          <Pressable
            style={styles.logOutButton}
            onPress={handleLogOut}
          >
            <icons.Power/>
            <Text style={styles.logOutText}>
              Cerrar Sesion
            </Text>
          </Pressable>
        </View>
      </ScrollView>
      <ProfileImageModal
        visible={profileImageUpload.isOpen}
        title={profileImageUpload.title}
        imageUri={profileImageUpload.selectedImage?.uri}
        error={profileImageUpload.error}
        isSaving={profileImageUpload.isSaving}
        onSelectImage={profileImageUpload.pickImage}
        onSave={profileImageUpload.save}
        onClose={profileImageUpload.close}
      />
    </SafeAreaView>
  )
}

export default AppSettingsScreen
