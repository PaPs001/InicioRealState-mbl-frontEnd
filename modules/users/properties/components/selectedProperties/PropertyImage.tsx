import { useEffect, useState } from "react";
import { Image, View, type ImageProps } from "react-native";
import { getCachedPropertyImage } from "../../services/image-cache";

type Props = Omit<ImageProps, "source"> & { uri?: string; enabled?: boolean };

export function PropertyImage({ uri, enabled = true, ...props }: Props) {
  const [resolved, setResolved] = useState<{
    original: string;
    local: string;
  } | null>(null);
  useEffect(() => {
    if (!uri || !enabled) return;
    let active = true;
    getCachedPropertyImage(uri)
      .then((local) => {
        if (active) setResolved({ original: uri, local });
      })
      .catch(() => {
        if (active) setResolved({ original: uri, local: uri });
      });
    return () => {
      active = false;
    };
  }, [uri, enabled]);
  if (!uri || !enabled || resolved?.original !== uri)
    return <View style={props.style} />;
  return <Image {...props} source={{ uri: uri }} />;
}
