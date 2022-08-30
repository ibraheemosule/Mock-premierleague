import mongoose, { deleteModel, connect, ConnectOptions } from "mongoose";
import { Teams } from "src/teams/teams.model";
import { User } from "src/user/user.model";
import { Admin } from "src/admin/admin.model";
import { Fixtures } from "src/fixtures/fixtures.model";
import { Links } from "src/links/links.model";
import cuid from "cuid";

const testUrl = "mongodb://localhost:27017/mpl-test";
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

    // await Object.values(collections).forEach(
    //   async (model: any) => await model.init()
    // );

    await Promise.all(
      Object.values(collections).map((model: any) => model.init())
    );
  } catch (e) {
    console.error(e, 29);
  }
});

afterAll(async () => {
  try {
    //     await Promise.all(
    //       Object.keys(collections).map((model: any) =>
    //         db.connection.dropCollection(model)
    //       )
    //     );
    //     // db.dropCollection("user", (e: any) => {
    //     //   if (e) console.log(e, "here");
    //     // });s
    // await db.dropDatabase();
    // await db.disconnect();
    // await mongoose.connection.close();
    //     // await deleteModel(/.+/);
    //     // await db.connection.dropCollection("fixture");
  } catch (e) {
    //     console.error(e, 45);
  } finally {
    //     // await db.disconnect();
    //     //   await db.connection.close();
  }
});
