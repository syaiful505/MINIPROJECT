const { gql } = require("apollo-server");

module.exports = gql`
  type Message {
    text: String
    createdAt: String
    createdBy: String
  }
  enum Level {
    Administrator
    Creator
    Enjoyer
  }
  type User {
    _id: ID!
    username: String
    email: String
    password: String
    user_type: Level
    token: String
  }
  type Song {
    _id: ID!
    name: String
    genre: String
    duration: Int
    created_by: User
  }

  input MessageInput {
    text: String
    username: String
  }
  input RegisterInput {
    username: String
    user_type: Level
    email: String
    password: String
  }
  input LoginInput {
    email: String
    password: String
    token: String
  }
  input Pagination {
    skip: Int
    limit: Int
  }
  input SongInput {
    name: String
    genre: String
    duration: Int
  }
  input UserUpdate {
    _id: ID!
    username: String

  }

  type Query {
    message(id: ID!): Message
    user(id: ID!): User
    getAllUser(user_input: Pagination): User
    song(id: ID!): Song
  }
  type Mutation {
    createMessage(messageInput: MessageInput): Message!
    registerUser(registerInput: RegisterInput): User
    loginUser(loginInput: LoginInput): User
    updateUser(user_update: UserUpdate): User
    addSong(songInput: SongInput): Song
  }
`;
