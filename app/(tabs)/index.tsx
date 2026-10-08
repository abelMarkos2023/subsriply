import { colors, spacing } from "@/constants/theme";
import "@/global.css";
import { Link } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView as RNSAV } from "react-native-safe-area-context";

export default function App() {
  return (
    <RNSAV
      style={{
        flex: 1,
        padding: spacing[5],
        backgroundColor: colors.background,
      }}
    >
      <Text className="text-xl font-bold text-success">
        Welcome to Nativewind!
      </Text>

      <Link href="/(auth)/sign-in" asChild>
        <TouchableOpacity className="mt-4 rounded-md bg-primary p-4 shadow-md">
          <Text className="text-white">Sign In</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/(auth)/sign-up" asChild>
        <TouchableOpacity className="mt-4 rounded-md bg-primary p-4 shadow-md">
          <Text className="text-white">Sign Up</Text>
        </TouchableOpacity>
      </Link>

      <View>
        <Link
          href={{ pathname: "/subscriptions/[id]", params: { id: "Spotify" } }}
          asChild
        >
          <TouchableOpacity className="mt-4 rounded-md bg-primary p-4 shadow-md">
            <Text className="text-white">Spotify</Text>
          </TouchableOpacity>
        </Link>
        <Link
          href={{ pathname: "/subscriptions/[id]", params: { id: "Netflix" } }}
          asChild
        >
          <TouchableOpacity className="mt-4 rounded-md bg-primary p-4 shadow-md">
            <Text className="text-white">Netflix</Text>
          </TouchableOpacity>
        </Link>
        <Link
          href={{ pathname: "/subscriptions/[id]", params: { id: "Disney+" } }}
          asChild
        >
          <TouchableOpacity className="mt-4 rounded-md bg-primary p-4 shadow-md">
            <Text className="text-white">Disney+</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </RNSAV>
  );
}
