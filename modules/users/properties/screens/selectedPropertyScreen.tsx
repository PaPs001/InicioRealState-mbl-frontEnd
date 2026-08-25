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
import { icons, logos } from '@/assets'
import { capitalizeFirstLetter } from '@/components/userDashboard/dashboard-formatters'
import { RoomsRow } from '../components/selectedProperties/RoomsRow'
import { NearPlaces } from '../components/selectedProperties/NearPlaces'
import { PriceCard } from '../components/PriceCard'
// Esto es solo mockData para pruebas rapidas aun no implementamos lo real solo es para diseño putita///

import { mockProperty } from '../temporalMock'
import { BlurView } from 'expo-blur' 
//Componentes a usar//

import { ImagesRoulette } from '../components/selectedProperties/ImagesRoulette'
import { Amenities } from '../components/selectedProperties/AmenitiesButton'
import { CardInformation } from '../components/selectedProperties/CardInformation'
import { GalleryImages } from '../components/selectedProperties/GalleryImages'
import { router } from 'expo-router'
import { useState } from 'react'

export const PropertiesList = () => {

  function getOperationInfo(operation: string) {
    if (operation.toLowerCase() === 'venta') {
      return {
        label: 'Venta por INICIO Real Estate',
      }
    }

    return {
      label: 'Renta por INICIO Real Estate',
    }
  }

  const operationInfo = getOperationInfo(mockProperty.operation)
  const [seeGalleryImage, setSeeGalleryImages] = useState(false)

  return(
    <View style={styles.safeArea}>
      {seeGalleryImage ? (
        <GalleryImages
          images={mockProperty.images}
          onClose={() => setSeeGalleryImages(false)}
          onFavorite={() => console.log("favorito")}
          onShare={() => console.log('Compartir')}
        />
      ): (
        <>
          <ScrollView>
            <ImagesRoulette
              onBack={() => router.back()}
              onFavorite={() => console.log("favorito")}
              onShare={() => console.log('Compartir')}
              onOpenGallery={() => setSeeGalleryImages(true)}
              images={mockProperty.images}
              status={mockProperty.status}
            />
            <View style={styles.container}>
                <View style={styles.operationContainer}>
                  <View style={styles.operationIcon}>
                    <logos.irsBlanco width={25} height={25}/>
                  </View>
                  <Text
                    adjustsFontSizeToFit
                    numberOfLines={1}
                    style={styles.operationText}
                  >
                    {operationInfo.label}
                  </Text>
                  <icons.SealChek height={25} width={25}/>
                </View>
                <View style={styles.propertyInformation}>
                  <Text style={styles.propertyTitle}>
                    {capitalizeFirstLetter(mockProperty.title)}
                  </Text>
                  <View style={styles.propertyAddressView}>
                    <View style={styles.propertyAddress}>
                      <icons.Place height={20} width={20}/>
                      <Text
                        style={styles.addressText}
                        adjustsFontSizeToFit
                        numberOfLines={1}
                      >
                        {mockProperty.address}
                      </Text>
                    </View>
                    <View style={styles.propertyView}>
                      <mockProperty.view.icon/>
                      <Text 
                        style={styles.viewText}
                        adjustsFontSizeToFit
                        numberOfLines={1}
                      >
                        {mockProperty.view.label}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.propertyFeaturesContainer}>
                    <View style={styles.propertyMetricContainer}>
                      <View style={styles.propertyMetricHead}>
                        <icons.Bed width={25} height={25}/>
                        <Text
                          adjustsFontSizeToFit
                          numberOfLines={1}
                          style={styles.metricNumber}
                        >
                          {mockProperty.bedrooms}
                        </Text>
                      </View>
                      <Text
                        style={styles.metricText}
                        adjustsFontSizeToFit
                        numberOfLines={1}
                      >
                        Recamaras
                      </Text>
                    </View>
                    <View style={styles.propertyMetricContainer}>
                      <View style={styles.propertyMetricHead}>
                        <icons.Bathroom width={25} height={25}/>
                        <Text
                          adjustsFontSizeToFit
                          numberOfLines={1}
                          style={styles.metricNumber}
                        >
                          {mockProperty.bathrooms}
                        </Text>
                      </View>
                      <Text
                        style={styles.metricText}
                        adjustsFontSizeToFit
                        numberOfLines={1}
                      >
                        Baños  
                      </Text>
                    </View>
                    <View style={styles.propertyMetricContainer}>
                      <View style={styles.propertyMetricHead}>
                        <icons.Car width={25} height={25}/>
                        <Text
                          adjustsFontSizeToFit
                          numberOfLines={1}
                          style={styles.metricNumber}
                        >
                          {mockProperty.parking}
                        </Text>
                      </View>
                      <Text
                        style={styles.metricText}
                        adjustsFontSizeToFit
                        numberOfLines={1}
                      >
                        Parkings
                      </Text>
                    </View>
                    <View style={styles.moreFeaturesContainer}>
                      <mockProperty.moreInformation.icon/>
                      <Text
                        style={styles.moreFeaturesText}
                      >
                        {mockProperty.moreInformation.label}
                      </Text>
                    </View>
                </View>
                <View style={styles.detailsContainer}>
                  <Text
                    style={styles.detailsTitle}
                  >
                    Detalles de la propiedad
                  </Text>
                  <Text
                    style={styles.detailsInformation}
                  >
                    {mockProperty.description}
                  </Text>
                </View>
              <View/>
              <View style={styles.sectionContainer}>
                <Text
                  style={styles.sectionTitle}
                >
                  Amenidades
                </Text>
                <Amenities
                  amenitiesData={mockProperty.propertyAmenities}
                />
              </View>
              <View/>
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Donde vas a vivir</Text>
                <View>
                  <RoomsRow
                    roomsData={mockProperty.rooms}
                  />
                </View>
              </View>
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Dónde vas a estar</Text>
                <View>
                  {/* aqui estara el mapa*/}
                  <View>
                    <icons.BackButton/>
                    <Text>La ubicacion exacta se comparte al confirmar la visita</Text>
                  </View>
                </View>
              </View>
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Cerca de aqui</Text>
                <View>
                  <NearPlaces
                    nearPlacesData={mockProperty.nearbyPlaces}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
          <BlurView 
            intensity={45}
            tint='light'
            experimentalBlurMethod='dimezisBlurView'
            style={styles.priceSection}>
            <PriceCard
              onDate={() => console.log("se presiono el boton de cita")}
              price={mockProperty.priceLabel}
              operation={mockProperty.operation}
              hasMantain={mockProperty.maintainIncluded}
            />
          </BlurView>
        </>
      )}
    </View>
  )
} 
