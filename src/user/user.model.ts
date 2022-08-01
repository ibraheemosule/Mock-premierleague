import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";
import { userAndAdminSchema } from "../utils";
import { ISignUpSchema } from "../utils/ts-types";

const userSchema: Schema<ISignUpSchema> = new mongoose.Schema(
  userAndAdminSchema,
  {
    timestamps: true,
  }
);

userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();

  bcrypt.hash(this.password, 10, (err, hash) => {
    if (err) return next(err);
    this.password = hash;
    next();
  });
});

userSchema.pre("updateOne", function (next) {
  if (!this.isModified("password")) return next();
  bcrypt.hash(this.password, 10, (err, hash) => {
    if (err) return next(err);
    this.password = hash;
    next();
  });
});

userSchema.methods.checkPassword = async function (password: string) {
  const hashedPassword = this.password;
  try {
    const compare = await bcrypt.compare(password, hashedPassword);
    return compare;
  } catch (e) {
    return false;
  }
};

export const User = mongoose.model<ISignUpSchema>("user", userSchema);
