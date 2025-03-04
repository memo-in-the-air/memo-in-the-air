import User from "@/assets/images/user.svg";
import Header from "@/components/Header";
import { auth } from "@/firebaseConfig";
import { clearUserInfo, deleteUserInfo } from "@/services/auth";
import { useBoundStore } from "@/store/useBoundStore";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function MyPage() {
  const router = useRouter();
  const userInfo = useBoundStore((state) => state.userInfo);
  const setUserInfo = useBoundStore((state) => state.setUserInfo);

  async function handleSignOut() {
    try {
      if (userInfo.loginType === "google") {
        await signOut(auth);
      }
      clearUserInfo(setUserInfo);
      router.replace("/");
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDeleteUser() {
    try {
      if (userInfo.loginType === "google") {
        await auth.currentUser?.delete();
        await deleteUserInfo(userInfo, setUserInfo);
        router.replace("/");
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        headerStyle={styles.headerContainer}
        headerTitle={"마이페이지"}
        showPreviousButton={false}
      />
      <View style={styles.myPageContainer}>
        <View style={styles.profileContainer}>
          <User width={50} height={50} />
          <View style={styles.userInfoContainer}>
            <Text style={{ color: "#000000" }}>{userInfo.email}</Text>
          </View>
        </View>
        <View style={styles.menuContainer}>
          <Pressable style={styles.buttonContainer} onPress={handleSignOut}>
            <Text style={styles.buttonText}>로그아웃</Text>
          </Pressable>
          <Pressable style={styles.buttonContainer} onPress={handleDeleteUser}>
            <Text style={styles.buttonText}>탈퇴하기</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerContainer: {
    flex: 0.6,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  myPageContainer: {
    flex: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  profileContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  userInfoContainer: {
    flex: 1,
  },
  menuContainer: {
    flex: 2,
    flexDirection: "row",
    width: "80%",
    alignItems: "center",
  },
  buttonContainer: {
    width: "50%",
    height: 30,
    borderColor: "#000000",
    borderWidth: 1,
  },
  buttonText: {
    textAlign: "center",
    margin: "auto",
  },
});
