import { View, TouchableOpacity, Image, Text } from "react-native";
import { Bell } from "lucide-react-native";
import { useRouter } from "expo-router";

type ProfileHeaderProps = {
  advisorInitials: string;
  advisorName: string;
  profileAvatarUri: string | null;
  areaConfig: { basePath: string; headline: string };
  styles: any;
};

export function ProfileHeader({
  advisorInitials,
  advisorName,
  profileAvatarUri,
  areaConfig,
  styles,
}: ProfileHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.profileRow}>
        <TouchableOpacity
          style={styles.profileLeft}
          activeOpacity={0.85}
          onPress={() => {
            router.push(`${areaConfig.basePath}/settings` as never);
          }}
        >
          <View style={styles.avatar}>
            {profileAvatarUri ? (
              <Image
                source={{ uri: profileAvatarUri }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.avatarText}>{advisorInitials}</Text>
            )}
          </View>
          <View>
            <Text style={styles.greeting}>Hola, {advisorName}</Text>
            <Text style={styles.helper}>{areaConfig.headline}</Text>
          </View>
        </TouchableOpacity>
      <TouchableOpacity style={styles.notification} activeOpacity={0.85}>
        <Bell size={20} color="#c79443" />
      </TouchableOpacity>
    </View>
  );
}
