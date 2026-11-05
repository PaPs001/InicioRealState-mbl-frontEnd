import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  type Region,
} from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Maximize2, X } from "lucide-react-native";
import { logos } from "@/assets";
import { styles as propertyStyles } from "../../screens/styles/selectedProperty.styles";
import { userColors } from "@/theme";

type Props = {
  latitude: number;
  longitude: number;
  markerColor: string;
};

export function PropertyLocationMap({
  latitude,
  longitude,
  markerColor,
}: Props) {
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const regionRef = useRef<Region>({
    latitude,
    longitude,
    latitudeDelta: 0.007,
    longitudeDelta: 0.007,
  });
  const close = () => setExpanded(false);

  const renderMap = (interactive: boolean) => (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={StyleSheet.absoluteFill}
      initialRegion={
        interactive
          ? regionRef.current
          : { latitude, longitude, latitudeDelta: 0.007, longitudeDelta: 0.007 }
      }
      zoomEnabled={interactive}
      scrollEnabled={interactive}
      pitchEnabled={false}
      rotateEnabled={false}
      mapType="standard"
      toolbarEnabled={false}
      onMapLoaded={interactive ? () => setMapLoaded(true) : undefined}
      onRegionChangeComplete={
        interactive
          ? (region) => {
              regionRef.current = region;
            }
          : undefined
      }
    >
      <Marker coordinate={{ latitude, longitude }} anchor={{ x: 0.5, y: 1 }}>
        <View style={propertyStyles.markerContainer}>
          <View
            style={[propertyStyles.circle, { backgroundColor: markerColor }]}
          >
            <logos.irsBlanco width={43} height={43} />
          </View>
          <View style={propertyStyles.triangle} />
        </View>
      </Marker>
    </MapView>
  );

  return (
    <>
      <View style={propertyStyles.mapContainer}>
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {renderMap(false)}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ampliar mapa"
          onPress={() => {
            setMapLoaded(false);
            setExpanded(true);
          }}
          hitSlop={8}
          style={[localStyles.button, { top: 12 }]}
        >
          <Maximize2 size={23} color="#FFFFFF" />
        </Pressable>
      </View>
      <Modal
        visible={expanded}
        animationType="none"
        presentationStyle="fullScreen"
        onRequestClose={close}
      >
        <View style={localStyles.fullScreen} onAccessibilityEscape={close}>
          {expanded && renderMap(true)}
          {!mapLoaded && (
            <View style={localStyles.loading}>
              <ActivityIndicator size="large" color={markerColor} />
              <Text style={localStyles.noticeText}>Cargando mapa...</Text>
            </View>
          )}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cerrar mapa ampliado"
            onPress={close}
            hitSlop={8}
            style={[localStyles.button, { top: Math.max(insets.top, 12) }]}
          >
            <X size={23} color="#FFFFFF" />
          </Pressable>
          <View
            pointerEvents="none"
            style={[
              localStyles.notice,
              { bottom: Math.max(insets.bottom, 16) },
            ]}
          >
            <Text style={localStyles.noticeText}>
              La ubicación exacta se comparte al confirmar la visita
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

const localStyles = StyleSheet.create({
  fullScreen: { flex: 1, backgroundColor: "#ecebeb" },
  loading: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ecebeb",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  button: {
    position: "absolute",
    right: 12,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: userColors.adviser.primary
  },
  notice: {
    position: "absolute",
    left: 20,
    right: 20,
    backgroundColor: "rgba(255,255,255,0.94)",
    padding: 14,
    borderRadius: 14,
  },
  noticeText: { color: "#333333", textAlign: "center", fontSize: 13 },
});
