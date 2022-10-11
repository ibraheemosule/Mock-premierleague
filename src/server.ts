import "dotenv/config";
import express from "express";
import connect from "./utils/db";
import { json, urlencoded } from "body-parser";
import morgan from "morgan";
import { port } from "./utils";
import teamRoutes from "./teams/teams.routes";
import adminRoutes from "./admin/admin.routes";
import userRoutes from "./user/user.routes";
import fixturesRoutes from "./fixtures/fixtures.routes";
import cors from "cors";

const app = express();

// middlewares
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));

//routers
app.use("/admins", adminRoutes);
app.use("/users", userRoutes);
app.use("/teams", teamRoutes);
app.use("/fixtures", fixturesRoutes);

export const start = async () => {
  const url = process.env.MONGODB_URI as string;
  try {
    await connect(url);
    app.listen(port, () => {
      console.log("Application started on port 3000!");
    });
  } catch (e) {
    console.error(e, "Could not connect to mongodb server");
  }
};
