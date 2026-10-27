import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpComingSubscriptionCard from "@/components/UpComingSubscriptionCard";
import {
  HOME_BALANCE,
  HOME_SUBSCRIPTIONS,
  HOME_USER,
  UPCOMING_SUBSCRIPTIONS,
} from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import { colors, spacing } from "@/constants/theme";
import "@/global.css";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";
import { useState } from "react";
import { FlatList, Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView as RNSAV } from "react-native-safe-area-context";
export default function App() {
  const [subscrptionId, setSubscriptionId] = useState<string | null>(null);

  const toggleExpandedSubscriptionCard = (id: string) => {
    setSubscriptionId((prevId) => (prevId === id ? null : id));
    console.log("pressed", subscrptionId);
  };
  return (
    <RNSAV
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: spacing[5],
          paddingBottom: spacing[10],
        }}
      >
        <View className="mb-2.5 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Image source={images.avatar} className="size-16 rounded-full" />
            <Text className="ml-4 text-2xl font-sans-bold text-primary">
              {HOME_USER.name}
            </Text>
          </View>
          <Image source={icons.add} className="size-12" />
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
        <View>
          <ListHeading title="All Subscription" />
          <FlatList
            keyExtractor={(item) => item.id}
            data={UPCOMING_SUBSCRIPTIONS}
            renderItem={({ item }) => <UpComingSubscriptionCard data={item} />}
            horizontal
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => (
              <View style={{ width: spacing[3] }} />
            )}
            ListFooterComponent={() => <View style={{ width: spacing[5] }} />}
            contentContainerClassName="pb-20"
          />
          <ListHeading title="Active Subscription" />
          <FlatList
            ListHeaderComponent={() => <View></View>}
            keyExtractor={(item) => item.id}
            data={HOME_SUBSCRIPTIONS}
            renderItem={({ item }) => (
              <SubscriptionCard
                {...item}
                expanded={subscrptionId === item.id}
                onPress={() => toggleExpandedSubscriptionCard(item.id)}
              />
            )}
            ItemSeparatorComponent={() => (
              <View style={{ height: spacing[3] }} />
            )}
            ListFooterComponent={() => <View style={{ height: spacing[5] }} />}
            ListEmptyComponent={<Text>No Subscriptions yet</Text>}
            showsVerticalScrollIndicator={false}
          />
          <ListHeading title="Upcoming Subscription" />
        </View>
      </ScrollView>
    </RNSAV>
  );
}
