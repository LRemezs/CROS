import AntDesign from "@expo/vector-icons/AntDesign";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as SQLite from "expo-sqlite/legacy";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Swiper from "react-native-swiper";
import { createTables, verifyTables } from "../../../utils/initOfflineDb.js";
import { capitalizeFirstLetter } from "../../../utils/qol.js";

const { width } = Dimensions.get("window");

export default function Today() {
  const db = SQLite.openDatabase("userData1.db");
  const swiper = useRef();
  const [value, setValue] = useState(new Date()); // selected date
  const [week, setWeek] = useState(0); // selected week
  const [show, setShow] = useState(false); // Controls if the DatePicker is visible
  const [selectedDate, setSelectedDate] = useState(new Date()); // Stores the selected date
  const [dbEvents, setDbEvents] = useState([]); // users oneOff events from DB
  const [generatedEvents, setGeneratedEvents] = useState([]); // Events generated from SubscriptionTimings

  //Initial DB transactions (create relevant tables for user data)
  useEffect(() => {
    createTables(db);
    verifyTables(db);
  }, []);

  // Fetch events from the database and generate subscription-based events when the date changes
  useEffect(() => {
    fetchDbEvents();
    generateSubscriptionEvents();
  }, [value]);

  // Fetch one-off events from the 'events' table
  const fetchDbEvents = () => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM events WHERE date(startTime) = ?`,
        [moment(value).format("YYYY-MM-DD")],
        (_, { rows: { _array } }) => {
          setDbEvents(_array);
        },
        (txObj, error) => console.error("Error fetching events:", error)
      );
    });
  };

  const generateSubscriptionEvents = () => {
    const selectedDay = moment(value).format("dddd").toLowerCase(); // e.g., 'monday'
    const nextDay = moment(value).add(1, "day").format("dddd").toLowerCase(); // Get the next day

    db.transaction((tx) => {
      // First, get the timings for the selected day (current day)
      tx.executeSql(
        `SELECT st.startTime AS startTime, st.endTime AS currentEndTime, st.subscriptionId, s.subscriptionName 
         FROM SubscriptionTimings st
         JOIN subscriptions s ON st.subscriptionId = s.subscriptionId
         WHERE st.dayOfTheWeek = ?`,
        [selectedDay],
        (_, { rows: { _array: currentDayData } }) => {
          // Then get the timings for the next day to fetch the correct end time if it's an overnight event
          tx.executeSql(
            `SELECT st.startTime AS nextStartTime, st.endTime AS nextEndTime 
             FROM SubscriptionTimings st
             WHERE st.dayOfTheWeek = ?`,
            [nextDay],
            (_, { rows: { _array: nextDayData } }) => {
              const generated = currentDayData.map((item) => {
                const startDate =
                  moment(value).format("YYYY-MM-DD") + " " + item.startTime;
                let endDate;

                // Check if the event spans overnight
                if (item.startTime > item.currentEndTime) {
                  // Use the next day's end time (wake time)
                  const nextEndTime = nextDayData[0]?.nextEndTime || "07:00"; // Default to "07:00" if next day's end time not found
                  endDate =
                    moment(value).add(1, "day").format("YYYY-MM-DD") +
                    " " +
                    nextEndTime;
                } else {
                  // Use the same day's end time
                  endDate =
                    moment(value).format("YYYY-MM-DD") +
                    " " +
                    item.currentEndTime;
                }

                return {
                  title: item.subscriptionName,
                  startTime: startDate,
                  endTime: endDate,
                  description: "Generated from SubscriptionTimings",
                };
              });
              setGeneratedEvents(generated);
            },
            (txObj, error) =>
              console.error("Error fetching next day timings:", error)
          );
        },
        (txObj, error) =>
          console.error("Error fetching current day timings:", error)
      );
    });
  };

  //Generating weeks
  const weeks = React.useMemo(() => {
    const start = moment().add(week, "weeks").startOf("isoWeek");

    return [-1, 0, 1].map((adj) => {
      return Array.from({ length: 7 }).map((_, index) => {
        const date = moment(start).add(adj, "week").add(index, "day");
        return {
          weekday: date.format("ddd"),
          date: date.toDate(),
        };
      });
    });
  }, [week]);

  const addEvent = () => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO events (title, startTime, endTime, description, location, status) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          "Meeting with team", // Event title
          "2024-09-15 09:00:00", // Start time
          "2024-09-15 10:00:00", // End time
          "Weekly team sync-up", // Description
          "Conference Room A", // Location
          "Scheduled", // Status
        ],
        (txObj, resultSet) => {
          console.log("Event inserted with ID:", resultSet.insertId);
          fetchDbEvents(); // Re-fetch events after adding
        },
        (txObj, error) => console.error("Error inserting event:", error)
      );
    });
  };

  //TEMPORARY UTILITY FUNCTIONS
  const dropAllTables = () => {
    db.transaction((tx) => {
      // Query to get the names of all tables in the database
      tx.executeSql(
        `SELECT name FROM sqlite_master WHERE type='table'`,
        [],
        (_, { rows: { _array } }) => {
          // Loop through each table and drop it
          _array.forEach((table) => {
            if (table.name !== "sqlite_sequence") {
              // 'sqlite_sequence' is used by AUTOINCREMENT, so we don't drop it
              tx.executeSql(
                `DROP TABLE IF EXISTS ${table.name}`,
                [],
                () => {
                  console.log(`Table '${table.name}' dropped successfully`);
                },
                (tx, error) => {
                  console.error(`Error dropping table '${table.name}':`, error);
                }
              );
            }
          });
        },
        (tx, error) => {
          console.error("Error fetching tables:", error);
        }
      );
    });
  };

  // Combine DB and generated events
  const allEvents = [...dbEvents, ...generatedEvents];

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Schedule</Text>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => dropAllTables()} // Clean the db cache
          >
            <AntDesign name="closecircle" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {/* Date picker */}
        <View style={styles.picker}>
          <Swiper
            index={1}
            ref={swiper}
            loop={false}
            showsPagination={false}
            onIndexChanged={(ind) => {
              if (ind === 1) {
                return;
              }
              setTimeout(() => {
                const newIndex = ind - 1;
                const newWeek = week + newIndex;
                setWeek(newWeek);
                setValue(moment(value).add(newIndex, "week").toDate());
                swiper.current.scrollTo(1, false);
              }, 100);
            }}
          >
            {weeks.map((dates, index) => (
              <View style={styles.itemRow} key={index}>
                {dates.map((item, dateIndex) => {
                  const isActive =
                    value.toDateString() === item.date.toDateString();
                  return (
                    <TouchableWithoutFeedback
                      key={dateIndex}
                      onPress={() => setValue(item.date)}
                    >
                      <View
                        style={[
                          styles.item,
                          isActive && {
                            backgroundColor: "#111",
                            borderColor: "#111",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.itemWeekday,
                            isActive && { color: "#fff" },
                          ]}
                        >
                          {item.weekday}
                        </Text>
                        <Text
                          style={[
                            styles.itemDate,
                            isActive && { color: "#fff" },
                          ]}
                        >
                          {item.date.getDate()}
                        </Text>
                      </View>
                    </TouchableWithoutFeedback>
                  );
                })}
              </View>
            ))}
          </Swiper>
        </View>

        {/* Date selection control */}
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={() => {
              const today = new Date();
              setValue(today);
              setWeek(0); // Reset to the current week
            }}
          >
            <View style={styles.smallBtn}>
              <Text style={styles.smallBtnText}>Today</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setShow(true); // Show the DatePicker when the button is pressed
            }}
          >
            <View style={styles.smallBtn}>
              <Text style={styles.smallBtnText}>Pick a Date</Text>
            </View>
          </TouchableOpacity>
          {show && (
            <DateTimePicker
              value={selectedDate}
              mode="date" // Only pick a date (not time)
              display="default" // Display type (can be "spinner", "calendar", etc.)
              onChange={(event, date) => {
                setShow(false); // Close the DatePicker after selecting
                if (date) {
                  setSelectedDate(date); // Update the selected date
                  setValue(date); // Set the selected date in your state

                  // Get the start of the current week and the start of the selected date's week
                  const currentWeekStart = moment().startOf("isoWeek");
                  const selectedWeekStart = moment(date).startOf("isoWeek");

                  // Calculate the difference in weeks between these two dates
                  const weekDifference = selectedWeekStart.diff(
                    currentWeekStart,
                    "weeks"
                  );

                  setWeek(weekDifference); // Update the week based on the actual week difference
                }
              }}
            />
          )}
        </View>

        {/* Main area where either current task (if today) or overall task schedule if other day is visible */}
        <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 24 }}>
          <Text style={styles.subtitle}>{value.toDateString()}</Text>
          <View style={styles.placeholder}>
            <View style={styles.placeholderInset}>
              {/* Display all events (one-off and subscription-based) */}
              {allEvents.map((event, index) => (
                <View key={index} style={styles.eventContainer}>
                  <Text style={styles.eventTitle}>
                    {capitalizeFirstLetter(event.title)}
                  </Text>
                  <Text style={styles.eventTime}>
                    {moment(event.startTime).format("HH:mm")} -{" "}
                    {moment(event.endTime).format("HH:mm")}
                  </Text>
                  <Text style={styles.eventDescription}>
                    {event.description}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={addEvent}>
            <View style={styles.btn}>
              <Text style={styles.btnText}>Schedule</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 24,
  },
  header: {
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1d1d1d",
    marginBottom: 12,
  },
  picker: {
    flex: 1,
    maxHeight: 74,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  subtitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#999999",
    marginBottom: 12,
  },
  footer: {
    marginTop: "auto",
    paddingHorizontal: 16,
  },
  /** Item */
  item: {
    flex: 1,
    height: 50,
    marginHorizontal: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#e3e3e3",
    flexDirection: "column",
    alignItems: "center",
  },
  itemRow: {
    width: width,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  itemWeekday: {
    fontSize: 13,
    fontWeight: "500",
    color: "#737373",
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },
  /** Date selectors */
  controls: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    maxHeight: 20,
  },
  /** Placeholder */
  placeholder: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    height: 400,
    marginTop: 0,
    padding: 0,
    backgroundColor: "transparent",
  },
  placeholderInset: {
    borderWidth: 4,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
    borderRadius: 9,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  /** Button */
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    backgroundColor: "#007aff",
    borderColor: "#007aff",
  },
  btnText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600",
    color: "#fff",
  },
  smallBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 1,
    paddingHorizontal: 20,
    borderWidth: 1,
    backgroundColor: "#007aff",
    borderColor: "#007aff",
  },
  smallBtnText: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "600",
    color: "#fff",
  },
  /** Event display */
  eventContainer: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: "#f5f5f5",
    borderRadius: 5,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  eventTime: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  eventDescription: {
    fontSize: 14,
    color: "#777",
  },
});
