const events = {
  event_id: "not null auto increment",
  title: "varchar(45)",
  startTime: "dateTime",
  endTime: "dateTime",
  description: "text",
  location: "varchar(45)",
  status: "varchar(45)",
};
//in manage page
const subscriptions = {
  subscription_id: "not null auto increment",
  subcription_name: "varchar(45)",
  active: "0/1",
};

const subscriptionTimings = {
  subscriptionTimings_id: "not null auto increment",
  subscriptions_id: "fk_subscriptions.userSubscriptions_id",
  dayOfTheWeek: "not null",
  startTime: "time not null",
  endTime: "time not null",
};

const loggedSupscriptionEvents = {
  loggedSupscriptionEvent_id: "not null auto increment",
  userSubscriptions_id: "fk_userSubscriptions.userSubscriptions_id",
  startTime: "dateTime not null",
  endTime: "dateTime not null",
  eventDataId: "link to eventDataTable",
};

const BlockTypes = {
  oneOff: {
    type: "oneOff",
    startTime: "dateTime",
    endTime: "dateTime",
    title: "title",
    description: "description",
    meeting: "y/n",
  },
  sleep: {
    type: "rSleep",
    startTime: "dateTime",
    endTime: "dateTime",
    title: "sleep",
    downTime: "-startTime",
  },
  work: {
    type: "work",
    startTime: "dateTime",
    endTime: "dateTime",
    title: "work",
    wfh: "y/n",
  },
  exercise: {
    type: "exercise",
    workoutType: "calisthenics, weights (PPL), cardio",
    repeatDays: "mon-sun",
    exercises: "custom exercise + sets and reps",
    cardio: "input for cardio metrics - distance, time",
    startTime: "dateTime",
    endTime: "dateTime",
    title: "exercise",
    location: "location",
    commuteTo: "-startTime",
    commuteFrom: "+endTime",
    type: "type",
  },
  nutrition: {
    mealCount: "number",
    macros: "from calculations",
  },
};
