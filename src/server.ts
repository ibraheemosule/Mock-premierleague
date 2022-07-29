import "dotenv/config";
import express from "express";
import connect from "./utils/db";
import { json, urlencoded } from "body-parser";
import morgan from "morgan";
import { port } from "./utils";
import teamRoutes from "./teams/teams.routes";
import adminRoutes from "./admin/admin.routes";
import cors from "cors";

const app = express();

// middlewares
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));

//routers
app.use("/admin", adminRoutes);
app.use("/teams", teamRoutes);

export const start = async () => {
  try {
    await connect();
    app.listen(port, () => {
      console.log("Application started on port 3000!");
    });
  } catch (e) {
    console.error(e, "an error here");
  }
};
