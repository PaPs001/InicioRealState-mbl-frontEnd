import useSessionDomain from "@/contexts/auth/use-session-domain";
import {
  createPropertyImageToSend,
  openFileWithIntent,
} from "@/lib/api/endpoints/pdfReports";
import { useCallback, useRef, useState } from "react";
import { File } from "expo-file-system";
import { Alert } from "react-native";

export function usePropertyCatalogImage(propertyId: string | undefined) {
  const { authToken } = useSessionDomain();

  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const imageGenerationLock = useRef<boolean>(isGeneratingImage);

  const generateAndOpenImage = useCallback(async () => {
    if (imageGenerationLock.current === true) return;
    if (propertyId) {
      try {
        imageGenerationLock.current = true;
        setIsGeneratingImage(true);
        const generatedImage = await createPropertyImageToSend(authToken, propertyId);

        if (generatedImage.localUri) {
          const localImageFile = new File(generatedImage.localUri);
          const imageContentUri = localImageFile.contentUri;

          await openFileWithIntent(imageContentUri, "image/png");
        }
      } catch (imageGenerationError: any) {
        Alert.alert(
          "No se pudo descargar y abrir la imagen",
          imageGenerationError?.message || "Revisa la conexion con el creador de la imagen.",
        );
      } finally {
        imageGenerationLock.current = false;
        setIsGeneratingImage(false);
        console.log("tercero", imageGenerationLock.current);
      }
    }
  }, [propertyId, authToken]);

  return {
    setIsGeneratingImage,
    isGeneratingImage,
    generateAndOpenImage,
  };
}
