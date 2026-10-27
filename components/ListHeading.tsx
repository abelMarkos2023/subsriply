import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const ListHeading = ({ title }: { title: string }) => {
  return (
    <View className="my-5 flex-row items-center justify-between">
      <Text className="text-2xl font-sans-bold text-primary">{title}</Text>
      <TouchableOpacity className="rounded-full border border-black/20 px-4 py-1">
        <Text className="text-lg font-sans-semibold text-primary">
          View All
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ListHeading;
