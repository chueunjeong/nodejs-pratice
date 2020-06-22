var express = require("express");
const db = require("../db");
var router = express.Router();

module.exports = function (connection) {
  var db = require("../db")(connection);
  //전체 글 목록 페이지
  router
    .route("/")
    .all(function (req, res, next) {
      if (!req.session.loggedIn) {
        res.redirect("/logout");
        return;
      } else {
        next();
      }
    })
    .get(function (req, res, next) {
      db.getPosts(function (err, rows) {
        if (err) {
          console.log(err);
          res.render("error");
        } else {
          // connection.query('')
          res.render("posts", {
            user: req.session.loggedIn,
            posts: rows,
          });
        }
      });
    });
  //글 작성 페이지
  router
    .route("/create")
    .all(function (req, res, next) {
      if (!req.session.loggedIn) {
        res.redirect("/logout");
        return;
      } else {
        next();
      }
    })
    .get(function (req, res, next) {
      res.render("editPost", {
        user: req.session.loggedIn,
        post: { title: "", contents: "" },
        action: "/posts/create",
      });
    })
    .post(function (req, res, next) {
      const title = req.body.title;
      const contents = req.body.contents;
      db.insertPost([title, contents, req.session.loggedIn.id], function (
        err,
        rows
      ) {
        if (err) {
          console.log(err);
          res.render("error");
        } else {
          res.redirect("/posts");
        }
      });
    });

  return router;
};
