import mongoose from "mongoose";

const teamsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxLength: 20,
    },
    createdBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "admin",
      required: true,
    },
  },
  { timestamps: true }
);

teamsSchema.index({ admin: 1, name: 1 }, { unique: true });

export const Teams = mongoose.model("teams", teamsSchema);
