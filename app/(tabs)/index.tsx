import "@/global.css";
import { Link } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function App() {
  return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-xl font-bold text-success">
          Welcome to Nativewind!
        </Text>
          <Link href='/onboarding' className = "mt-4 p-4 rounded-md shadow-md bg-primary text-white">
              Go To Onboarding
          </Link>

          <Link href="/(auth)/sign-in" className = "mt-4 p-4 rounded-md shadow-md bg-primary text-white">
              Sign In
          </Link>
          <Link href="/(auth)/sign-up" className = "mt-4 p-4 rounded-md shadow-md bg-primary text-white">
          Sign Up
      </Link>

      <View >
        <Link href={{ pathname: "/subscriptions/[id]", params: { id: "Spotify" } }} asChild>
          <TouchableOpacity className="mt-4 rounded-md bg-primary p-4 shadow-md">
            <Text className="text-white">Spotify</Text>
          </TouchableOpacity>
        </Link>
        <Link href={{ pathname: "/subscriptions/[id]", params: { id: "Netflix" } }} asChild>
          <TouchableOpacity className="mt-4 rounded-md bg-primary p-4 shadow-md">
            <Text className="text-white">Netflix</Text>
          </TouchableOpacity>
        </Link>
        <Link href={{ pathname: "/subscriptions/[id]", params: { id: "Disney+" } }} asChild>
          <TouchableOpacity className="mt-4 rounded-md bg-primary p-4 shadow-md">
            <Text className="text-white">Disney+</Text>
          </TouchableOpacity>
        </Link>
      </View>
      </View>
  );
}