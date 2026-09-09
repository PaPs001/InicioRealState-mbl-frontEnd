import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image as ImageIcon } from "lucide-react-native";

import {
  type FollowingAttachment,
  useFollowingAttachmentImage,
} from "@/modules/users/leads/hooks/useFollowingAttachmentImage";

export type FollowingImagePreview = { uri: string; title: string };

type Props = {
  attachment: FollowingAttachment;
  followingId: string;
  index: number;
  leadId: string;
  onOpenImage: (image: FollowingImagePreview) => void;
  token?: string | null;
  numAttachs?: number | null,
};

export function FollowingImageAttachment({
  attachment,
  followingId,
  index,
  leadId,
  onOpenImage,
  token,
  numAttachs,
}: Props) {
  const title = attachment.filename || `Imagen ${index + 1}`;
  const { hasLoadError, localUri } = useFollowingAttachmentImage({
    attachment,
    followingId,
    index,
    leadId,
    token,
  });

  const hiddenImages = numAttachs ?? 0;
  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.85}
      disabled={!localUri}
      onPress={() => localUri && onOpenImage({ uri: localUri, title })}
    >
      {localUri ? (
        <View>
          {hiddenImages > 0 ? (
            <View style={styles.overImage}>
              <Text style={styles.overText}>
                + {hiddenImages}
              </Text>
            </View>
          ): null}
          <Image
            source={{ uri: localUri }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            {hasLoadError ? "No disponible" : "Cargando..."}
          </Text>
        </View>
      )}
      <View style={styles.metadata}>
        <ImageIcon size={12} color="#0c6740" />
        <Text style={styles.filename} numberOfLines={1}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 112,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d8d1c8",
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  overImage:{
    backgroundColor: '#22222256',
    zIndex: 10,
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',

  },
  overText:{
    color: '#fcfcfc'
  },
  image: { width: "100%", height: 82, backgroundColor: "#edf1e0" },
  placeholder: {
    width: "100%",
    height: 82,
    backgroundColor: "#edf1e0",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  placeholderText: {
    color: "#6f786f",
    fontSize: 10,
    lineHeight: 13,
    textAlign: "center",
  },
  metadata: {
    minHeight: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 7,
    paddingVertical: 6,
  },
  filename: {
    flex: 1,
    minWidth: 0,
    color: "#19191f",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "600",
  },
});
