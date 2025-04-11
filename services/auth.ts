import { deleteUser, upsertUserInfo } from "@/firebase/user";
import { User } from "firebase/auth";

type userType = {
  userId: string;
  authId: string;
  email: string | null;
  nickName: string | null;
  loginType: string | null;
};

export async function saveUserInfo(
  userId: string,
  userInfo: User,
  setUserInfo: (user: userType) => void,
  loginType: string,
) {
  const user = await upsertUserInfo({
    userId,
    authId: userInfo.uid,
    email: userInfo.email,
    nickName: userInfo.displayName,
    loginType,
  });

  setUserInfo(user);
}

export async function updateUserLastSignInAt(
  userId: string,
  setUserInfo: (user: userType) => void,
) {
  const user = await upsertUserInfo({ userId });
  setUserInfo(user);
}

export async function clearUserInfo(setUserInfo: (user: userType) => void) {
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
