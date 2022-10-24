import controllerNames from "./controllers/controllerNames.spec";
import signup from "./controllers/signup.spec";
import signin from "./controllers/signin.spec";

const controllers = {
  controllerNames,
  signup,
  signin,
};

export default {
  ...controllers,
};
