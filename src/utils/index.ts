import jwt from "jsonwebtoken";

const env = process.env.NODE_ENV || "development";
export const port = env === "development" ? 3000 : process.env.PORT;

export const generateToken = (user: any) =>
  jwt.sign({ id: user.id }, "secret-token-id", { expiresIn: "1h" });

export const verifyToken = (token: string) =>
  jwt.verify(token, "secret-token-id,", (err: any, payload: any) => {
    new Promise((resolve, reject) => {
      if (err) return reject(err);
      resolve(payload);
    });
  });

export const userAndAdminSchema = {
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
    minLength: 2,
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
};
