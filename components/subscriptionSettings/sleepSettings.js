import AntDesign from "@expo/vector-icons/AntDesign";
import * as SQLite from "expo-sqlite/legacy"; // Import SQLite for database interactions
import React, { useEffect, useState } from "react";
import {
  Modal,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const db = SQLite.openDatabase("userData1.db"); // Open the database

export const SleepSettings = () => {
  const initialTime = { bedtime: "22:00", waketime: "07:00" }; // Default times in HH:MM format
  const [times, setTimes] = useState({
    monday: initialTime,
    tuesday: initialTime,
    wednesday: initialTime,
    thursday: initialTime,
    friday: initialTime,
    saturday: initialTime,
    sunday: initialTime,
  });

  const [presetTimes, setPresetTimes] = useState({
    bedtime: "22:00",
    waketime: "07:00",
  });

  const [presetModalVisible, setPresetModalVisible] = useState(false); // Modal for presets
  const [windDownEnabled, setWindDownEnabled] = useState(false); // Wind down time state
  const [windDownDuration, setWindDownDuration] = useState("30"); // Wind down duration

  // Fetch times from SubscriptionTimings table when the component loads
  useEffect(() => {
    db.transaction((tx) => {
      const daysOfWeek = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ];
      daysOfWeek.forEach((day) => {
        tx.executeSql(
          `SELECT startTime, endTime FROM SubscriptionTimings WHERE dayOfTheWeek = ?`,
          [day],
          (_, { rows }) => {
            if (rows.length > 0) {
              const { startTime, endTime } = rows.item(0);
              setTimes((prevTimes) => ({
                ...prevTimes,
                [day]: { waketime: startTime, bedtime: endTime },
              }));
            }
          },
          (txObj, error) => {
            console.error(`Error fetching timings for ${day}:`, error);
          }
        );
      });
    });
  }, []);

  // Update the wake or bed time for a specific day
  const updateTime = (day, type, value) => {
    setTimes((prevTimes) => ({
      ...prevTimes,
      [day]: {
        ...prevTimes[day],
        [type]: value,
      },
    }));
  };

  // Apply preset times to specified days
  const applyPreset = (days) => {
    setTimes((prevTimes) => {
      const updatedTimes = { ...prevTimes };
      days.forEach((day) => {
        updatedTimes[day] = { ...presetTimes };
      });
      return updatedTimes;
    });
    setPresetModalVisible(false); // Close modal
  };

  // Handle SubmitSettings
  const handleSubmitSettings = () => {
    db.transaction((tx) => {
      // First, ensure the SleepData table exists
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS SleepData (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          windDownActive INTEGER,
          windDownDuration INTEGER
        )`,
        [],
        () => console.log("SleepData table created or already exists"),
        (txObj, error) =>
          console.error("Error creating SleepData table:", error)
      );

      // Insert or update the wind-down status and duration in the SleepData table
      const windDownActive = windDownEnabled ? 1 : 0;

      tx.executeSql(
        `INSERT OR REPLACE INTO SleepData (id, windDownActive, windDownDuration)
         VALUES (1, ?, ?)`,
        [windDownActive, windDownDuration],
        () => console.log("Inserted wind-down data into SleepData"),
        (txObj, error) =>
          console.error("Error inserting wind-down data:", error)
      );

      // Then update SubscriptionTimings table with the new times for each day
      const daysOfWeek = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ];

      daysOfWeek.forEach((day) => {
        const { waketime, bedtime } = times[day];

        tx.executeSql(
          `UPDATE SubscriptionTimings SET startTime = ?, endTime = ? WHERE dayOfTheWeek = ?`,
          [bedtime, waketime, day],
          () => console.log(`Updated timings for ${day}`),
          (txObj, error) =>
            console.error(`Error updating timings for ${day}:`, error)
        );
      });
    });
  };

  const presetOptions = [
    {
      label: "Weekdays",
      days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    },
    { label: "Weekends", days: ["saturday", "sunday"] },
    {
      label: "All Week",
      days: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ],
    },
  ];

  const shortDayNames = {
    monday: "Mon",
    tuesday: "Tue",
    wednesday: "Wed",
    thursday: "Thu",
    friday: "Fri",
    saturday: "Sat",
    sunday: "Sun",
  };

  return (
    <View style={styles.settingsContainer}>
      <Text style={styles.settingsTitle}>Sleep Settings</Text>

      {/* Preset Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={presetModalVisible}
        onRequestClose={() => setPresetModalVisible(false)} // This makes sure that pressing the back button will close the modal on Android
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setPresetModalVisible(false)} // Correct closing logic
              >
                <AntDesign name="closecircle" size={24} color="black" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Set Preset Times</Text>
            </View>

            {/* Wake Time and Bed Time Inputs */}
            <View style={styles.presetTimeRow}>
              <Text>Wake Time:</Text>
              <TextInput
                style={styles.timeInput}
                value={presetTimes.waketime}
                onChangeText={(text) =>
                  setPresetTimes((prev) => ({ ...prev, waketime: text }))
                }
                keyboardType="numeric"
                placeholder="HH:MM"
              />
            </View>
            <View style={styles.presetTimeRow}>
              <Text>Bed Time:</Text>
              <TextInput
                style={styles.timeInput}
                value={presetTimes.bedtime}
                onChangeText={(text) =>
                  setPresetTimes((prev) => ({ ...prev, bedtime: text }))
                }
                keyboardType="numeric"
                placeholder="HH:MM"
              />
            </View>

            {/* Apply to Weekdays/Weekends/All Week */}
            {presetOptions.map((preset) => (
              <TouchableOpacity
                key={preset.label}
                style={styles.presetApplyButton}
                onPress={() => applyPreset(preset.days)}
              >
                <Text style={styles.presetApplyButtonText}>
                  Apply to {preset.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Open Preset Modal Button */}
      <TouchableOpacity
        style={styles.presetOpenButton}
        onPress={() => setPresetModalVisible(true)}
      >
        <Text style={styles.presetOpenButtonText}>Set Preset Times</Text>
      </TouchableOpacity>

      {/* Wind Down Time Section */}
      <View style={styles.windDownRow}>
        <Text style={styles.windDownLabel}>Wind Down Time</Text>
        <Switch
          value={windDownEnabled}
          onValueChange={() => setWindDownEnabled((prev) => !prev)}
        />
      </View>

      {windDownEnabled && (
        <View style={styles.windDownTimeInput}>
          <Text style={styles.windDownText}>Minutes before bed:</Text>
          <TextInput
            style={styles.windDownInput}
            value={windDownDuration}
            onChangeText={setWindDownDuration}
            keyboardType="numeric"
          />
        </View>
      )}

      {/* Table Header for Wake and Bed columns */}
      <View style={styles.headerRow}>
        <Text style={styles.headerCell}>Day</Text>
        <Text style={styles.headerCell}>Wake</Text>
        <Text style={styles.headerCell}>Bed</Text>
      </View>

      {/* Display Times for Each Day */}
      {Object.keys(times).map((day) => (
        <View key={day} style={styles.dayRow}>
          <Text style={styles.dayText}>{shortDayNames[day]}</Text>
          <TextInput
            style={styles.timeInput}
            value={times[day].waketime}
            onChangeText={(text) => updateTime(day, "waketime", text)}
            keyboardType="numeric"
            placeholder="HH:MM"
          />
          <TextInput
            style={styles.timeInput}
            value={times[day].bedtime}
            onChangeText={(text) => updateTime(day, "bedtime", text)}
            keyboardType="numeric"
            placeholder="HH:MM"
          />
        </View>
      ))}

      {/* Submit Button */}
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmitSettings}
      >
        <Text style={styles.submitButtonText}>Submit Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  settingsContainer: {
    padding: 10,
    backgroundColor: "#f0f0f0",
  },
  settingsTitle: {
    fontSize: 18,
    marginBottom: 20,
  },
  presetOpenButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  presetOpenButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  headerCell: {
    fontSize: 16,
    width: "30%",
    textAlign: "center",
  },
  dayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  dayText: {
    fontSize: 16,
    width: "30%",
  },
  timeInput: {
    backgroundColor: "#e0e0e0",
    padding: 10,
    borderRadius: 5,
    width: "30%",
    textAlign: "center",
  },
  windDownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  windDownLabel: {
    fontSize: 16,
  },
  windDownTimeInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  windDownText: {
    fontSize: 16,
  },
  windDownInput: {
    backgroundColor: "#e0e0e0",
    padding: 5,
    borderRadius: 5,
    width: 50,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  modalView: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignItems: "center",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  modalCloseButton: {
    padding: 5,
    alignSelf: "flex-start",
  },
  modalTitle: {
    fontSize: 22,
    textAlign: "center",
    flex: 1,
    marginLeft: -20, // to center the text, compensating for the close button
  },
  presetTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  presetApplyButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: 200,
  },
  presetApplyButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
  },
  submitButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
  },
});
