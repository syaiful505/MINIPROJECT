const { model, Schema } = require("mongoose");

const playlistSchema = new Schema({
  playlist: { type: String },
  song_ids: [
    {
      song_id: {
        type: mongoose.Schema.Types.ObjectId,
      },
    },
  ],
  created_by: [
    {
      users_id: {
        type: mongoose.Schema.Types.ObjectId,
      },
    },
  ],
  collaborator_ids: [
    {
      user_id: {
        type: mongoose.Schema.Types.ObjectId,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: () => Date.now(),
  },
  updatedAt: {
    type: Date,
    default: () => Date.now(),
  },
});

module.exports = model("Playlist", playlistSchema);
