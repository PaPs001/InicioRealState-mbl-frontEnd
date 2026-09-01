import { useState, type ReactNode } from 'react'
import { FlatList, Text, View } from 'react-native'
import { router } from 'expo-router'
import { BlurView } from 'expo-blur'

import { icons, logos } from '@/assets'
import { capitalizeFirstLetter } from '@/modules/users/main/utils/dashboard-formatters'
import { Amenities } from '../components/selectedProperties/AmenitiesButton'
import { GalleryImages } from '../components/selectedProperties/GalleryImages'
import { ImagesRoulette } from '../components/selectedProperties/ImagesRoulette'
import { NearPlaces } from '../components/selectedProperties/NearPlaces'
import { RoomsRow } from '../components/selectedProperties/RoomsRow'
import { PriceCard } from '../components/PriceCard'
import { mockProperty } from '../temporalMock'
import { styles } from './styles/selectedProperty.styles'

const PROPERTY_SECTIONS = ['overview', 'amenities', 'rooms', 'location', 'nearby'] as const

export const PropertiesList = () => {
  const [seeGalleryImage, setSeeGalleryImages] = useState(false)
  const operationLabel = mockProperty.operation.toLowerCase() === 'venta'
    ? 'Venta por INICIO Real Estate'
    : 'Renta por INICIO Real Estate'

  if (seeGalleryImage) {
    return (
      <View style={styles.safeArea}>
        <GalleryImages
          images={mockProperty.images}
          onClose={() => setSeeGalleryImages(false)}
          onFavorite={() => console.log('favorito')}
          onShare={() => console.log('Compartir')}
        />
      </View>
    )
  }

  return (
    <View style={styles.safeArea}>
      <FlatList
        data={PROPERTY_SECTIONS}
        keyExtractor={section => section}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.propertyListContent}
        ListHeaderComponent={(
          <ImagesRoulette
            onBack={() => router.back()}
            onFavorite={() => console.log('favorito')}
            onShare={() => console.log('Compartir')}
            onOpenGallery={() => setSeeGalleryImages(true)}
            images={mockProperty.images}
            status={mockProperty.status}
          />
        )}
        renderItem={({ item: section }) => {
          if (section === 'overview') {
            return (
              <View style={styles.container}>
                <View style={styles.operationContainer}>
                  <View style={styles.operationIcon}>
                    <logos.irsBlanco width={25} height={25} />
                  </View>
                  <Text adjustsFontSizeToFit numberOfLines={1} style={styles.operationText}>
                    {operationLabel}
                  </Text>
                  <icons.SealChek height={25} width={25} />
                </View>

                <View style={styles.propertyInformation}>
                  <Text style={styles.propertyTitle}>{capitalizeFirstLetter(mockProperty.title)}</Text>
                  <View style={styles.propertyAddressView}>
                    <View style={styles.propertyAddress}>
                      <icons.Place height={20} width={20} />
                      <Text style={styles.addressText} adjustsFontSizeToFit numberOfLines={1}>
                        {mockProperty.address}
                      </Text>
                    </View>
                    <View style={styles.propertyView}>
                      <mockProperty.view.icon />
                      <Text style={styles.viewText} adjustsFontSizeToFit numberOfLines={1}>
                        {mockProperty.view.label}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.propertyFeaturesContainer}>
                  <PropertyMetric icon={<icons.Bed width={25} height={25} />} value={mockProperty.bedrooms} label="Recámaras" />
                  <PropertyMetric icon={<icons.Bathroom width={25} height={25} />} value={mockProperty.bathrooms} label="Baños" />
                  <PropertyMetric icon={<icons.Car width={25} height={25} />} value={mockProperty.parking} label="Parkings" />
                  <View style={styles.moreFeaturesContainer}>
                    <mockProperty.moreInformation.icon />
                    <Text style={styles.moreFeaturesText}>{mockProperty.moreInformation.label}</Text>
                  </View>
                </View>

                <View style={styles.detailsContainer}>
                  <Text style={styles.detailsTitle}>Detalles de la propiedad</Text>
                  <Text style={styles.detailsInformation}>{mockProperty.description}</Text>
                </View>
              </View>
            )
          }

          if (section === 'amenities') {
            return <PropertySection title="Amenidades"><Amenities amenitiesData={mockProperty.propertyAmenities} /></PropertySection>
          }
          if (section === 'rooms') {
            return <PropertySection title="Donde vas a vivir"><RoomsRow roomsData={mockProperty.rooms} /></PropertySection>
          }
          if (section === 'location') {
            return (
              <PropertySection title="Dónde vas a estar">
                <View style={styles.mapTextAdviseContainer}>
                  <icons.Lock />
                  <Text numberOfLines={2} adjustsFontSizeToFit style={styles.mapText}>
                    La ubicación exacta se comparte al confirmar la visita
                  </Text>
                </View>
              </PropertySection>
            )
          }
          return <PropertySection title="Cerca de aquí"><NearPlaces nearPlacesData={mockProperty.nearbyPlaces} /></PropertySection>
        }}
      />

      <BlurView intensity={45} tint="light" experimentalBlurMethod="dimezisBlurView" style={styles.priceSection}>
        <PriceCard
          onDate={() => console.log('se presionó el botón de cita')}
          price={mockProperty.priceLabel}
          operation={mockProperty.operation}
          hasMantain={mockProperty.maintainIncluded}
        />
      </BlurView>
    </View>
  )
}

function PropertySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={[styles.sectionContainer, styles.listSection]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  )
}

function PropertyMetric({ icon, value, label }: { icon: ReactNode; value: string | number; label: string }) {
  return (
    <View style={styles.propertyMetricContainer}>
      <View style={styles.propertyMetricHead}>
        {icon}
        <Text adjustsFontSizeToFit numberOfLines={1} style={styles.metricNumber}>{value}</Text>
      </View>
      <Text adjustsFontSizeToFit numberOfLines={1} style={styles.metricText}>{label}</Text>
    </View>
  )
}
