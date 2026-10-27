import { formatCurrency } from "@/lib/utils";
import React from "react";
import { Image, Text, View } from "react-native";

const UpComingSubscriptionCard = ({
  data: { name, price, icon, daysLeft, currency },
}: {
  data: UpcomingSubscription;
}) => {
  return (
    <View className="mr-4 w-44 rounded-2xl border border-black/10 bg-background p-4">
      <View className="flex-row items-center gap-3">
        <Image source={icon} className="size-14" />
        <View style={{ flex: 1 }}>
          <Text
            numberOfLines={1}
            className="text-lg font-sans-bold text-primary"
          >
            {formatCurrency(price, currency)}
          </Text>
          <Text
            numberOfLines={2}
            className="text-sm font-sans-semibold text-muted-foreground"
          >
            {name} - {daysLeft} days left
          </Text>
        </View>
      </View>
      <Text
        numberOfLines={1}
        className="mt-2 text-lg font-sans-bold text-primary"
      >
        {name}
      </Text>
    </View>
  );
};

export default UpComingSubscriptionCard;
