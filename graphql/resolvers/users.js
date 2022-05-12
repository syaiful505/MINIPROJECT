const User = require("../../model/User/User");
const { ApolloError } = require("apollo-server-errors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// ======Query======
async function lookUser(_, args, context) {
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
async function getUserById(_, { user_input }) {
  try {
    const { user_id } = user_input;
    const res = await User.findById(user_id);
    return res;
  } catch (err) {
    console.log(err);
    throw err;
  }
}
async function getAllUserFilter(_, { user_input }) {
  try {
    if (!user_input) {
      throw new Error('Please input the data');
    } else {
      const { username, user_type } = user_input;
      
      const regName = new RegExp(username, 'i');
      const regUserType = new RegExp(user_type, 'i');

      const res = await User.find({
        username: {
          $regex: regName
        },
        user_type: {
          $regex: regUserType
        }
      });
      return res;
    }
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

async function loginUser(_, { loginInput: { email, password } }) {
  try {
    const user = await User.findOne({ email });
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
  { user_update: { ID, username, email, password, user_type } }
) {
  try {
    var encryptedPassword = await bcrypt.hash(password, 10);
    const res = await User.findByIdAndUpdate(
      ID,
      {
        username: username,
        email: email,
        user_type: user_type,
        password: encryptedPassword,
      },
      {
        new: true,
      }
    );
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
    getUserById,
    getAllUserFilter,
  },
};
