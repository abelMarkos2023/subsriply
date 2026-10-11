import { colors, spacing } from "@/constants/theme";
import React from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const explore = () => {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        padding: spacing[5],
        backgroundColor: colors.background,
      }}
    >
      <Text>explore</Text>
    </SafeAreaView>
  );
};

export default explore;
