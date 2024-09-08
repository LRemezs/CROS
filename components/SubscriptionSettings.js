import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

// WorkSettings Component
export const WorkSettings = () => {
  return (
    <View style={styles.settingsContainer}>
      <Text style={styles.settingsTitle}>Work Settings</Text>
      <TextInput style={styles.input} placeholder="Work Duration (hours)" />
      <TextInput style={styles.input} placeholder="Break Duration (minutes)" />
    </View>
  );
};

// ExerciseSettings Component
export const ExerciseSettings = () => {
  return (
    <View style={styles.settingsContainer}>
      <Text style={styles.settingsTitle}>Exercise Settings</Text>
      <TextInput
        style={styles.input}
        placeholder="Exercise Duration (minutes)"
      />
      <TextInput style={styles.input} placeholder="Intensity Level" />
    </View>
  );
};

// PomodoroSettings Component
export const PomodoroSettings = () => {
  return (
    <View style={styles.settingsContainer}>
      <Text style={styles.settingsTitle}>Pomodoro Settings</Text>
      <TextInput
        style={styles.input}
        placeholder="Pomodoro Duration (minutes)"
      />
      <TextInput style={styles.input} placeholder="Break Duration (minutes)" />
    </View>
  );
};

// Styles for the settings forms
const styles = StyleSheet.create({
  settingsContainer: {
    padding: 10,
    backgroundColor: "#f0f0f0",
  },
  settingsTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  presetContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
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
  dayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  dayText: {
    fontSize: 16,
    width: 80,
  },
  timeButton: {
    backgroundColor: "#e0e0e0",
    padding: 10,
    borderRadius: 5,
  },
  modalView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalTitle: {
    fontSize: 22,
    color: "#fff",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#fff",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    width: 200,
  },
  modalButtonText: {
    textAlign: "center",
    fontSize: 16,
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
});
