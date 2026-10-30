import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpComingSubscriptionCard from "@/components/UpComingSubscriptionCard";
import {
  HOME_BALANCE,
  HOME_SUBSCRIPTIONS,
  UPCOMING_SUBSCRIPTIONS,
} from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import { colors, spacing } from "@/constants/theme";
import "@/global.css";
import { formatCurrency } from "@/lib/utils";
import { useClerk, useUser } from "@clerk/expo";
import dayjs from "dayjs";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView as RNSAV } from "react-native-safe-area-context";
export default function App() {
  const [subscrptionId, setSubscriptionId] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { signOut } = useClerk();

  const { isLoaded, user } = useUser();
  if (!isLoaded) {
    return (
      <RNSAV
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text>Loading...</Text>
      </RNSAV>
    );
  }
  if (!user) {
    return (
      <RNSAV
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text>No User...</Text>
        <Link href="/(auth)/sign-in" asChild>
          <Pressable>
            <Text>Go to Sign In</Text>
          </Pressable>
        </Link>
      </RNSAV>
    );
  }
  const displayName =
    user?.fullName ??
    user?.firstName ??
    user?.username ??
    user?.primaryEmailAddress?.emailAddress.split("@")[0] ??
    "Welcome";

  const profileImageUrl = user?.imageUrl;
  const profileImageSource = profileImageUrl
    ? { uri: profileImageUrl }
    : images.avatar;

  const toggleExpandedSubscriptionCard = (id: string) => {
    setSubscriptionId((prevId) => (prevId === id ? null : id));
    console.log("pressed", subscrptionId);
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.replace("/(auth)/sign-in");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <RNSAV
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          padding: spacing[5],
          paddingBottom: spacing[10],
        }}
        ListHeaderComponent={
          <View>
            <View className="mb-2.5 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Image
                  source={profileImageSource}
                  className="size-16 rounded-full"
                />
                <Text className="ml-4 text-2xl font-sans-bold text-primary">
                  {displayName}
                </Text>
              </View>
              <View className="flex-row items-center gap-3">
                <Image source={icons.add} className="size-12" />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Sign out"
                  disabled={isSigningOut}
                  onPress={handleSignOut}
                  className="min-h-11 flex-row items-center justify-center gap-1.5 rounded-xl border border-primary/15 px-3"
                >
                  {isSigningOut ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Text className="font-sans-semibold text-sm text-primary">
                      Sign out
                    </Text>
                  )}
                </Pressable>
              </View>
            </View>
            <View className="my-2.5 min-h-50 justify-between gap-5 rounded-bl-4xl rounded-tr-4xl bg-accent p-6">
              <Text className="text-xl font-sans-semibold text-white/80">
                Balance
              </Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-4xl font-sans-extrabold text-white">
                  {formatCurrency(HOME_BALANCE.amount)}
                </Text>
                <Text className="home-balance-date">
                  {dayjs(HOME_BALANCE.nextRenewalDate).format("MMM D, YYYY")}
                </Text>
              </View>
            </View>
            <ListHeading title="All Subscription" />
            <ScrollView
              horizontal
              nestedScrollEnabled
              directionalLockEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: spacing[5] }}
            >
              {UPCOMING_SUBSCRIPTIONS.map((subscription) => (
                <UpComingSubscriptionCard
                  key={subscription.id}
                  data={subscription}
                />
              ))}
            </ScrollView>
            <ListHeading title="Active Subscription" />
          </View>
        }
        keyExtractor={(item) => item.id}
        data={HOME_SUBSCRIPTIONS}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={subscrptionId === item.id}
            onPress={() => toggleExpandedSubscriptionCard(item.id)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing[3] }} />}
        ListFooterComponent={
          <View>
            <View style={{ height: spacing[5] }} />
            <ListHeading title="Upcoming Subscription" />
          </View>
        }
        ListEmptyComponent={<Text>No Subscriptions yet</Text>}
        showsVerticalScrollIndicator={false}
      />
    </RNSAV>
  );
}
