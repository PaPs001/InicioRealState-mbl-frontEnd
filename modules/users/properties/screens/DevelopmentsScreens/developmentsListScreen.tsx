import { View, Text, Pressable, Image, TextInput } from "react-native";
import { icons } from "@/assets";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { DevelopmentCard } from "../../components/developmentList/DevelopmentCard";
import {
  DevelopmentMocks,
  type DevelopmentMock,
  DevelopmentMockData
} from "@/modules/users/properties/developmentMockData";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { styles } from "../styles/DevelopmentsListScreen";
import { generalColors } from "@/theme";
import { BlurView } from "expo-blur";

export const DevelopmentListScreen = () => {
  const [search, setSearch] = useState<string>("");
  const filteredDevelopments = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return DevelopmentMocks;
    }

    return DevelopmentMocks.filter((development) =>
      `${development.name} ${development.location} ${development.zone}`
        .toLowerCase()
        .includes(query),
    );
  }, [search]);
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <View style={styles.developmentsContainer}>
          <FlashList
            ListHeaderComponent={
              <View style={styles.headerList}>
                <Text style={styles.developmentsTitle}>
                  Desarrollos destacados
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <DevelopmentCard
                development={item}
                onPress={() =>
                  router.push({
                    pathname: "/developments/[developmentId]",
                    params: {
                      developmentId: item.id,
                    },
                  })
                }
              />
            )}
            data={filteredDevelopments}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            contentContainerStyle={styles.listContent}
          />
          <BlurView
            intensity={45}
            tint="light"
            experimentalBlurMethod="dimezisBlurView"
            style={styles.floatingHeader}
            pointerEvents="box-none"
          >
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <icons.BackButton width={26} height={26}/>
            </Pressable>
            <View style={styles.filterContainer}>
              <View style={styles.searchInput}>
                <icons.Searcher />
                <TextInput
                  placeholder="Buscar por ubicacion, proyecto o amenidad"
                  value={search}
                  onChangeText={setSearch}
                  placeholderTextColor={generalColors.black}
                  style={styles.searchTextInput}
                />
              </View>
              <Pressable style={styles.filterButton}>
                <icons.FilterDev stroke={"red"} />
              </Pressable>
            </View>
          </BlurView>
        </View>
      </View>
    </SafeAreaView>
  );
};
