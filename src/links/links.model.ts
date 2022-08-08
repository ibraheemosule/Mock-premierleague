import mongoose from "mongoose";

const links = new mongoose.Schema({
  createdBy: {
    type: mongoose.Types.ObjectId,
    ref: "admin",
    required: true,
  },
  linkString: {
    type: String,
    required: true,
  },
  fixture: {
    type: mongoose.Types.ObjectId,
    ref: "fixture",
    required: true,
  },
});

links.index({ createdBy: 1, linkString: 1 }, { unique: true });

export const Links = mongoose.model("link", links);
