require('dotenv').config();
const PORT = process.env.PORT || 8000;

const http = require("http");

const app = require("./app");
const { mongoConnect } = require("./services/mongo");
const { loadLaunchData } = require("./models/launches.model");

const { LoadPlantesData } = require("./models/planets.model");
const server = http.createServer(app);

async function startServer() {
  await mongoConnect();
  await LoadPlantesData();
  await loadLaunchData();
  server.listen(PORT, () => {
    console.log(`Listen on port ${PORT}...`);
  });
}

startServer();
// app.listen(PORT);
