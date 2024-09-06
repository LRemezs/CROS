import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";

export default function Layout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: "Profile",
          tabBarLabelStyle: { color: "#7CB9E8" },
          headerShown: false,
          tabBarIcon: ({ focused }) =>
            focused ? (
              <AntDesign name="profile" size={24} color="black" />
            ) : (
              <AntDesign name="profile" size={24} color="#7CB9E8" />
            ),
        }}
      />
      <Tabs.Screen
        name="manage"
        options={{
          tabBarLabel: "Manage",
          tabBarLabelStyle: { color: "#7CB9E8" },
          headerShown: false,
          tabBarIcon: ({ focused }) =>
            focused ? (
              <MaterialIcons name="manage-accounts" size={24} color="black" />
            ) : (
              <MaterialIcons name="manage-accounts" size={24} color="#7CB9E8" />
            ),
        }}
      />
      <Tabs.Screen
        name="today"
        options={{
          tabBarLabel: "Today",
          tabBarLabelStyle: { color: "#7CB9E8" },
          headerShown: false,
          tabBarIcon: ({ focused }) =>
            focused ? (
              <MaterialCommunityIcons
                name="calendar-today"
                size={24}
                color="black"
              />
            ) : (
              <MaterialCommunityIcons
                name="calendar-today"
                size={24}
                color="#7CB9E8"
              />
            ),
        }}
      />
      <Tabs.Screen
        name="track"
        options={{
          tabBarLabel: "Track",
          tabBarLabelStyle: { color: "#7CB9E8" },
          headerShown: false,
          tabBarIcon: ({ focused }) =>
            focused ? (
              <FontAwesome6 name="award" size={24} color="black" />
            ) : (
              <FontAwesome6 name="award" size={24} color="#7CB9E8" />
            ),
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          tabBarLabel: "Nutrition",
          tabBarLabelStyle: { color: "#7CB9E8" },
          headerShown: false,
          tabBarIcon: ({ focused }) =>
            focused ? (
              <MaterialCommunityIcons
                name="nutrition"
                size={24}
                color="black"
              />
            ) : (
              <MaterialCommunityIcons
                name="nutrition"
                size={24}
                color="#7CB9E8"
              />
            ),
        }}
      />
    </Tabs>
  );
}
