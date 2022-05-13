const { AuthenticationError } = require("apollo-server-express");
const User = require("../model/User/User");
const jwt = require("jsonwebtoken");

function getUser(token) {
  const tokenDecode = jwt.verify(
    token,
    process.env.JWT_SECRET_KEY || "UNSAFE_STRING"
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

  let user_id = getUser(token);

  let user = await User.findOne({ _id: userId }).select("_id, user_type");
  if (!user) {
    throw new AuthenticationError("UnAuthenticated");
  }

  context.user_id = user._id;
  context.user_type = user.user_type;

  return resolver();
};

let authMiddleware = {
  Query: {
    getAllUser: requireAuth,
    getAllSongs: requireAuth,
    getSongById: requireAuth,
  },
  Mutation: {
    updateUser: requireAuth,
    addSong: requireAuth,
    updateSong: requireAuth,
    deleteSong: requireAuth,
  },
};

module.exports = authMiddleware;
