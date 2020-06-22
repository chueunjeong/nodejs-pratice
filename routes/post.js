var express = require("express");
var router = express.Router();

module.exports = function (connection) {
  var db = require("../db")(connection);
  //글 상세 페이지
  router.get("/:postId", function (req, res, next) {
    if (!req.session.loggedIn) {
      res.redirect("/logout");
      return;
    }

    const postId = req.params.postId;

    db.getPostByPostId([postId], function (err, rows) {
      if (err) {
        console.log("에러가 발생했음" + err);
        res.render("error");
      } else if (rows.length < 1) {
        console.log("post 없음");
        res.render("error");
      } else {
        const post = rows[0];
        req.session.post = post;
        var hits = rows[0].hits;
        const userId = rows[0].user_id;
        db.getReplysByPostIdDesc([postId], function (err, comments) {
          if (err) {
            console.log(err);
            res.render("error");
          } else if (rows.length < 1) {
            //댓글이 없는 경우
            console.log("댓글이 없음");
            res.render("error");
          } else {
            //댓글이 있는 경우
            req.session.comments = comments;
            if (userId != req.session.loggedIn.id) {
              hits = hits + 1;
              //지금 로그인한 계정과 작성된 계정을 비교하여 아닐 경우만
              db.updateHitsByPostId([hits, postId], function (err, rows) {
                if (err) {
                  console.log(err);
                  res.render("error");
                } else {
                  res.render("post", {
                    user: req.session.loggedIn,
                    post: post,
                    comments: comments,
                  });
                }
              });
            } else {
              //같을 경우 더해주지 않는다.
              res.render("post", {
                user: req.session.loggedIn,
                post: post,
                comments: comments,
              });
            }
          }
        });
      }
    });
  });
  //글 삭제
  router.get("/delete/:postId", function (req, res, next) {
    if (!req.session.loggedIn) {
      res.redirect("/logout");
      return;
    }

    const postId = req.params.postId;
    db.deletePost([postId, postId], function (err, rows) {
      if (err) {
        console.log(err);
        res.render("error");
      } else {
        res.redirect("/posts");
      }
    });
  });
  //글 수정 페이지
  router
    .route("/edit/:postId")
    .all(function (req, res, next) {
      if (!req.session.loggedIn) {
        res.redirect("/logout");
        return;
      } else {
        next();
      }
    })
    .get(function (req, res, next) {
      const postId = req.params.postId;
      db.getPostByPostIdAndUserId([req.session.loggedIn.id, postId], function (
        err,
        rows
      ) {
        if (err) {
          console.log(err);
          res.render("error");
        } else if (rows.length < 1) {
          res.render("eroor");
        } else {
          res.render("editPost", {
            user: req.session.loggedIn,
            post: rows[0],
            action: "/post/edit/" + postId,
          });
        }
      });
    })
    .post(function (req, res, next) {
      const title = req.body.title;
      const contents = req.body.contents;
      const postId = req.params.postId;
      db.updatePost(
        [title, contents, req.session.loggedIn.id, postId],
        function (err, rows) {
          if (err) {
            console.log(err);
            res.render("error");
          } else {
            res.redirect("/posts");
          }
        }
      );
    });
  router.get("/likes/:postId", function (req, res, next) {
    if (!req.session.loggedIn) {
      res.redirect("/logout");
    } else {
      const postId = req.params.postId;
      //post_good 테이블(posts테이블과 users테이블의 기본키로만 구성된 테이블)에 좋아요를 했는지 확인하기 ->해당 유저가 해당 글에 좋아요를 눌렀는지
      db.getPostGood([req.session.loggedIn.id, postId], function (err, post) {
        if (err) {
          console.log(err);
          res.render("error");
        } else if (post.length < 1) {
          //조회되지 않는다면 아직 좋아요를 누른 것이 아니므로 post_good 테이블에 해당 유저가 해당 글을 좋아요를 눌렀음을 추가
          db.insertPostGood([req.session.loggedIn.id, postId], function (
            err,
            rows
          ) {
            if (err) {
              console.log(err);
              res.render("error");
            } else {
              //posts테이블 good으로 저장된 값 조회한 후 조회한 값에 +1
              db.getGoodByPostId([postId], function (err, post) {
                if (err) {
                  console.log(err);
                  res.render("error");
                } else if (post.length < 1) {
                  console.log(err);
                  res.render("error");
                } else {
                  const good = post[0].good;
                  connection.query(
                    "UPDATE posts SET good = ? WHERE post_id = ?;",
                    [good + 1, postId],
                    function (err, rows) {
                      if (err) {
                        console.log(err);
                        res.render("error");
                      } else {
                        res.redirect("/post/" + postId);
                      }
                    }
                  );
                }
              });
            }
          });
        } else {
          //조회가 된다면 이미 해당 유저가 좋아요를 눌렀다는 뜻이므로 좋아요 비활성화로 그냥 리다이렉트
          console.log("이미 눌렀음!");
          res.redirect("/post/" + postId);
        }
      });
    }
  });
  //댓글 작성하기
  router.post("/comment/:postId", function (req, res, next) {
    if (!req.session.loggedIn) {
      res.redirect("/logout");
    } else {
      console.log(req.body);
      const postId = req.params.postId;
      const contents = req.body.comments1;
      db.insertPostReply([req.session.loggedIn.id, postId, contents], function (
        err,
        rows
      ) {
        if (err) {
          console.log(err);
          res.render("error");
        } else {
          res.redirect("/post/" + postId);
        }
      });
    }
  });

  return router;
};
