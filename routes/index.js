var express = require("express");
var router = express.Router();

module.exports = function (connection) {
  var db = require("../db")(connection);
  //홈페이지
  router.get("/", function (req, res, next) {
    res.render("home", { user: req.session.loggedIn });
  });
  //유저목록 페이지
  router.get("/list", function (req, res, next) {
    db.getUserList(function (err, users) {
      if (err) {
        console.log("에러가 발생했음" + err);
        res.render("error");
      } else {
        res.render("list", { users: users, user: req.session.loggedIn });
      }
    });
  });

  //로그인 페이지
  router
    .route("/login")
    .get(function (req, res, next) {
      res.render("login", { error: false, user: req.session.loggedIn });
    })
    .post(function (req, res, next) {
      const email = req.body.email;
      const password = req.body.password;
      db.getLoginUser([email, password], function (err, users) {
        // 에러
        if (err) {
          console.log(err);
          res.render("error");
          // 로그인 성공
        } else if (users.length > 0) {
          req.session.loggedIn = users[0];
          res.redirect("/");
          // 로그인 실패
        } else {
          res.render("login", { error: true, user: req.session.loggedIn });
        }
      });
    });
  //로그아웃 페이지
  router.get("/logout", function (req, res, next) {
    if (req.session.loggedIn) {
      req.session.destroy(function (err) {
        if (err) {
          console.log(err);
          res.render("error");
        } else res.redirect("/");
      });
    } else {
      res.redirect("/");
    }
  });

  //회원가입 페이지
  router
    .route("/signup")
    .get(function (req, res, next) {
      res.render("signup", { errorMessage: null, user: req.session.loggedIn });
    })
    .post(function (req, res, next) {
      const email = req.body.email;
      const password = req.body.password;

      db.getUserByEmail(email, function (err, users) {
        if (err) {
          // 이메일 중복 체크 오류
          res.render("signup", {
            errorMessage: "이메일 중복체크 오류",
            user: req.session.loggedIn,
          });
        } else if (users.length > 0) {
          // 이메일 중복시
          res.render("signup", {
            errorMessage: "이미 존재하는 이메일",
            user: req.session.loggedIn,
          });
        } else {
          // 이메일 중복 없을 때 회원가입 처리
          db.insertUser([email, password], function (err2, result) {
            if (err2) {
              // 회원가입 오류
              console.log("err -> ", err2);
              res.render("signup", {
                errorMessage: "생성 오류",
                user: req.session.loggedIn,
              });
            } else {
              // 회원가입 성공
              res.redirect("/login");
            }
          });
        }
      });
    });

  return router;
};
// module.exports = router;
