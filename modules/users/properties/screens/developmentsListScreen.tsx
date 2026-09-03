import { View, Text, Pressable, Image, TextInput } from "react-native";
import { icons } from "@/assets";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { DevelopmentCard } from "../components/developmentList/DevelopmentCard";
import {
  DevelopmentMocks,
  type DevelopmentMock,
} from "@/modules/users/properties/developmentMockData";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { styles } from "./styles/DevelopmentsListScreen";

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
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <icons.BackButton />
        </Pressable>
        <View style={styles.filterContainer}>
          <View style={styles.searchInput}>
            <icons.Searcher />
            <TextInput
              placeholder="Buscar por ubicacion, proyecto o amenidad"
              value={search}
              onChangeText={setSearch}
              style={{ fontSize: 10, flex: 1 }}
            />
          </View>
          <Pressable style={styles.filterButton}>
            <icons.Barbell stroke={"red"} />
          </Pressable>
        </View>
        <View style={styles.developmentsContainer}>
          <Text style={styles.developmentsTitle}>Desarrollos destacados</Text>
          <FlashList
            renderItem={({ item }) => <DevelopmentCard development={item} />}
            data={filteredDevelopments}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            contentContainerStyle={{ paddingBottom: 24 }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};
