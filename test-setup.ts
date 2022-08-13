import mongoose, { deleteModel, connect, ConnectOptions } from "mongoose";
import { Teams } from "src/teams/teams.model";
import { User } from "src/user/user.model";
import { Admin } from "src/admin/admin.model";
import { Fixtures } from "src/fixtures/fixtures.model";
import { Links } from "src/links/links.model";

const testUrl = process.env.TEST_URL as string;
let db: any;

const collections = {
  teams: Teams,
  users: User,
  admins: Admin,
  fixtures: Fixtures,
  links: Links,
};

beforeAll(async () => {
  try {
    db = await connect(testUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions);
    Object.values(collections).forEach(
      async (model: any) => await model.init()
    );
  } catch (e) {
    console.error(e, 29);
  }
}, 60000);

afterAll(async () => {
  try {
    await Object.keys(collections).forEach(
      async (model: any) => await db.connection.dropCollection(model)
    );

    // db.dropCollection("user", (e: any) => {
    //   if (e) console.log(e, "here");
    // });s
    // await db.disconnect();
    // await deleteModel(/.+/);

    // await db.connection.dropCollection("fixture");
  } catch (e) {
    console.error(e, 45);
  } finally {
    // await db.disconnect();
    //   await db.connection.close();
  }
});
