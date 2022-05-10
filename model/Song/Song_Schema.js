const { model, Schema, mongoose } = require("mongoose");

const songSchema = new Schema({
  name: { type: String },
  genre: { type: String },
  duration: { type: String },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  createdAt: {
    type: Date,
    default: () => Date.now(),
  },
  updatedAt: {
    type: Date,
    default: () => Date.now(),
  },
});

module.exports = model("Song", songSchema);
