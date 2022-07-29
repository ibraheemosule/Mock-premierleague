import mongoose from "mongoose";
import bcrypt from "bcrypt";

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      minLength: 4,
      maxLength: 20,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      minLength: 5,
      maxLength: 40,
    },
    email: {
      type: String,
      required: true,
      minLength: 10,
      unique: true,
    },
    password: {
      type: String,
      minLength: 8,
      required: true,
    },
  },
  { timestamps: true }
);

adminSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();

  bcrypt.hash(this.password, 10, (err, hash) => {
    if (err) return next(err);
    this.password = hash;
    console.log(hash, this.password, "lol", this);
    next();
  });
});

adminSchema.pre("updateOne", function (next) {
  if (!this.isModified("password")) return next();
  bcrypt.hash(this.password, 10, (err, hash) => {
    if (err) return next(err);
    this.password = hash;
    next();
  });
});

// eslint-disable-next-line prettier/prettier
adminSchema.methods.checkPassword = async function (
  password: string,
  hash: string
) {
  try {
    const compare = await bcrypt.compare(password, hash);
    return compare;
  } catch (e) {
    return false;
  }
};

export const Admin = mongoose.model("admin", adminSchema);
