const express = require("express");
const { httpAbortLaunch } = require("./launches.controller");
const {
  httpGetAllLaunches,
  httpAddNewLaunch,
  existsLaunchWithId,
} = require("./launches.controller");
const launchesRouter = express.Router();

launchesRouter.get("/", httpGetAllLaunches);
launchesRouter.post("/", httpAddNewLaunch);
launchesRouter.delete("/:id", httpAbortLaunch);

module.exports = launchesRouter;
