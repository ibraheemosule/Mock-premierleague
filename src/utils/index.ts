/* eslint-disable @typescript-eslint/restrict-template-expressions */
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
    // validate: {
    //   validator: function (value: string) {
    //     return value.match(/^[a-zA-Z0-9_.-]*$/);
    //   },
    //   message: (prop: { [key: string]: any }) =>
    //     `${prop.value} should contain only letters and numbers`,
    // },
  },
  name: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 40,
    lowercase: true,
    // validate: {
    //   validator: function (value: string) {
    //     return value.match(/^[a-zA-Z\s]*$/);
    //   },
    //   message: (prop: { [key: string]: any }) =>
    //     `${prop.value} should contain only letters`,
    // },
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
