import React from "react";
import { createBottomTabNavigator } from "react-navigation-tabs";
import { View } from "react-native";
import Home from "../screens/Tabs/Home";
import Notification from "../screens/Tabs/Notification";
import Profile from "../screens/Tabs/Profile";
import Search from "../screens/Tabs/Search";
import { createStackNavigator } from "react-navigation-stack";
import { TouchableOpacity } from "react-native-gesture-handler";
import MessagesLink from "../components/MessagesLink";

const stackFactory = (initialRoute, customConfig) =>
  createStackNavigator({
    InitialRoute: {
      screen: initialRoute,
      navigationOptions: { ...customConfig }
    }
  });

export default createBottomTabNavigator({
  Home: {
    screen: stackFactory(Home, {
      title: "Home",
      headerRight: <MessagesLink />
    })
  },
  Notification: {
    screen: stackFactory(Notification, { title: "Notification" })
  },
  Add: {
    screen: View,
    navigationOptions: {
      tabBarOnPress: ({ navigation }) => navigation.navigate("PhotoNavigation")
    }
  },
  Profile: {
    screen: stackFactory(Profile, { title: "Profile" })
  },
  Search: {
    screen: stackFactory(Search, { title: "Search" })
  }
});
