var express = require("express");
const db = require("../db");
var router = express.Router();
module.exports = function (connection) {
  //댓글 수정하기 페이지
  var db = require("../db")(connection);
  router
    .route("/edit/:commentId")
    .all(function (req, res, next) {
      if (!req.session.loggedIn) {
        res.redirect("/logout");
        return;
      } else {
        next();
      }
    })
    .get(function (req, res, next) {
      const commentId = req.params.commentId;
      db.getReply([commentId], function (err, comment) {
        if (err) {
          console.log(err);
          res.render("error");
        } else if (comment.length < 1) {
          res.render("error");
        } else {
          res.render("editComment", {
            user: req.session.loggedIn,
            post: req.session.post,
            comments: req.session.comments,
            comment: comment,
            action: "/comment/edit/" + commentId,
          });
        }
      });
    })
    .post(function (req, res, next) {
      const commentId = req.params.commentId;
      const contents = req.body.comment_contents;
      db.updateReply([contents, commentId], function (err, rows) {
        if (err) {
          console.log(err);
          res.render("error");
        } else {
          const postId = req.session.post.post_id;
          res.redirect("/post/" + postId);
        }
      });
    });
  //댓글 삭제하기 페이지
  router.get("/delete/:commentId", function (req, res, next) {
    if (!req.session.loggedIn) {
      res.redirect("/logout");
      return;
    }

    const commentId = req.params.commentId;
    db.deleteRely([commentId], function (err, rows) {
      if (err) {
        console.log(err);
        res.render("error");
      } else {
        const postId = req.session.post.post_id;
        res.redirect("/post/" + postId);
      }
    });
  });
  //댓글 좋아요 페이지
  router.get("/likes/:commentId", function (req, res, next) {
    if (!req.session.loggedIn) {
      res.redirect("/logout");
    } else {
      commentId = req.params.commentId;
      db.getGood([commentId], function (err, comment) {
        if (err) {
          console.log(err);
          res.render("error");
        } else if (comment.length < 1) {
          res.render("error");
        } else {
          const good = comment[0].good;
          db.updateGood([good + 1, commentId], function (err, rows) {
            if (err) {
              console.log(err);
              res.render("error");
            } else {
              const postId = req.session.post.post_id;
              res.redirect("/post/" + postId);
            }
          });
        }
      });
    }
  });
  return router;
};
