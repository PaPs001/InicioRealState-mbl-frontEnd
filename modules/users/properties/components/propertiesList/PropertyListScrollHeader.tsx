import { useCallback, useEffect, useRef, useState, type ReactElement, type ReactNode } from "react";
import {
  Animated,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { generalColors } from "@/theme";
import type { usePropertiesScreen } from "../../hooks/usePropertiesScreen";
import { PropertyListHeader } from "./PropertyListHeader";

type ListBindings = {
  header: ReactElement;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

/** Keeps scroll detection and the floating toolbar together, outside the list's layout. */
export function PropertyListScrollHeader({ controller, children }: {
  controller: ReturnType<typeof usePropertiesScreen>;
  children: (bindings: ListBindings) => ReactNode;
}) {
  const headerHeight = useRef(0);
  const previousOffset = useRef(0);
  const direction = useRef(0);
  const distance = useRef(0);
  const [visible, setVisible] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [progress, visible]);

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    // Clamp overscroll so bouncing at either edge cannot reveal the toolbar.
    const offset = Math.max(0, Math.min(contentOffset.y, Math.max(0, contentSize.height - layoutMeasurement.height)));
    const delta = offset - previousOffset.current;
    previousOffset.current = offset;

    if (headerHeight.current === 0 || offset <= headerHeight.current) {
      distance.current = 0;
      direction.current = 0;
      setVisible(false);
      return;
    }
    if (delta === 0) return;
    const nextDirection = Math.sign(delta);
    distance.current = nextDirection === direction.current ? distance.current + Math.abs(delta) : Math.abs(delta);
    direction.current = nextDirection;
    if (distance.current >= 12) setVisible(nextDirection < 0);
  }, []);

  return (
    <View style={styles.container}>
      {children({
        onScroll,
        header: (
          <View onLayout={(event) => { headerHeight.current = event.nativeEvent.layout.height; }}>
            <PropertyListHeader controller={controller} enabledFilters canUsePdfExporter />
          </View>
        ),
      })}
      <Animated.View
        pointerEvents={visible ? "auto" : "none"}
        accessibilityElementsHidden={!visible}
        importantForAccessibility={visible ? "auto" : "no-hide-descendants"}
        style={[styles.toolbar, {
          opacity: progress,
          transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [-24, 0] }) }],
        }]}
      >
        <PropertyListHeader controller={controller} enabledFilters canUsePdfExporter compact />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  toolbar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    elevation: 8,
    backgroundColor: generalColors.background,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    paddingHorizontal: 12,
  },
});
