import mongoose from "mongoose";

module.exports = async () => {
  await mongoose.connect("mongodb://localhost:27017/mpl-test").then(() => {
    mongoose.connection.db.dropDatabase();
  });
};
