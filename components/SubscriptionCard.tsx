import {
  formatCurrency,
  formatStatusLabel,
  formatSubscriptionDateTime,
} from "@/lib/utils";
import { clsx } from "clsx";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";
export default function SubscriptionCard({
  name,
  price,
  currency,
  billing,
  icon,
  color,
  category,
  plan,
  renewalDate,
  expanded,
  onPress,
  paymentMethod,
  startDate,
  status,
}: SubscriptionCardProps) {
  return (
    <Pressable
      className={clsx(
        "rounded-2xl",
        "border",
        "border-border",
        "p-4",
        expanded ? "bg-card" : "color-[#8fd1bd]",
      )}
      style={!expanded && color ? { backgroundColor: color } : {}}
      onPress={onPress}
    >
      <View className="flex-row items-center py-2">
        <View className="min-w-0 flex-1 flex-row items-center gap-3">
          <Image source={icon} className="size-16 rounded-lg" />
          <View className="min-w-0 flex-1">
            <Text
              numberOfLines={1}
              className="mb-1 text-lg font-sans-bold text-primary"
            >
              {name}
            </Text>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              className="text-sm font-sans-medium text-muted-foreground"
            >
              {category?.trim() ||
                plan?.trim() ||
                (renewalDate && formatSubscriptionDateTime(renewalDate)) ||
                "No details available"}
            </Text>
          </View>
        </View>
        <View className="ml-3 shrink-0 items-end">
          <Text
            numberOfLines={1}
            className="mb-1 text-lg font-sans-bold text-primary"
          >
            {formatCurrency(price, currency)}
          </Text>
          <Text
            numberOfLines={1}
            className="text-sm font-sans-medium text-muted-foreground"
          >
            {billing}
          </Text>
        </View>
      </View>
      {expanded && (
        <View className="mt-6 gap-4">
          <View className="gap-6">
            {/* First Row */}
            <View className="flex-row items-center justify-between gap-3">
              <View className="min-w-0 flex-1 flex-row items-center gap-2">
                <Text className="shrink-0 text-base font-sans-medium text-muted-foreground">
                  Payment Method
                </Text>
                <Text className="flex-1 font-sans-bold text-primary">
                  {paymentMethod || "N/A"}
                </Text>
              </View>
            </View>
            {/* Second Row */}
            <View className="flex-row items-center justify-between gap-3">
              <View className="min-w-0 flex-1 flex-row items-center gap-2">
                <Text className="shrink-0 text-base font-sans-medium text-muted-foreground">
                  Category
                </Text>
                <Text className="flex-1 font-sans-bold text-primary">
                  {category || plan || "N/A"}
                </Text>
              </View>
            </View>
            {/* Third Row */}
            <View className="flex-row items-center justify-between gap-3">
              <View className="min-w-0 flex-1 flex-row items-center gap-2">
                <Text className="shrink-0 text-base font-sans-medium text-muted-foreground">
                  Renewal Date
                </Text>
                <Text className="flex-1 font-sans-bold text-primary">
                  {formatSubscriptionDateTime(renewalDate) || "N/A"}
                </Text>
              </View>
            </View>
            {/* Fourth Row */}
            <View className="flex-row items-center justify-between gap-3">
              <View className="min-w-0 flex-1 flex-row items-center gap-2">
                <Text className="shrink-0 text-base font-sans-medium text-muted-foreground">
                  Start Date
                </Text>
                <Text className="flex-1 font-sans-bold text-primary">
                  {formatSubscriptionDateTime(startDate) || "N/A"}
                </Text>
              </View>
            </View>
            {/* Fifth Row */}
            <View className="flex-row items-center justify-between gap-3">
              <View className="min-w-0 flex-1 flex-row items-center gap-2">
                <Text className="shrink-0 text-base font-sans-medium text-muted-foreground">
                  Status
                </Text>
                <Text className="flex-1 font-sans-bold text-primary">
                  {formatStatusLabel(status) || "N/A"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </Pressable>
  );
}
