import { Admin } from "./admin.model";
import { crudControllers } from "../utils/controllers/crudControllers";
import jwt from "jsonwebtoken";

const requiredFields = ["name", "username", "password", "email"];

const generateToken = (user: any) =>
  jwt.sign({ id: user.id }, "secret-token-id", { expiresIn: "1h" });

const verifyToken = (token: string) =>
  jwt.verify(token, "secret-token-id,", (err: any, payload: any) => {
    new Promise((resolve, reject) => {
      if (err) return reject(err);
      resolve(payload);
    });
  });

const signUp = async (req: any, res: any) => {
  try {
    const { body } = req;
    let reqFieldEmpty: string | undefined;

    requiredFields.every((val) => {
      if (!body[val].length) {
        reqFieldEmpty = val;
        return false;
      }
      return true;
    });

    if (!!reqFieldEmpty)
      return res.status(400).json({ message: `${reqFieldEmpty} is required` });

    const admin = await Admin.create(body);
    if (!admin) throw new Error("Server Error");
    const token = generateToken(admin);
    res.status(200).json({ data: admin });
  } catch (e) {
    console.error(e);
    return res.status(400).send(e);
  }
};

export default {
  ...crudControllers(Admin),
  signUp,
};
