import testRequest from "supertest";
import adminController from "src/admin/admin.controller";
import userController from "src/user/user.controller";
import fixturesRoutes from "../fixtures.routes";
import teamsRoutes from "src/teams/teams.routes";
import express from "express";
import { json, urlencoded } from "body-parser";
import { testSignIn } from "src/utils/test-utils";
import { IAuth } from "src/utils/ts-types";

const app = express();

app.use(json());
app.use(urlencoded({ extended: true }));
app.use("/teams", teamsRoutes);
app.use("/fixtures", fixturesRoutes);
app.use("/", fixturesRoutes);

const request = testRequest(app);

export default describe("FIXTURES TEST", () => {
  let adminAuth: IAuth, userAuth: IAuth, teams: any;

  beforeAll(async () => {
    const teamList = ["chelsea", "arsenal", "liverpool", "everton"];
    await testSignIn({ signIn: adminController.signIn });
    await testSignIn({ signIn: userController.signIn, account: "user" });

    adminAuth = { Authorization: global.admin };
    userAuth = { Authorization: global.user };

    await Promise.all(
      teamList.map(
        async (team) =>
          await request.post("/teams").set(adminAuth).send({ name: team })
      )
    );

    teams = await request
      .get("/teams")
      .set(adminAuth)
      .then(({ body: { data } }) => data);

    return teams;
  });

  afterAll(async () => {
    return await Promise.all(
      teams.map(
        async (team: any) =>
          await request.delete(`/teams/${team._id}`).set(adminAuth)
      )
    );
  });

  describe("Admin functionalities", () => {
    test("create fixtures with teams id (team[0] vs team[1])", async () => {
      const fixture = await request
        .post("/")
        .set(adminAuth)
        .send({ homeTeam: teams[0]._id, awayTeam: teams[1]._id });

      expect(fixture.status).toBe(200);
      expect(fixture.body.data).toMatchObject({
        homeTeam: { name: teams[0].name },
      });
    });

    test("duplicate fixture of (team[0] vs team[1]) should throw error", async () => {
      const fixture = await request
        .post("/")
        .set(adminAuth)
        .send({ homeTeam: teams[0]._id, awayTeam: teams[1]._id });

      expect(fixture.status).toBe(400);
    });

    test("can create another fixture with team[2] and team[3]", async () => {
      const fixture = await request
        .post("/")
        .set(adminAuth)
        .send({ homeTeam: teams[2]._id, awayTeam: teams[3]._id });

      expect(fixture.status).toBe(200);
    });

    test("reverse fixture of (team[1] vs team[0]) can be created", async () => {
      const fixture = await request
        .post("/")
        .set(adminAuth)
        .send({ homeTeam: teams[1]._id, awayTeam: teams[0]._id });

      expect(fixture.status).toBe(200);
      expect(fixture.body.data).toMatchObject({
        homeTeam: { name: teams[1].name },
      });
    });

    test("created fixtures should match model structure", async () => {
      const fixtures = await request.get(`/`).set(adminAuth);

      expect(typeof fixtures.body.data[0].homeTeam.name).toBe("string");
      expect(typeof fixtures.body.data[0].awayTeam.name).toBe("string");
      expect(fixtures.body.data[0].homeScore).toBe(null);
      expect(fixtures.body.data[0].awayScore).toBe(null);
      expect(fixtures.body.data[0].status).toBe("pending");
    });

    test("should update fixture details", async () => {
      const allFixtures = await request.get("/").set(adminAuth),
        fixture = allFixtures.body.data[0];

      const { status, body } = await request
        .patch(`/${fixture._id}`)
        .set(adminAuth)
        .send({
          awayScore: 1,
          homeScore: 0,
        });

      expect(status).toBe(201);
      expect(body.message).toBe("data updated");
    });

    test("should not create fixture with a deleted team", async () => {
      const deleteTeam = await request
        .delete(`/teams/${teams[0]._id}`)
        .set(adminAuth);

      expect(deleteTeam.status).toBe(200);
    });

    test("related fixtures of a deleted team should be removed", async () => {
      const fixtures = await request.get(`/`).set(adminAuth);
      fixtures.body.data.forEach((fixture: any) => {
        expect(fixture.homeTeam).not.toEqual(null);
        expect(fixture.homeTeam).not.toEqual(null);
      });
    });

    test("should delete fixture", async () => {
      const fixtures = await request.get(`/`).set(adminAuth);
      expect(fixtures.status).toBe(200);

      const delFixture = await request
        .delete(`/${fixtures.body.data[0]._id}`)
        .set(adminAuth);
      expect(delFixture.status).toBe(200);
      expect(delFixture.body.data).toMatchObject({ message: "removed data" });
    });
  });

  describe("user functionalites", () => {
    test("should not be able to create fixture", async () => {
      const fixture = await request
        .post("/")
        .set(userAuth)
        .send({ homeTeam: teams[0]._id, awayTeam: teams[1]._id });

      expect(fixture.status).toBe(401);
    });

    test("Search all pending fixtures", async () => {
      const fixture = await request
        .post("/")
        .set(adminAuth)
        .send({ homeTeam: teams[2]._id, awayTeam: teams[1]._id });
      expect(fixture.status).toBe(200);

      const pendingFixtures = await request.get("/pending").set(userAuth);
      expect(pendingFixtures.status).toBe(200);
      expect(pendingFixtures.body.data[0].status).toBe("pending");

      const deleteFixture = await request
        .delete(`/${fixture.body.data._id}`)
        .set(adminAuth);
      expect(deleteFixture.status).toBe(200);
    });

    test("Search all completed fixtures", async () => {
      const fixture = await request.post("/").set(adminAuth).send({
        homeTeam: teams[2]._id,
        awayTeam: teams[1]._id,
        homeScore: 1,
        awayScore: 2,
        status: "completed",
      });
      expect(fixture.status).toBe(200);

      const pendingFixtures = await request.get("/completed").set(userAuth);
      expect(pendingFixtures.status).toBe(200);
      expect(pendingFixtures.body.data[0].status).toBe("completed");

      const deleteFixture = await request
        .delete(`/${fixture.body.data._id}`)
        .set(adminAuth);
      expect(deleteFixture.status).toBe(200);
    });

    test("creating a fixture as completed without homeScore or awayScore should return error", async () => {
      const homeScoreNull = await request.post("/").set(adminAuth).send({
        homeTeam: teams[2]._id,
        awayTeam: teams[1]._id,
        awayScore: 2,
        status: "completed",
      });
      expect(homeScoreNull.status).toBe(400);

      const awayScoreNull = await request.post("/").set(adminAuth).send({
        homeTeam: teams[2]._id,
        awayTeam: teams[1]._id,
        homeScore: 2,
        status: "completed",
      });
      expect(awayScoreNull.status).toBe(400);
    });
  });

  describe("general functionalities", () => {
    beforeAll(async () => {
      return await request
        .post("/")
        .set(adminAuth)
        .send({ homeTeam: teams[1]._id, awayTeam: teams[2]._id });
    });

    test("should search for team fixtures by name", async () => {
      const fixture = await request
        .get(`/fixtures/teams?search=${teams[1].name}`)
        .set(adminAuth);

      expect(fixture.status).toBe(200);
      expect(fixture.body.data[0].homeTeam.name).toBeTruthy();
    });
  });
});
