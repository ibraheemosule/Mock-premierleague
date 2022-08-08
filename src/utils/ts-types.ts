import { Request } from "express";
import { Document } from "mongoose";

export interface ISignUpSchema extends Document {
  checkPassword: (password: string) => boolean;
  username: {
    [key: string]: string | boolean | number;
  };
  password: string;
  name: {
    [key: string]: string | boolean | number;
  };
  email: {
    [key: string]: string | boolean | number;
  };
}
export interface ISignIn extends Request {
  body: {
    username: string;
    password: string;
  };
}

export interface IBody {
  [key: string]: string;
}

export interface IToken {
  id: string;
}
