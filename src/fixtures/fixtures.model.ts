import mongoose from "mongoose";
import { Links } from "../links/links.model";
import { Teams } from "../teams/teams.model";

const fixtureSchema = new mongoose.Schema(
  {
    homeTeam: {
      type: mongoose.Types.ObjectId,
      ref: "team",
      required: true,
      immutable: true,
    },
    homeScore: {
      type: Number,
      default: null,
    },
    awayTeam: {
      type: mongoose.Types.ObjectId,
      ref: "team",
      required: true,
      immutable: true,
    },
    awayScore: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "admin",
      immutable: true,
    },
    updatedBy: {
      type: mongoose.Types.ObjectId,
      ref: "admin",
    },
  },
  { timestamps: true }
);

fixtureSchema.index({ homeTeam: 1, awayTeam: 1 }, { unique: true });

fixtureSchema.pre("findOneAndUpdate", function (next) {
  const homeScore: number = this.get("homeScore"),
    awayScore: number = this.get("awayScore"),
    status = this.get("status") ?? "pending";

  const isScoreValid =
    Number.isInteger(homeScore) && Number.isInteger(awayScore);

  if (status === "completed" && !isScoreValid) {
    return next(
      new Error("Status is completed but scoreline provided is invalid")
    );
  }

  if (!/completed|pending/i.test(status)) {
    return next(new Error("invalid status value"));
  }

  this.set({ updatedAt: new Date() });
  next();
});

// fixtureSchema.post("findOneAndUpdate", async function (doc, next) {
//   const team = await Teams.updateMany(
//     {
//       _id: { $in: [doc.homeTeam, doc.awayTeam] },
//     },
//     { $push: { fixtures: doc._id } }
//   );
//   next();
// });

fixtureSchema.post("remove", async function (doc) {
  await Teams.updateMany(
    {},
    {
      $pull: { "fixtures.$._id": doc._id },
    }
  );
});

export const Fixtures = mongoose.model("fixture", fixtureSchema);
