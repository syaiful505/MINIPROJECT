const { gql } = require("apollo-server-express");

module.exports = gql`
  enum Level {
    Administrator
    Creator
    Enjoyer
  }
  enum Sorting {
    asc
    desc
  }

  type Message {
    text: String
    createdAt: String
    createdBy: String
  }
  type User {
    _id: ID!
    username: String
    email: String
    password: String
    user_type: Level
  }
  type Token {
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
  }
  input Pagination {
    skip: Int
    limit: Int
  }
  input FilterRegex {
    username: String
    user_type: Level
  }
  input SongInput {
    name: String
    genre: String
    duration: Int
  }
  input UserUpdate {
    username: String
    email: String
    password: String
    user_type: Level
  }
  input UserSortingInput {
    sort_by: Sorting
  }
  input UserInputId {
    user_id: ID
  }

  type Query {
    message(id: ID!): Message
    lookUser: User
    getAllUser(user_input: Pagination): [User]
    getAllUserFilter(user_input: FilterRegex): [User]
    getUserSort(user_input: UserSortingInput): [User]
    getUserById(user_input: UserInputId): User
    song(id: ID!): Song
  }
  type Mutation {
    createMessage(messageInput: MessageInput): Message!
    registerUser(registerInput: RegisterInput): User
    loginUser(loginInput: LoginInput): Token
    updateUser(user_input: UserUpdate): User
    addSong(song_input: SongInput): Song
  }
`;
