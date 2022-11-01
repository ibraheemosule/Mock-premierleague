import adminController from "../../admin/admin.controller";
import userController from "src/user/user.controller";
import { Response, Request } from "express";
import { testSignIn } from "src/utils/test-utils";
import { faker } from "@faker-js/faker";
import request from "supertest";
import teamsRoutes from "../teams.routes";
import express from "express";
import { json, urlencoded } from "body-parser";

const app = express();
app.use(json());
app.use(urlencoded({ extended: true }));
app.use("/", teamsRoutes);

export default describe("TEAMS TEST", () => {
  describe("admin functionalities", () => {
    const req = {} as unknown as Request;
    const { signIn } = adminController;

    beforeAll(async () => {
      await testSignIn({ signIn });

      req.headers = {
        Authorization: global.admin,
      };
    });

    afterAll(async () => {
      // delete all teams in the db after all the test have ran.
      const adminAuth = { Authorization: global.admin };
      const {
        body: { data },
      } = await request(app).get("/").set(adminAuth);

      data.map(
        async (team: { [key: string]: any }) =>
          await request(app).delete(`/${team._id}`).set(adminAuth)
      );

      const {
        body: { data: newData },
      } = await request(app).get("/").set(adminAuth);

      expect(newData.length).toBe(0);
    });

    test("admin should add a new team", async () => {
      expect.assertions(2);

      const addTeam = await request(app)
        .post("/")
        .set(req.headers)
        .send({ name: "tottenham" });

      expect(addTeam.status).toBe(200);
      expect(addTeam.body).toEqual({ message: "data created" });
    });

    test("admin should update a team using it's id", async () => {
      const getTeam = await request(app).get("/?search=tottenham");
      expect(getTeam.status).toBe(200);

      const teamId: string = getTeam.body.data._id;

      const updateTeam = await request(app)
        .patch(`/${teamId}`)
        .set(req.headers)
        .send({ name: "west ham" });

      expect(updateTeam.status).toBe(201);
      expect(updateTeam.body.message).toBe("data updated");
    });

    test("admin should delete a team using it's id", async () => {
      const getTeam = await request(app).get("/?search=west ham");
      const teamId: string = await getTeam.body.data._id;

      const deleteTeam = await request(app)
        .delete(`/${teamId}`)
        .set(req.headers);

      expect(deleteTeam.status).toBe(200);
      expect(deleteTeam.body.data).toMatchObject({ message: "removed data" });
    });
  });

  describe("user functionalities", () => {
    beforeAll(async () => {
      const { signIn, signUp } = userController;

      const req = {
        body: {
          name: "John Doe",
          username: "johndoe",
          email: faker.internet.email(),
          password: "johndoe88.",
        },
      } as unknown as Request;

      const res = {
        status(status: number) {
          return this;
        },
        json(result: any) {
          return this;
        },
      } as unknown as Response;

      await signUp(req, res);
      await testSignIn({ signIn, account: "user" });
    });

    test("user should get all teams", async () => {
      const authAdmin = { Authorization: global.admin },
        getAllTeams = await request(app).get("/").set(authAdmin);

      expect(getAllTeams.status).toBe(200);
    });

    test("user should not be able to add new team", async () => {
      const authUser = { Authorization: global.user },
        addTeam = await request(app)
          .post("/")
          .set(authUser)
          .send({ name: "chelsea" });

      expect(addTeam.status).toBe(401);
    });

    test("user should not be able to delete a team", async () => {
      //create a new team with admin
      const adminAuth = { Authorization: global.admin },
        addTeam = await request(app)
          .post("/")
          .set(adminAuth)
          .send({ name: "chelsea" });

      expect(addTeam.status).toBe(200);

      // get new team id
      const newTeam = await request(app).get("/?search=chelsea"),
        teamId: string = newTeam.body.data._id;

      const authUser = { Authorization: global.user },
        deleteTeam = await request(app).delete(`/${teamId}`).set(authUser);

      expect(deleteTeam.status).toBe(401);
    });

    test("user should not be able to update a team details", async () => {
      // get new team that was created in the previous test suite
      const newTeam = await request(app).get("/?search=chelsea"),
        teamId: string = newTeam.body.data._id;

      const authUser = { Authorization: global.user },
        deleteTeam = await request(app)
          .patch(`/${teamId}`)
          .set(authUser)
          .send({ name: "tottenham" });

      expect(deleteTeam.status).toBe(401);
    });
  });

  describe("non-user functionalities", () => {
    test("non users can search for a particular team by name", async () => {
      const newTeam = await request(app).get("/?search=chelsea");
      expect(newTeam.status).toBe(200);
    });
  });

  describe("model functionalities", () => {
    test("a team creator name should be returned in creatdBy", async () => {
      const {
        body: { data },
      } = await request(app).get("/?search=chelsea");
      expect(data.createdBy.name).toBeTruthy();
      expect(Object.keys(data.createdBy).length).toStrictEqual(1);
    });

    test("invalid body object should return error when adding a new team", async () => {
      const adminAuth = { Authorization: global.admin };
      const addTeam = await request(app)
        .post("/")
        .set(adminAuth)
        .send({ nam: "liverpool" });

      expect(addTeam.status).toBe(400);
    });

    test("ignore other object keys aside name in body object when adding new team", async () => {
      const adminAuth = { Authorization: global.admin };
      const addTeam = await request(app)
        .post("/")
        .set(adminAuth)
        .send({ name: "liverpool", founded: "1892" });

      const newTeam = await request(app).get("/?search=liverpool");

      expect(addTeam.status).toBe(200);
      expect(newTeam.body.data.founded).toBe(undefined);
    });
  });
});
