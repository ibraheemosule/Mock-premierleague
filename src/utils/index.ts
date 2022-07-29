const env = process.env.NODE_ENV || "development";
export const port = env === "development" ? 3000 : process.env.PORT;
