import { ConnectOptions, connect } from "mongoose";

const dbconnect = (url: string, opts = {}) => {
  return connect(url, {
    ...opts,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as ConnectOptions);
};

export default dbconnect;
