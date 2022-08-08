import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";
import { userAndAdminSchema } from "../utils";
import { ISignUpSchema } from "../utils/ts-types";

const user: Schema = new mongoose.Schema(userAndAdminSchema, {
  timestamps: true,
});

user.pre("save", function (next) {
  if (!this.isModified("password")) return next();

  bcrypt.hash(this.password, 10, (err, hash) => {
    if (err) return next(err);
    this.password = hash;
    next();
  });
});

user.pre("updateOne", function (next) {
  if (!this.isModified("password")) return next();
  bcrypt.hash(this.password, 10, (err, hash) => {
    if (err) return next(err);
    this.password = hash;
    next();
  });
});

user.methods.checkPassword = async function (password: string) {
  const hashedPassword = this.password;
  try {
    const compare = await bcrypt.compare(password, hashedPassword);
    return compare;
  } catch (e) {
    return false;
  }
};

export const User = mongoose.model<ISignUpSchema>("user", user);
