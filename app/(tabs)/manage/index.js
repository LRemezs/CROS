import * as SQLite from "expo-sqlite/legacy";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ExerciseSettings,
  PomodoroSettings,
  WorkSettings,
} from "../../../components/SubscriptionSettings"; // Ensure you import the settings components
import { SleepSettings } from "../../../components/subscriptionSettings/sleepSettings";
import { capitalizeFirstLetter } from "../../../utils/qol";

export default function Manage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [expandedSubscription, setExpandedSubscription] = useState(null); // Track expanded subscription
  const [activeStatus, setActiveStatus] = useState({}); // Track active status of each subscription

  const db = SQLite.openDatabase("userData1.db");
  // Fetch subscriptions from the database
  useEffect(() => {
    setTimeout(() => {
      fetchSubscriptions();
    }, 1000); // Delay the transaction by 1 second
  }, []);

  const fetchSubscriptions = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM subscriptions",
        [],
        (_, { rows: { _array } }) => {
          const sortedSubscriptions = _array.sort(
            (a, b) => b.active - a.active
          );
          setSubscriptions(sortedSubscriptions);

          const activeStatusMap = sortedSubscriptions.reduce((acc, item) => {
            acc[item.subscriptionId] = item.active === 1;
            return acc;
          }, {});
          setActiveStatus(activeStatusMap);
        },
        (txObj, error) => {
          console.error("Error fetching subscriptions:", error);
        }
      );
    });
  };

  // Toggle active status for a specific subscription and reorder the list
  const toggleActiveStatus = (subscriptionId, subscriptionName) => {
    const newValue = !activeStatus[subscriptionId] ? 1 : 0;

    setActiveStatus((prevState) => ({
      ...prevState,
      [subscriptionId]: !prevState[subscriptionId],
    }));

    db.transaction((tx) => {
      // Update the active status in the subscriptions table
      tx.executeSql(
        "UPDATE subscriptions SET active = ? WHERE subscriptionId = ?",
        [newValue, subscriptionId],
        () => {
          console.log("Active status toggled");
          fetchSubscriptions(); // Re-fetch and reorder the subscriptions after updating
        },
        (txObj, error) => {
          console.error("Error updating subscription:", error);
        }
      );

      if (newValue === 1) {
        // Add default entries to the SubscriptionTimings table for each day of the week
        const daysOfWeek = [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ];
        const startTime = "08:00"; // Hardcoded start time
        const endTime = "17:00"; // Hardcoded end time

        daysOfWeek.forEach((day) => {
          tx.executeSql(
            `INSERT INTO SubscriptionTimings (subscriptionId, dayOfTheWeek, startTime, endTime) VALUES (?, ?, ?, ?)`,
            [subscriptionId, day, startTime, endTime],
            () => console.log(`Timing entry added for ${day}`),
            (txObj, error) =>
              console.error(`Error adding timing entry for ${day}:`, error)
          );
        });
      } else {
        // Remove the entries in the SubscriptionTimings table for the subscription when inactive
        tx.executeSql(
          `DELETE FROM SubscriptionTimings WHERE subscriptionId = ?`,
          [subscriptionId],
          () => console.log("Subscription timings removed"),
          (txObj, error) =>
            console.error("Error deleting subscription timings:", error)
        );
      }
    });
  };

  // Render the appropriate settings component based on subscription type and active status
  const renderSettings = (subscriptionType, isActive) => {
    if (!isActive) {
      return (
        <Text style={styles.inactiveMessage}>
          Settings unavailable for inactive subscriptions
        </Text>
      );
    }

    switch (subscriptionType) {
      case "sleep":
        return <SleepSettings />;
      case "work":
        return <WorkSettings />;
      case "exercise":
        return <ExerciseSettings />;
      case "pomodoro":
        return <PomodoroSettings />;
      default:
        return null;
    }
  };

  const renderItem = ({ item }) => (
    <View>
      <View style={styles.subscriptionRow}>
        <TouchableOpacity
          style={styles.subscriptionTouchable}
          onPress={() => toggleExpanded(item.subscriptionId)}
        >
          <Text style={styles.subscriptionText}>
            {capitalizeFirstLetter(item.subscriptionName)}
          </Text>
        </TouchableOpacity>
        <Switch
          value={activeStatus[item.subscriptionId]}
          onValueChange={() =>
            toggleActiveStatus(item.subscriptionId, item.subscriptionName)
          }
        />
      </View>

      {/* Render settings only when the subscription is expanded */}
      {expandedSubscription === item.subscriptionId &&
        renderSettings(
          item.subscriptionName,
          activeStatus[item.subscriptionId]
        )}
    </View>
  );

  // Toggle which subscription is expanded to show settings
  const toggleExpanded = (subscriptionId) => {
    setExpandedSubscription(
      expandedSubscription === subscriptionId ? null : subscriptionId
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={subscriptions}
        keyExtractor={(item) => item.subscriptionId.toString()}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  subscriptionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    backgroundColor: "#fff",
  },
  subscriptionTouchable: {
    flex: 1,
  },
  subscriptionText: {
    fontSize: 18,
    color: "#333",
  },
});
