import {
  View, 
  Pressable, 
  Text,
  ScrollView
} 
from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { logos } from '@/assets'
import { useOperationMode, useDashboardAreaConfig } from '@/modules/settings'
import { formatCurrentDashboardDate } from '@/components/userDashboard/dashboard-formatters'
import { useRouter } from 'expo-router'

export const AdvisorScreen = () => {
  const { operationMode } = useOperationMode()
  const areaConfig = useDashboardAreaConfig('adviser')
  const router = useRouter()
  
  return(
    <SafeAreaView>
      <ScrollView>
        <View>
          <logos.irsPrincipal width={146} height={48}/>
        </View>
        <View>
          <Text>
            {operationMode === 'rent' ? 'Asesor de renta' 
            : operationMode === 'sale' ? 'Asesor de venta' 
            : operationMode === 'both' ? 'Asesor Mixto' : null}
          </Text>
          <View>
            <Text>{formatCurrentDashboardDate()}</Text>  
          </View>
        </View>
        <View>
          <View>
            <Pressable onPress={() => router.push(`${areaConfig.basePath}/settings` as never)}>
              <Text>Ir a configuración</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
