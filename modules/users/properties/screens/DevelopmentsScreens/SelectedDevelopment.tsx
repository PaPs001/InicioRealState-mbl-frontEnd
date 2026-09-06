import { View, Pressable, Image, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons } from "@/assets";
import {
  DevelopmentMock,
  DevelopmentMockData,
} from "../../developmentMockData";
import { styles } from "../styles/SelectedDevelopment.styles";
import { useState } from "react";
import { generalColors } from "@/theme";
import { ModelSelected } from "./ModelSelected";

type SelectedDevelopmentsProps = {
  onPress?: () => void;
  developmentData: DevelopmentMock;
  developmentModel: DevelopmentMockData[];
  onSend?: () => void;
  onFavorite?: () => void
};

export const SelectedDevelopments = ({
  onPress,
  onSend,
  onFavorite,
  developmentData,
  developmentModel,
}: SelectedDevelopmentsProps) => {
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [showModel, setShowModel] = useState(false)
  const selectedModel = developmentModel.find(
    (model) => model.id === selectedModelId,
  );
  const widthIcon = 26;
  const heightIcon = 26;

  if(showModel && selectedModel) {
    return (
      <ModelSelected
        ubication={developmentData.location}
        modelData={selectedModel}
        onBack={() => setShowModel(false)}
      />
    )
  }
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <ScrollView
          scrollEnabled
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.developmentContainer}
        >
        <View style={styles.optionsContainer}>
          <Pressable
            onPress={onPress}
          >
            <icons.BackButton width={widthIcon} height={heightIcon} />
          </Pressable>
          <View style={styles.rightOptionsContainer}>
            <Pressable
              onPress={onSend}
            >
              <icons.ActionIcon width={widthIcon} height={heightIcon} />
            </Pressable>
            <Pressable
              onPress={onFavorite}
            >
              <icons.ActionIcon width={widthIcon} height={heightIcon} />
            </Pressable>
          </View>
        </View>
          <View style={styles.headerContainer}>
            <Text numberOfLines={2} style={styles.titleDevelopment}>
              {developmentData.name}
            </Text>
            <View style={styles.ubicationContainer}>
              <icons.Place width={15} height={15} />
              <Text style={styles.ubicationText}>
                {developmentData.location}
              </Text>
            </View>
          </View>
          <View style={styles.firstSectionContainer}>
            <View style={styles.descriptionContainer}>
              <Text style={styles.titleSections}>Conoce el desarrollo</Text>
              <Text style={styles.descriptionText}>
                {developmentData.description}
              </Text>
            </View>
            <View style={styles.imageContainer}>
              <Image
                style={styles.image}
                source={{ uri: developmentData.image }}
              />
            </View>
          </View>
          <View style={styles.secondSectionContainer}>
            <Text style={styles.titleSections}>Galeria del desarrollo</Text>
            <ScrollView
              scrollEnabled
              showsHorizontalScrollIndicator={false}
              horizontal
              contentContainerStyle={styles.galleryContainer}
            >
              {developmentData.developmentGallery.map((gallery, index) => (
                <View style={styles.galleryBlock}>
                  <Image
                    style={styles.galleryImage}
                    source={{ uri: gallery.url }}
                  />
                  <View style={styles.galleryTextContainer}>
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      style={styles.galleryText}
                    >
                      {gallery.label}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
          <View style={styles.thirdSection}>
            <Text style={styles.titleSections}>Modelos disponibles</Text>
            <ScrollView
              contentContainerStyle={styles.modelsContainer}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {developmentModel.map((model) => {
                const isSelected = selectedModelId === model.id;

                return (
                  <Pressable
                    style={[styles.modelPressable, isSelected && {
                      backgroundColor: generalColors.development
                    }]}
                    key={model.id}
                    onPress={() =>
                      setSelectedModelId((currentId) =>
                        currentId === model.id ? null : model.id,
                      )
                    }
                  >
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      style={[styles.nameModelText, isSelected && {
                        color: generalColors.white
                      }]}
                    >
                      {model.name}
                    </Text>
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      style={[styles.priceModelText, isSelected && {
                        color: generalColors.white
                      }]}
                    >
                      Desde ${model.minPrice.toLocaleString("es-MX")}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            {selectedModel ? (
              <View style={styles.modelInformationBlock}>
                {/** Tarjeta de informacion del modelo seleccionado */}
                <Pressable
                  onPress={() => setShowModel(true)}
                  style={styles.insideBlock}
                >
                  <View style={styles.modelImage}>
                    <Image
                      style={styles.image}
                      source={{ uri: selectedModel.portraitImage }}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={styles.informationContainer}>
                    <View style={styles.headerModelBlock}>
                      <Text
                        style={styles.titleSections}
                        adjustsFontSizeToFit
                        numberOfLines={1}
                      >
                        {selectedModel.name}
                      </Text>
                      <View style={styles.typeContainer}>
                        <Text adjustsFontSizeToFit numberOfLines={1} style={styles.typeText}>
                          {selectedModel.type}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.contentContainer}>
                      {" "}
                      {/** datos de numero de habitaciones del modelo */}
                      <View style={styles.contentBlock}>
                        <icons.ActionIcon />
                        <Text adjustsFontSizeToFit numberOfLines={1}  style={styles.contentNumberText}>{selectedModel.rec}</Text>
                        <Text adjustsFontSizeToFit numberOfLines={1}  style={styles.contentText}>Recamaras</Text>
                      </View>
                      <View style={styles.contentBlock}>
                        <icons.ActionIcon />
                        <Text adjustsFontSizeToFit numberOfLines={1}  style={styles.contentNumberText}>{selectedModel.bath}</Text>
                        <Text adjustsFontSizeToFit numberOfLines={1}  style={styles.contentText}>Baños</Text>
                      </View>
                      <View style={styles.contentBlock}>
                        <icons.ActionIcon />
                        <Text adjustsFontSizeToFit numberOfLines={1}  style={styles.contentNumberText}>{selectedModel.parking}</Text>
                        <Text adjustsFontSizeToFit numberOfLines={1}  style={styles.contentText}>Parkings</Text>
                      </View>
                      <View style={styles.contentBlock}>
                        <icons.ActionIcon />
                        <Text adjustsFontSizeToFit numberOfLines={1} style={styles.contentNumberText}>{selectedModel.area} m2</Text>
                        <Text adjustsFontSizeToFit numberOfLines={1}  style={styles.contentText}>Superficie</Text>
                      </View>
                    </View>
                    <View style={styles.addedContainer}>
                      <Text style={styles.addedText}>Incluye</Text>
                      <View style={styles.addedAmenitiesContainer}>
                        {selectedModel.has.slice(0, 4).map((things) => (
                          <View key={things} style={styles.amenitieObject}>
                            <icons.ActionIcon />
                            <Text adjustsFontSizeToFit numberOfLines={1} style={styles.amenitieObjectText}>{things}</Text>
                          </View>
                        ))}
                        {selectedModel.has.length > 5 && (
                          <Text style={styles.amenitieObjectText}>
                            +{selectedModel.has.length - 5} amenidades más
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                </Pressable>
              </View>
            ) : null}
          </View>
          <View style={styles.fourthSection}>
            <Text style={styles.titleSections}>Amenidades</Text>
            <View style={styles.amenitiesContainer}>
              {developmentData.amenities.map((amenitie) => (
                <View style={styles.amenitieBlock} key={amenitie}>
                  <icons.ArrowDown />
                  <Text numberOfLines={1} adjustsFontSizeToFit style={styles.amenitieText}>{amenitie}</Text>
                </View>
              ))}
            </View>
          </View>
          <View>
            <Text style={styles.titleSections}>Ubicacion</Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};
