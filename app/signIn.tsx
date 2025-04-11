import Button from "@/components/Button";
import DividerLine from "@/components/DividerLine";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { START_NON_USER_BUTTON } from "@/constants/Buttons";
import { APP_DESC, APP_TITLE } from "@/constants/Messages";
import { auth } from "@/firebaseConfig";
import { saveUserInfo, updateUserLastSignInAt } from "@/services/auth";
import { useBoundStore } from "@/store/useBoundStore";
import * as AppleAuthentication from "expo-apple-authentication";
import { AuthSessionResult } from "expo-auth-session/build/AuthSession.types";
import * as Google from "expo-auth-session/providers/google";
import * as Crypto from "expo-crypto";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import {
  GoogleAuthProvider,
  OAuthProvider,
  User,
  onAuthStateChanged,
  signInWithCredential,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import Geolocation from "react-native-geolocation-service";

WebBrowser.maybeCompleteAuthSession();

export default function SignIn() {
  const userId = useBoundStore((state) => state.userId);
  const setUserLocation = useBoundStore((state) => state.setUserLocation);
  const setUserInfo = useBoundStore((state) => state.setUserInfo);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [, response, promptAsync] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_FIREBASE_IOS_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === "success") {
      handleGoogleSiginResponse(response);
    } else if (response?.type) {
      setIsLoading(false);
    }
  }, [response]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        updateUserLastSignInAt(userId, setUserInfo);
        router.replace("/memoList");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, altitude } = position.coords;
        setUserLocation({ latitude, longitude, altitude: altitude || 0 });
      },
      (error) => {
        console.error(error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  }, []);

  async function handleGoogleSiginResponse(response: AuthSessionResult) {
    try {
      const { id_token } = response.params;
      const googleCredential = GoogleAuthProvider.credential(id_token);

      const signInResult = await signInWithCredential(auth, googleCredential);
      await saveUserInfo(userId, signInResult.user, setUserInfo, "google");
    } catch (e) {
      console.error(e);
    }
  }

  function handleGoogleSignIn() {
    promptAsync();
    setIsLoading(true);
  }

  async function handleAppleSignIn() {
    try {
      const rawNonce = Math.random().toString(36).substring(2, 10);
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawNonce,
      );

      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      if (appleCredential.identityToken) {
        const firebaseCredential = new OAuthProvider("apple.com").credential({
          idToken: appleCredential.identityToken,
          rawNonce,
        });

        const signInResult = await signInWithCredential(auth, firebaseCredential);
        await saveUserInfo(userId, signInResult.user, setUserInfo, "apple");
      } else {
        throw new Error("로그인 인증 실패");
      }
    } catch (e) {
      if (e.code !== "ERR_REQUEST_CANCELED") {
        console.error(e);
      }
    }
  }

  function handleStartNonUser() {
    router.push("/memoList");
  }

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require("../assets/images/logo-vertical.png")}
          width={200}
          height={200}
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={styles.titleText}>{APP_TITLE}</Text>
        <Text style={styles.descText}>{APP_DESC}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <GoogleSignInButton onPressFunc={handleGoogleSignIn} />
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={20}
          style={styles.appleSignInButton}
          onPress={handleAppleSignIn}
        />
        <DividerLine />
        <Button
          buttonText={START_NON_USER_BUTTON}
          style={styles.startNonUserButton}
          textStyle={styles.signInText}
          onPressFunc={handleStartNonUser}
        />
      </View>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000080r" style={styles.indicatorPosition} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    gap: 70,
  },
  imageContainer: {
    flex: 4,
    justifyContent: "flex-end",
  },
  image: {
    transform: [{ scale: 0.8 }],
    alignItems: "center",
    justifyContent: "flex-end",
  },
  titleText: {
    fontFamily: "SUITE-Bold",
    fontSize: 25,
    color: "#343A40",
    textAlign: "center",
    marginBottom: 5,
  },
  descText: {
    fontFamily: "SUITE-SemiBold",
    fontSize: 18,
    color: "#343A40",
    textAlign: "center",
    lineHeight: 25,
  },
  buttonContainer: {
    flex: 3,
    width: "100%",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 15,
  },
  appleSignInButton: {
    width: 300,
    height: 50,
  },
  startNonUserButton: {
    width: 300,
    height: 48,
    backgroundColor: "#5E8BCE",
    borderColor: "#5E8BCE",
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: "auto",
    paddingVertical: 12,
  },
  signInText: {
    color: "#FFFFFF",
    fontSize: 18,
    lineHeight: 20,
    fontFamily: "Roboto-medium",
    fontWeight: 500,
    textAlign: "center",
    marginVertical: "auto",
  },
  loadingContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "#ECE9EA",
    opacity: 0.5,
  },
  indicatorPosition: {
    top: "55%",
    left: 0,
  },
});
