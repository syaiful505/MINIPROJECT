const { ApolloServer } = require("apollo-server-express");
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const port = 3300;

const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");
const { authMiddleware } = require("./middleware/index");
const { makeExecutableSchema } = require("graphql-tools");
const { applyMiddleware } = require("graphql-middleware");

const MONGODB = "mongodb://localhost:27017/mini-project";
const executableSchema = makeExecutableSchema({ typeDefs, resolvers });
const protectedSchema = applyMiddleware(executableSchema, authMiddleware);

//server conect
const server = new ApolloServer({
  schema: protectedSchema,
  typeDefs,
  resolvers,
  context: (req) => ({
    req: req.req,
  }),
});

mongoose
  .connect(MONGODB, {
    useNewUrlParser: true,
  })
  .then((result) => {
    console.log("MongoDB Connected");
  })
  .catch((error) => {
    console.log("Error Not Connect to MongoDB", error.message);
  });
// mongoose
//   .connect(MONGODB, { useNewUrlParser: true })
//   .then(() => {
//     console.log("MongoDB Connected");
//     // server.applyMiddleware({ app });
//     // return app.listen(3300);
//   })
//   .then((res) => {
//     console.log(`Server running at ${res.url}`);
//   });

server.applyMiddleware({ app });
app.listen(port, () => {
  console.log(`Server is running in port ${port}`);
});
// server.applyMiddleware({ app });
// app.listen(port, () => {
//   console.log(`Server is running in port ${port}`);
// });

// const MONGODB = "mongodb://localhost:27017/mini-project";

// const server = new ApolloServer({
//   typeDefs,
//   resolvers,
// });

// mongoose
//   .connect(MONGODB, {
//     useNewUrlParser: true,
//   })
//   .then((res) => {
//     console.log("MongoDB Connected");
//   })
//   .catch((error) => {
//     console.log("Error Not Connect to MongoDB", error.message);
//   });
