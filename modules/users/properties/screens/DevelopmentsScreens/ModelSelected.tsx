import { View, Pressable, Image, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons } from "@/assets";
import { DevelopmentMockData } from "../../developmentMockData";
import { styles } from "../styles/ModelSelected.styles";
import { useEffect, useState } from "react";
import { BlurView } from "expo-blur";
import { ImagePreviewModal } from "../../components/ImagePreviewModal";
type ModelSelectedProps = {
  onBack?: () => void;
  modelData: DevelopmentMockData;
  ubication: string;
};

export const ModelSelected = ({
  onBack,
  modelData,
  ubication,
}: ModelSelectedProps) => {
  const iconHeight = 26;
  const iconWidth = 26;
  const [typeBelow, setTypeBelow] = useState(false);
  const [selectedImage, setSelectedImage] = useState(modelData.portraitImage);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  useEffect(() => {
    setSelectedImage(modelData.portraitImage);
  }, [modelData.id, modelData.portraitImage]);
  useEffect(() => {
    setTypeBelow(false);
  }, [modelData.id]);
  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        scrollEnabled
        contentContainerStyle={styles.container}
      >
        <Pressable onPress={onBack}>
          <icons.BackButton height={iconHeight} width={iconWidth}/>
        </Pressable>
        <View style={styles.headerContainer}>
          <View
            style={[
              styles.headerTitleContainer,
              typeBelow && styles.headerTitleContainerStacked,
            ]}
          >
            <Text
              numberOfLines={2}
              style={[styles.titleText, typeBelow && styles.titleTextStacked]}
              onTextLayout={({ nativeEvent }) => {
                if (nativeEvent.lines.length > 1) {
                  setTypeBelow(true);
                }
              }}
            >
              {modelData.name}
            </Text>
            <View style={styles.typeContainer}>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={styles.typeText}
              >
                {modelData.type}
              </Text>
            </View>
          </View>
          <View style={styles.ubicationContainer}>
            <icons.Place />
            <Text style={styles.ubicationText}>{ubication}</Text>
          </View>
        </View>
        <View style={styles.roulleteContainer}>
          <Image
            source={{ uri: selectedImage }}
            style={styles.principalImage}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.imagesRoulleteContainer}
          >
            {modelData.photos.map((photo, index) => (
              <Pressable
                style={styles.imagesHouseContainer}
                key={index}
                onPress={() => setSelectedImage(photo.url)}
                accessibilityRole="button"
                accessibilityLabel={`Ver foto: ${photo.label}`}
                accessibilityState={{ selected: selectedImage === photo.url }}
              >
                <Image
                  style={styles.imageRoullete}
                  source={{ uri: photo.url }}
                />
                <Text
                  numberOfLines={2}
                  adjustsFontSizeToFit
                  style={styles.titleImageText}
                >
                  {photo.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
        <View style={styles.modelStatsContainer}>
          {/** datos de numero de habitaciones del modelo */}
          <View style={[styles.contentBlock, styles.contentDivider]}>
            <icons.ActionIcon />
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={styles.contentNumberText}
            >
              {modelData.rec}
            </Text>
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={styles.contentText}
            >
              Recamaras
            </Text>
          </View>
          <View style={[styles.contentBlock, styles.contentDivider]}>
            <icons.ActionIcon />
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={styles.contentNumberText}
            >
              {modelData.bath}
            </Text>
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={styles.contentText}
            >
              Baños
            </Text>
          </View>
          <View style={[styles.contentBlock, styles.contentDivider]}>
            <icons.ActionIcon />
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={styles.contentNumberText}
            >
              {modelData.parking}
            </Text>
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={styles.contentText}
            >
              Parkings
            </Text>
          </View>
          <View style={styles.contentBlock}>
            <icons.ActionIcon />
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={styles.contentNumberText}
            >
              {modelData.area} m2
            </Text>
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={styles.contentText}
            >
              Superficie
            </Text>
          </View>
        </View>
        <View style={styles.addedContainer}>
          <Text style={styles.sectionTitle}>Incluye</Text>
          <View style={styles.addedAmenitiesContainer}>
            {modelData.has.map((things) => (
              <View style={styles.amenitieObject}>
                <icons.ActionIcon />
                <Text
                  adjustsFontSizeToFit
                  numberOfLines={1}
                  style={styles.amenitieObjectText}
                >
                  {things}
                </Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.principalRenderContainer}>
          <Text style={styles.sectionTitle}>Renders y detalles</Text>
          <View style={styles.rendersContainer}>
            {modelData.renders.map((render, index) => (
              <Pressable
                onPress={() => setPreviewImage(render.render)}
                key={index}
                style={styles.renderBlock}
              >
                <Image
                  style={styles.renderImage}
                  source={{ uri: render.render }}
                />
                <View style={styles.renderTextContainer}>
                  <icons.ActionIcon />
                  <View>
                    <Text numberOfLines={2} style={styles.renderTitle}>
                      {render.name}
                    </Text>
                    <Text numberOfLines={2} style={styles.renderText}>
                      Conoce los espacios
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
      <BlurView
        intensity={45}
        tint="light"
        experimentalBlurMethod="dimezisBlurView"
        style={styles.buttonsContainer}
      >
        <Pressable style={styles.availabilityButton}>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={styles.availabilityTextButton}
          >
            Ver disponibilidad
          </Text>
        </Pressable>
        <Pressable style={styles.dateButton}>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={styles.dateTextButton}
          >
            Agendar Cita
          </Text>
        </Pressable>
      </BlurView>
      {previewImage !== null && (
        <ImagePreviewModal
          image={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </SafeAreaView>
  );
};
