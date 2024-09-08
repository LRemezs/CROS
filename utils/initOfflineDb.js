export const createTables = (db) => {
  db.transaction(
    (tx) => {
      // Create the events table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS events (
          eventId INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE,
          title TEXT NOT NULL,
          startTime BLOB NOT NULL,
          endTime BLOB NOT NULL,
          description TEXT NOT NULL,
          location TEXT,
          status TEXT NOT NULL,
          type TEXT NOT NULL DEFAULT 'oneOff'
        )`
      );

      // Create subscriptions table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS subscriptions (
          subscriptionId INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE,
          subscriptionName TEXT NOT NULL,
          active INTEGER NOT NULL DEFAULT 0
        )`
      );

      // Create subscriptionTimings table linked to subscriptions table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS subscriptionTimings (
          subscriptionTimingId INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE,
          subscriptionId INTEGER NOT NULL,
          dayOfTheWeek INTEGER NOT NULL,   -- 0 for Sunday, 1 for Monday, etc.
          startTime TEXT NOT NULL,         -- Time format HH:MM 
          endTime TEXT NOT NULL,           -- Time format HH:MM 
          FOREIGN KEY(subscriptionId) REFERENCES subscriptions(subscriptionId) ON DELETE CASCADE
        )`
      );
    },
    (error) => {
      console.error("Error creating tables:", error);
    },
    () => {
      console.log("Tables created successfully.");
      insertDefaultSubscriptions(db); // Call function to insert default values after table creation
    }
  );
};

// Insert default subscriptions after table creation
const insertDefaultSubscriptions = (db) => {
  db.transaction((tx) => {
    tx.executeSql(
      `SELECT COUNT(*) AS count FROM subscriptions`,
      [],
      (_, { rows }) => {
        if (rows.item(0).count === 0) {
          const defaultSubscriptions = [
            "work",
            "sleep",
            "exercise",
            "pomodoro",
          ];
          defaultSubscriptions.forEach((subscription) => {
            tx.executeSql(
              `INSERT INTO subscriptions (subscriptionName, active) VALUES (?, ?)`,
              [subscription, 0]
            );
          });
          console.log("Default subscriptions inserted.");
        }
      },
      (txObj, error) => {
        console.error("Error checking subscriptions table:", error);
      }
    );
  });
};

// Function to check if the tables exist
export const verifyTables = (db) => {
  db.transaction((tx) => {
    // Check for events table
    tx.executeSql(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='events'`,
      [],
      (_, { rows }) => {
        if (rows.length > 0) {
          console.log("Events table is present.");
        } else {
          console.error("Events table is missing.");
        }
      },
      (txObj, error) => {
        console.error("Error checking for events table:", error);
      }
    );

    // Check for subscriptions table
    tx.executeSql(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='subscriptions'`,
      [],
      (_, { rows }) => {
        if (rows.length > 0) {
          console.log("Subscriptions table is present.");
        } else {
          console.error("Subscriptions table is missing.");
        }
      },
      (txObj, error) => {
        console.error("Error checking for subscriptions table:", error);
      }
    );

    // Check for subscriptionTimings table
    tx.executeSql(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='subscriptionTimings'`,
      [],
      (_, { rows }) => {
        if (rows.length > 0) {
          console.log("SubscriptionTimings table is present.");
        } else {
          console.error("SubscriptionTimings table is missing.");
        }
      },
      (txObj, error) => {
        console.error("Error checking for subscriptionTimings table:", error);
      }
    );
  });
};
