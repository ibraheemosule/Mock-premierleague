import { Request } from "express";
import { Document } from "mongoose";

export interface ISignUpSchema extends Document {
  checkPassword: (password: string) => boolean;
  username: {
    [key: string]: any;
  };
  password: any;
  name: {
    [key: string]: any;
  };
  email: {
    [key: string]: any;
  };
}
export interface ISignIn extends Request {
  body: {
    username: string;
    password: string;
  };
}

// export interface IProtectRoutes extends Request {
//   user: {
//     id: string;
//   };
//   headers: {
//     authorization: string;
//     [key: string | number | symbol]: any;
//   };
// }

// export type ProtectRoutesType = IProtectRoutes & {
//   headers: { authorization: string };
//   user: { id: string };
// };

export interface IToken {
  id: string;
}
