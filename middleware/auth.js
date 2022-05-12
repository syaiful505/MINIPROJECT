const { AuthenticationError } = require("apollo-server");
const User = require("../model/User/User");
const jwt = require("jsonwebtoken");

function getUser(token) {
  const tokenDecode = jwt.verify(
    token,
    process.env.JWT_SECRET_KEY || "SECRET_KEY"
  );
  return tokenDecode;
}

const requireAuth = async (resolver, parent, args, context) => {
  let Authorization = context.req.get("Authorization");
  if (!Authorization) {
    throw new AuthenticationError("Authorization header is missing");
  }
  let token = Authorization.replace("Bearer ", "");
  token = token.replace(/"/g, "");

  let userId = getUser(token);

  let user = await User.findOne({ _id: userId }).select("_id, user_type");
  if (!user) {
    throw new AuthenticationError("UnAuthenticated");
  }

  context.userId = user._id;
  context.userType = user.user_type;

  return resolver();
};

let authMiddleware = {
  Query: {
    lookUser: requireAuth,
  },
  // Mutation: {},
};

module.exports = authMiddleware;
