import express from "express";
import testRequest from "supertest";
import { json, urlencoded } from "body-parser";
import { testSignIn } from "src/utils/test-utils";
import adminController from "src/admin/admin.controller";
import userController from "src/user/user.controller";
import fixturesRoutes from "src/fixtures/fixtures.routes";
import teamsRoutes from "src/teams/teams.routes";
import { IAuth } from "src/utils/ts-types";

const app = express();

app.use(json());
app.use(urlencoded({ extended: true }));
app.use("/teams", teamsRoutes);
app.use("/", fixturesRoutes);

const request = testRequest(app);

export default describe("FIXTURE LINK TESTS", () => {
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
    let createFixture: any;

    beforeEach(async () => {
      createFixture = await request
        .post("/")
        .set(adminAuth)
        .send({ homeTeam: teams[0]._id, awayTeam: teams[1]._id });
      return createFixture;
    });

    afterEach(async () => {
      return await request
        .delete(`/${createFixture.body.data._id}`)
        .set(adminAuth);
    });

    test("admin can generate a fixture link", async () => {
      const generateLink = await request
        .post("/generate-link")
        .set(adminAuth)
        .send({ id: createFixture.body.data._id });

      expect(generateLink.status).toBe(201);
      expect(generateLink.body.data.linkString).toBeTruthy();
    });

    test("admin can delete generated link", async () => {
      const deleteLink = await request
        .delete(`/link/${createFixture.body.data._id}`)
        .set(adminAuth);
      expect(deleteLink.status).toBe(200);
    });

    test("deleted fixture should trigger delete of related fixture links", async () => {
      const link = await request
        .post("/generate-link")
        .set(adminAuth)
        .send({ id: createFixture.body.data._id });
      expect(link.status).toBe(201);

      const deleteFixture = await request
        .delete(`/${createFixture.body.data._id}`)
        .set(adminAuth);
      expect(deleteFixture.status).toBe(200);

      const getLink = await request
        .get(`/link/${link.body.data.linkString}`)
        .set(adminAuth);

      expect(getLink.status).toBe(400);
      expect(getLink.body).toBe("invalid link");
    });
  });

  describe("User functionalities", () => {
    let createFixture: any;

    beforeEach(async () => {
      createFixture = await request
        .post("/")
        .set(adminAuth)
        .send({ homeTeam: teams[0]._id, awayTeam: teams[1]._id });
      return createFixture;
    });

    afterEach(async () => {
      return await request
        .delete(`/${createFixture.body.data._id}`)
        .set(adminAuth);
    });

    test("user should not be able to generate a fixture link", async () => {
      const generateLink = await request
        .post("/generate-link")
        .set(userAuth)
        .send({ id: createFixture.body.data._id });

      expect(generateLink.status).toBe(401);
    });

    test("user should not be able to delete a link", async () => {
      const deleteLink = await request
        .delete(`/link/${createFixture.body.data._id}`)
        .set(userAuth);
      expect(deleteLink.status).toBe(401);
    });
  });

  describe("General functionalities", () => {
    let fixtureLink: any;

    beforeAll(async () => {
      const createFixture = await request
        .post("/")
        .set(adminAuth)
        .send({ homeTeam: teams[0]._id, awayTeam: teams[1]._id });

      fixtureLink = await request
        .post("/generate-link")
        .set(adminAuth)
        .send({ id: createFixture.body.data._id });

      return fixtureLink;
    });

    test("Can get fixture using generated link string", async () => {
      const linkString = fixtureLink.body.data.linkString;

      const fetchFixture = await request
        .get(`/link/${linkString}`)
        .set(adminAuth);

      expect(fetchFixture.status).toBe(200);
      expect(fetchFixture.body.data.fixture.homeTeam.name).toBe(teams[0].name);
      expect(fetchFixture.body.data.fixture.awayTeam.name).toBe(teams[1].name);
    });
  });
});
