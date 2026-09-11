import { useState } from "react";
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import LogoIRSPrincipal from "@/app/assets/logoIRSprincipal.svg";
import { PrimaryButton, SecondaryButton } from "@/components/buttons";

import { MailIcon } from "@/testEd/EmailIcon";

import {
  getPasswordResetErrorMessage,
  requestPasswordReset,
  validatePasswordResetEmail,
} from "@/lib/services/password-reset";
import { icons } from "@/assets";
import { checkEmailExists } from "@/lib/api";
import { generalColors, textColor } from "@/theme";
import { Mail, MailCheck, MailMinus, MailQuestion } from "lucide-react-native";
export default function PasswordResetMailScreen() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!validatePasswordResetEmail(email)) {
      setErrorMessage("Ingresa un correo valido.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await requestPasswordReset(email);
      router.push({
        pathname: "/password/verify",
        params: { email: email.trim().toLowerCase() },
      });
    } catch (error) {
      setErrorMessage(
        getPasswordResetErrorMessage(error, "No se pudo enviar el codigo."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.principalContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerContainer}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <icons.BackButton />
            </Pressable>
            <LogoIRSPrincipal width={146} height={48} />
          </View>
          <View style={styles.principalIconContainer}>
            <View style={styles.iconContainer}>
              <MailIcon />
            </View>
          </View>
          <View style={styles.content}>
            <Text style={styles.title}>¿Contraseña Perdida?</Text>
            <Text style={styles.subTitle}>
              Ingresa el correo de tu cuenta, y nosotros te enviaremos un codigo
              de verificacion.
            </Text>

            <View style={styles.form}>
              <View style={styles.emailInput}>
                <Mail strokeWidth={1} />
                <TextInput
                  style={{
                    flex: 1,
                  }}
                  placeholder="Correo electronico"
                  placeholderTextColor="#b1aeae"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="emailAddress"
                  value={email}
                  onChangeText={(value) => {
                    setEmail(value);
                    if (errorMessage) setErrorMessage("");
                  }}
                />
              </View>

              {errorMessage ? (
                <Text
                  adjustsFontSizeToFit
                  numberOfLines={1}
                  style={styles.errorText}
                >
                  {errorMessage}
                </Text>
              ) : null}
            </View>
            <Pressable onPress={handleSubmit} style={styles.buttonContent}>
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={styles.buttonText}
              >
                Continuar
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fefbf6",
  },
  keyboardView: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  principalContainer: {
    paddingHorizontal: 20,
    gap: 20,
  },
  backButton: {
    position: "absolute",
    left: 20,
    width: 60,
    height: 35,
    justifyContent: "center",
  },
  iconContainer:{
    flex: 1,
  },
  principalIconContainer: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 22,
    paddingBottom: 32,
  },
  logo: {
    alignItems: "center",
    marginTop: 10,
  },
  content: {},
  title: {
    fontSize: 25,
    color: textColor.accentGolden,
  },
  subTitle: {
    fontSize: 15,
    color: textColor.softText,
    fontWeight: "400",
  },
  form: {
    marginTop: 18,
    gap: 12,
    alignItems: "center",
    paddingBottom: 12,
    width: "100%",
  },
  emailInput: {
    color: "#000000",
    borderRadius: 12,
    backgroundColor: "#FCFAF8",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#E7DDCF",
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  errorText: {
    color: "#B42318",
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  buttonContent: {
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 10,
    height: 45,
    backgroundColor: textColor.accentGolden,
  },
  buttonText: {
    flexGrow: 1,
    flexShrink: 1,
    fontSize: 14,
    flex: 1,
    color: generalColors.white,
  },
});
