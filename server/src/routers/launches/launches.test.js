const request = require("supertest");
const app = require("../../app");
const { LoadPlantesData } = require("../../models/planets.model");
const { mongoConnect, mongoDisconnect } = require("../../services/mongo");

describe("Launches aPi", () => {
  beforeAll(async () => {
    await mongoConnect();
    await LoadPlantesData();
  });
  afterAll(async () => {
    await mongoDisconnect();
  });
  describe("Test Get /launches", () => {
    test("It should respond with 200 success", async () => {
      const response = await request(app)
        .get("const api = require('./routes/api');/launches")
        .expect("Content-Type", /json/)
        .expect(200);
    });
  });
  describe("Test post /launches", () => {
    const completeLaunchData = {
      mission: "USS Enterprise",
      rocket: "NCC 1701-D",
      target: "Kepler-62 f",
      launchDate: "January 4,2028",
    };
    const completeLaunchDataWithoutDate = {
      mission: "USS Enterprise",
      rocket: "NCC 1701-D",
      target: "Kepler-62 f",
    };
    const completeLaunchDataWithInvalidDate = {
      mission: "USS Enterprise",
      rocket: "NCC 1701-D",
      target: "Kepler-62 f",
      launchDate: "Invalid Date",
    };

    test("It should respond with 201 created", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(completeLaunchData)
        .expect("Content-Type", /json/)
        .expect(201);

      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();
      expect(requestDate).toBe(responseDate);

      expect(response.body).toMatchObject(completeLaunchDataWithoutDate);
    });
    test("It should catch missing required properties", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(completeLaunchDataWithoutDate)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "There is an error or field is missing",
      });
    });
    test("It should catch invalid dates", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(completeLaunchDataWithInvalidDate)
        .expect("Content-Type", /json/)
        .expect(400);
      expect(response.body).toStrictEqual({
        error: "Invalid Date",
      });
    });
  });
  //pw zainal
});
