import{
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  ImageBackground,
  FlatList
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {styles} from './styles/selectedProperty.styles'
import { icons } from '@/assets'

// Esto es solo mockData para pruebas rapidas aun no implementamos lo real solo es para diseño putita///

import { mockProperty } from '../temporalMock'

//Componentes a usar//

import { ImagesRoulette } from '../components/selectedProperties/imagesRoulette'
import { AmenitiesButton } from '../components/selectedProperties/AmenitiesButton'
import { CardInformation } from '../components/selectedProperties/CardInformation'

export const PropertiesList = () => {
  const listAmenities = [{
    
  }]

  return(
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* ruleta de imagenes */}
        <ImagesRoulette/>
        <View>
          <View>
            <icons.BriefcaseBussines/>
            <Text>Renta por INICIO Real Estate</Text>
            <icons.Bathroom/>
          </View>
          <View>
            <Text>Departamento de 3 recamaras en aracuna residencial</Text>
            <icons.BackButton/>
            <Text>Mezcales, Bahia de Banderas</Text>
            <View>
              <icons.ArrowLeft/>
              <Text>Vista de alberca</Text>
            </View>
          </View>
          <View>
            <View>
              <View>
                <Text>3</Text>
                <Text>Recamaras</Text>
              </View>
              <View>
                <Text>2</Text>
                <Text>Baños</Text>
              </View>
              <View>
                <Text>2</Text>
                <Text>Parking</Text>
              </View>
              <View>
                <icons.BackButton/>
                <Text>Amueblado, A/C, Equipado</Text>
              </View>
            </View>
          </View>
          <View>
            <Text>Detalles de la propiedad</Text>
            <Text>Este moderno departamento se encuentra en el desarrollo Aracuna , una comunidad residencial con acceso controlado, alberca, áreas verdes y un enntorno familiar seguro. Cuenta con espacios amplios, excelente iluminacion natural y acabados de calidad, ideal para una estancia cómada a largo plazo, esta ubicado en el 3 pisó, con una vista directa a amenidades y una terraza muy amplia.</Text>
          </View>
        </View>
        <View/>
        <View>
          <Text>Amenidades</Text>
          <View>
            {/* aqui se encontraran los bloques de amenidades */}
          </View>
        </View>
        <View/>
        <View>
          <Text>Donde vas a vivir</Text>
          <View>
            {/* aqui se encontraran los bloques de fotos de cada habitacion */}
          </View>
        </View>
        <View>
          <Text>Dónde vas a estar</Text>
          <View>
            {/* aqui estara el mapa*/}
            <View>
              <icons.BackButton/>
              <Text>La ubicacion exacta se comparte al confirmar la visita</Text>
            </View>
          </View>
        </View>
        <View>
          <Text>Cerca de aqui</Text>
          <View>
            {/* aqui estaran las ubicaciones cercanas */}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
} 
