const launchesDatabase = require("./launches.mongo");
const planets = require("./planets.mongo");
const launches = new Map();
const axios = require("axios");
const DEFAULT_FLIGHT_NUMBER = 100;
// const launch = {
//   flightNumber: 100, // flight_number
//   mission: "Keppler Exploration X", //name
//   rocket: "explorer IS1", //exist correstponds to rocket.name
//   launchDate: new Date("December 27, 2040"), //date_local
//   target: "Kepler-442 b", // not applicable
//   customer: ["ZTM", "NASA"], //payload.customers
//   upcoming: true, //upcoming
//   success: true, //success
// };

// saveLaunch(launch);

async function findLaunch(filter) {
  return await launchesDatabase.findOne(filter);
}

const SPACEX_URL = "https://api.spacexdata.com/v4/launches/query";

async function populateLaunches() {
  console.log("loading from space x api");
  const response = await axios.post(SPACEX_URL, {
    query: {},
    pagination: false,
    options: {
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });
  if (response.status !== 200) {
    console.log("Problem downloading launch data");
    throw new Error("Launch data download error");
  }

  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc["payloads"];

    const customer = payloads.flatMap((payload) => {
      return payload["customers"];
    });

    const launch = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocket: launchDoc["rocket"]["name"],
      launchDate: launchDoc["date_local"],
      upcoming: launchDoc["upcoming"],
      success: launchDoc["success"],
      customer,
    };
    console.log(`${launch.flightNumber} ${launch.mission}`);
    await saveLaunch(launch);
  }
}

async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });
  if (firstLaunch) {
    console.log("Launch Data already loaded");
  } else {
    await populateLaunches();
  }
}
// launches.set(launch.flightNumber, launch);

async function abortLaunchById(launchID) {
  const aborted = await launchesDatabase.updateOne(
    {
      flightNumber: launchID,
    },
    {
      upcoming: false,
      success: false,
    }
  );
  return aborted.modifiedCount === 1;
  // const aborted = launches.get(launchID);
  // aborted.upcoming = false;
  // aborted.success = false;
  // return aborted;
}

async function getLatestFlightNumber() {
  const latestLaunch = await launchesDatabase.findOne().sort("-flightNumber");
  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }

  return latestLaunch.flightNumber;
}

async function scheduleNewLaunch(launch) {
  const planet = await planets.findOne({
    kepler_name: launch.target,
  });

  if (!planet) {
    throw new Error("No matching planet is find");
  }
  const newFlightNumber = (await getLatestFlightNumber()) + 1;
  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customer: ["ZTM", "NASA"],
    flightNumber: newFlightNumber,
  });

  await saveLaunch(newLaunch);
}

// function addNewLaunches(launch) {
//   latestFlightNumber++;
//   launches.set(
//     latestFlightNumber,
//     Object.assign(launch, {
//       upcoming: true,
//       success: true,
//       customers: ["ZTM", "NASA"],
//       flightNumber: latestFlightNumber,
//     })
//   );
// }

async function existsLaunchWithId(launchID) {
  return await findLaunch({
    flightNumber: launchID,
  });
}

async function getAllLaunches(skip, limit) {
  return await launchesDatabase
    .find(
      {},
      {
        _id: 0,
        __v: 0,
      }
    )
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
}

async function saveLaunch(launch) {
  await launchesDatabase.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}

module.exports = {
  loadLaunchData,
  existsLaunchWithId,
  getAllLaunches,
  scheduleNewLaunch,
  abortLaunchById,
};
