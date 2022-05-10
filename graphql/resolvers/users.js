const User = require("../../model/User/User");
const { ApolloError } = require("apollo-server-errors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// ======Query======
async function lookUser(_) {
  try {
    const res = await User.find();
    return res;
  } catch (err) {
    console.log(err);
    throw err;
  }
}
async function getAllUser(_, { user_input }) {
  try {
    const { limit, skip } = user_input;
    const res = await User.aggregate([
      {
        $skip: skip * limit,
      },
      {
        $limit: limit,
      },
    ]);
    return res;
  } catch (err) {
    console.log(err);
    throw err;
  }
}
async function getUserSort(_, { user_input }) {
  try {
    const sort_by = user_input;
    const sort = sort_by === "asc" ? 1 : -1;
    const res = await User.aggregate([
      {
        $sort: {
          sort_by: sort,
        },
      },
    ]);
    return res;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

// ======Mutation======
async function registerUser(
  _,
  { registerInput: { username, email, password, user_type } }
) {
  try {
    // see if an old user exists with email attempting to register
    const oldUser = await User.findOne({ email });

    // throw error if that user exists
    if (oldUser) {
      throw new ApolloError(
        "A user is already registered with the email" + email,
        "USER_ALREADY_EXISTS"
      );
    }

    // Encrypt password
    var encryptedPassword = await bcrypt.hash(password, 10);

    // Build out mongoose model (User)
    const newUser = new User({
      username: username,
      email: email.toLowerCase(),
      password: encryptedPassword,
      user_type: user_type,
    });
    // Create our JWT (attach to our User model)
    const token = jwt.sign({ user_id: newUser._id, email }, "UNSAFE_STRING", {
      expiresIn: "7d",
    });
    newUser.token = token;

    // Save our user in mongoDB
    const res = await newUser.save();
    return {
      id: res.id,
      ...res._doc,
    };
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function loginUser(_, { loginInput: { email, password, token } }) {
  try {
    const user = await User.findOne({ email });
    //check if the entered password equals the encrypted password
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ user_id: user._id, email }, "UNSAFE_STRING", {
        expiresIn: "7d",
      });
      user.token = token;

      return { id: user.id, ...user._doc };
    } else {
      throw new ApolloError("Incorect Password", "INCORRECT_PASSWORD");
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function updateUser(
  _,
  { user_update: { _id, username, email, password } }
) {
  try {
    var encryptedPassword = await bcrypt.hash(password, 10);
    const res = await User.findByIdAndUpdate(_id, {
      username: username,
      email: email,
      password: encryptedPassword,
    });
    return res;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

module.exports = {
  Mutation: {
    registerUser,
    loginUser,
    updateUser,
  },
  Query: {
    lookUser,
    getAllUser,
    getUserSort,
  },
};
