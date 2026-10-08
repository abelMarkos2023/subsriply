import { Tabs } from "expo-router";
import React from "react";

import { tabs } from "@/constants/data";
import { colors, components } from "@/constants/theme";
import { Image, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const tabBar = components.tabBar;
  const TabIcon = ({ focused, icon }: TabIconProps) => {
    return (
      <View
        style={{
          width: tabBar.iconFrame,
          height: tabBar.iconFrame,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: tabBar.iconFrame,
            height: tabBar.iconFrame,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: tabBar.iconFrame / 2,
            backgroundColor: focused ? colors.accent : "transparent",
          }}
        >
          <Image source={icon} style={{ width: 20, height: 20 }} />
        </View>
      </View>
    );
  };
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,

        tabBarStyle: {
          position: "absolute",
          bottom: Math.max(insets.bottom, tabBar.horizontalInset),
          height: tabBar.height,
          marginHorizontal: tabBar.horizontalInset,
          borderRadius: tabBar.radius,
          backgroundColor: colors.primary,
          borderTopWidth: 0,
          elevation: 0,
        },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          name={tab.name}
          key={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={tab.icon} />
            ),
          }}
        />
      ))}

      <Tabs.Screen name="subscriptions/[id]" options={{ href: null }} />
    </Tabs>
  );
}
