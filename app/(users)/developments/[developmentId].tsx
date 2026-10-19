import { Pressable, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { DevelopmentMocks, DevelopmentMockData } from "@/modules/users/properties/developmentMockData";
import { SelectedDevelopments } from "@/modules/users/properties/screens/DevelopmentsScreens/SelectedDevelopment";

export default function DevelopmentDetailRoute() {
  const { developmentId } = useLocalSearchParams<{
    developmentId: string;
  }>();

  const development = DevelopmentMocks.find(
    (item) => item.id === developmentId,
  );

  const developmentModels = DevelopmentMockData.filter(
    (model) => model.developmentId === developmentId
  )

  if (!development) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <Text>No se encontro el desarrollo</Text>
        <Pressable>
          <Text>Regresar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SelectedDevelopments
      developmentData={development}
      onPress={() => router.back()}
      developmentModel={developmentModels}
    />
  );
}
