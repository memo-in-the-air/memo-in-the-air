import { database } from "@/firebaseConfig";
import { Database, get, ref, remove, set, update } from "firebase/database";

type userType = {
  userId: string;
  authId?: string;
  email?: string | null;
  nickName?: string | null;
  loginType?: string | null;
};

export async function upsertUserInfo(userInfo: userType) {
  const snapshot = await get(ref(database, `user/${userInfo.userId}`));

  if (snapshot.exists()) {
    await update(ref(database, `user/${userInfo.userId}`), {
      lastSignInAt: new Date().toISOString(),
    });

    return { ...snapshot.val() };
  }

  await set(ref(database as Database, `user/${userInfo.userId}`), {
    userId: userInfo.userId,
    authId: userInfo.authId,
    email: userInfo.email,
    nickName: userInfo.nickName,
    loginType: userInfo.loginType,
    lastSignInAt: new Date().toISOString(),
  });

  return userInfo;
}

export async function deleteUser(userInfo: userType) {
  try {
    await remove(ref(database, `user/${userInfo.userId}`));
    await remove(ref(database, `memo/${userInfo.userId}`));

    return true;
  } catch {
    return false;
  }
}
