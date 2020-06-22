var http = require("http");
var express = require("express");
var app = express();
var server = http.createServer(app);
var port = 3333;
var path = require("path");
var session = require("express-session");

require("dotenv").config();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SESSION_SECRET, // 암호화를 위한 키
    resave: false, // 바뀌지 않더라도 항상 저장할지 여부
    saveUninitialized: true,
  })
);

var indexRouter = require("./routes/index")(connection);
app.use("/", indexRouter);
var postsRouter = require("./routes/posts")(connection);
app.use("/posts", postsRouter);
var postRouter = require("./routes/post")(connection);
app.use("/post", postRouter);
var commentRouter = require("./routes/comment")(connection);
app.use("/comment", commentRouter);

app.listen(port, function () {
  console.log("웹서버 시작!", port);
});
