import { IBody } from "./ts-types";

const env = process.env.NODE_ENV || "development";
export const port = env === "development" ? 3000 : process.env.PORT;

export const userAndAdminSchema = {
  username: {
    type: String,
    required: true,
    minLength: 4,
    maxLength: 20,
    unique: true,
    lowercase: true,
  },
  name: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 40,
    lowercase: true,
  },
  email: {
    type: String,
    required: true,
    minLength: 10,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    minLength: 8,
    required: true,
  },
};

export const dotsInGmail = (body: IBody) => {
  const option = body.email ? "email" : "username";
  if (!/@gmail/.test(body[option])) return body;
  const value: string[] = body[option].split("").filter((val, i) => {
    if (val !== ".") return true;
    const dotIndex = i !== body[option].lastIndexOf(val);
    if (dotIndex) return false;
    return true;
  });
  body[option] = value.join("");
  return body;
};
