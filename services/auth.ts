import { deleteUser, upsertUserInfo } from "@/firebase/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as AppleAuthentication from "expo-apple-authentication";
import { User } from "firebase/auth";

type userType = {
  userId: string;
  authId: string;
  email: string | null;
  nickName: string | null;
  loginType: string | null;
};

export async function saveAppleUserInfo(
  userId: string,
  userInfo: AppleAuthentication.AppleAuthenticationCredential,
  setUserInfo: (user: userType) => void,
) {
  const user = await upsertUserInfo({
    userId: userId,
    authId: userInfo.user,
    email: userInfo.email,
    nickName: `${userInfo.fullName?.givenName + " " + userInfo.fullName?.familyName}`,
    loginType: "apple",
  });

  await AsyncStorage.setItem("userInfo", JSON.stringify(user));
  setUserInfo(user);
}

export async function saveGoogleUserInfo(
  userId: string,
  userInfo: User,
  setUserInfo: (user: userType) => void,
) {
  const user = await upsertUserInfo({
    userId: userId,
    authId: userInfo.uid,
    email: userInfo.email,
    nickName: userInfo.displayName,
    loginType: "google",
  });

  await AsyncStorage.setItem("userInfo", JSON.stringify(user));
  setUserInfo(user);
}

export async function clearUserInfo(setUserInfo: (user: userType) => void) {
  await AsyncStorage.removeItem("userInfo");
  setUserInfo({
    userId: "",
    authId: "",
    email: "",
    nickName: null,
    loginType: null,
  });
}

export async function deleteUserInfo(userInfo: userType, setUserInfo: (user: userType) => void) {
  try {
    const isSuccess: boolean = await deleteUser(userInfo);

    if (!isSuccess) {
      throw new Error("fail delete user");
    }

    await clearUserInfo(setUserInfo);
  } catch (e) {
    console.error(e);
  }
}
