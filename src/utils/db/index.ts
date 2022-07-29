import { ConnectOptions, connect } from "mongoose";

const dbconnect = (opts = {}) => {
  return connect(
    process.env.URL as string,
    {
      ...opts,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions
  );
};

export default dbconnect;
