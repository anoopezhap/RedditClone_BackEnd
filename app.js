const express = require("express");
const userRouter = require("./routes/userRoutes");
const threadRouter = require("./routes/threadRoutes");
const commentRouter = require("./routes/commentRoutes");
const likeRouter = require("./routes/likeRoutes");
const globalErrorHandler = require("./controllers/errorController");

const app = express();
const cors = require("cors");

app.use(cors());

//middle ware to acces req body
app.use(express.json());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/threads", threadRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/like", likeRouter);

app.use(globalErrorHandler);

module.exports = app;
