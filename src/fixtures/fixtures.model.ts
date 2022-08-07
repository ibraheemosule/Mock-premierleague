import mongoose from "mongoose";
import { Teams } from "../teams/teams.model";

const fixtureSchema = new mongoose.Schema(
  {
    home: {
      info: {
        type: mongoose.Types.ObjectId,
        ref: "team",
        required: true,
      },
      score: {
        type: Number,
        default: null,
      },
    },
    away: {
      info: {
        type: mongoose.Types.ObjectId,
        ref: "team",
        required: true,
      },
      score: {
        type: Number,
        default: null,
      },
    },
    status: {
      type: String,
      enum: ["pending", "ongoing", "finished"],
      default: "pending",
    },
    updatedBy: {
      type: mongoose.Types.ObjectId,
      ref: "admin",
    },
  },
  { timestamps: true }
);

fixtureSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

fixtureSchema.post("findOneAndUpdate", async function (doc, next) {
  const team = await Teams.updateMany(
    {
      _id: { $in: [doc.away.info, doc.home.info] },
    },
    { $push: { fixtures: doc._id } }
  );
  next();
});

fixtureSchema.post("remove", async function (doc) {
  await Teams.findOneAndUpdate(
    {},
    {
      $pull: { "fixtures.$._id": doc._id },
    },
    { new: true }
  );
});

export const Fixtures = mongoose.model("fixture", fixtureSchema);
