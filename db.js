var mysql = require("mysql2");
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

module.exports = function (connection) {
  var sendQuery = function (query, callback, params = null) {
    connection.query(query, params, function (err, result) {
      if (err) return callback(err);
      callback(null, result);
    });
  };
  return {
    getUserList: function (callback) {
      sendQuery("SELECT * FROM users", callback);
    },
    getLoginUser: function (params, callback) {
      sendQuery(
        "SELECT * FROM users WHERE email = ? and password = ?",
        callback,
        params
      );
    },
    getUserByEmail: function (params, callback) {
      sendQuery("SELECT * FROM users WHERE email = ?", callback, params);
    },
    insertUser: function (params, callback) {
      sendQuery(
        `INSERT INTO users(email, password)
        VALUES (?, ?)`,
        callback,
        params
      );
    },
    getPosts: function (callback) {
      sendQuery(
        `SELECT post_id, title, email,hits,good FROM posts 
        LEFT JOIN users ON user_id = users.id`,
        callback
      );
    },
    insertPost: function (params, callback) {
      sendQuery(
        "INSERT INTO posts(title, contents, user_id) VALUES(?, ?, ?)",
        callback,
        params
      );
    },
    getPostByPostId: function (params, callback) {
      sendQuery(
        `SELECT user_id, post_id, title, contents, email,hits
        FROM posts
            LEFT JOIN users ON user_id = users.id
            WHERE post_id = ?`,
        callback,
        params
      );
    },
    getReplysByPostIdDesc: function (params, callback) {
      sendQuery(
        "SELECT * FROM test.post_reply WHERE post_id = ? ORDER BY creation_date desc;",
        callback,
        params
      );
    },
    updateHitsByPostId: function (params, callback) {
      sendQuery(
        "UPDATE posts SET hits = ? WHERE post_id = ?",
        callback,
        params
      );
    },
    deletePost: function (params, callback) {
      sendQuery(
        "START TRANSACTION;DELETE FROM post_good WHERE post_id =?;DELETE FROM posts WHERE post_id = ?; COMMIT;",
        callback,
        params
      );
    },
    getPostByPostIdAndUserId: function (params, callback) {
      sendQuery(
        `SELECT * FROM posts 
        WHERE user_id = ? and post_id = ?`,
        callback,
        params
      );
    },
    updatePost: function (params, callback) {
      sendQuery(
        "UPDATE posts SET title = ?, contents = ?, user_id = ? WHERE post_id = ?",
        callback,
        params
      );
    },
    getPostGood: function (params, callback) {
      sendQuery(
        "SELECT * FROM post_good WHERE user_id = ? && post_id = ?",
        callback,
        params
      );
    },
    insertPostGood: function (params, callback) {
      sendQuery(
        "INSERT INTO post_good (user_id,post_id) VALUES (?,?);",
        callback,
        params
      );
    },
    getGoodByPostId: function (params, callback) {
      sendQuery("SELECT good FROM posts WHERE post_id = ?", callback, params);
    },
    updateGoodByPostId: function (params, callback) {
      sendQuery(
        "UPDATE posts SET good = ? WHERE post_id = ?;",
        callback,
        params
      );
    },
    insertPostReply: function (params, callback) {
      sendQuery(
        "INSERT INTO post_reply(user_id,post_id,contents,creation_date) VALUES(?, ?, ?,now())",
        callback,
        params
      );
    },
    getReply: function (params, callback) {
      sendQuery(
        `SELECT * FROM post_reply 
            WHERE id = ?`,
        callback,
        params
      );
    },
    updateReply: function (params, callback) {
      sendQuery(
        "UPDATE post_reply SET contents = ?, creation_date = now() WHERE id = ?",
        callback,
        params
      );
    },
    deleteRely: function (params, callback) {
      sendQuery("DELETE FROM post_reply WHERE id = ?", callback, params);
    },
    getGood: function (params, callback) {
      sendQuery("SELECT good FROM post_reply WHERE id = ?", callback, params);
    },
    updateGood: function (params, callback) {
      sendQuery(
        "UPDATE post_reply SET good = ? WHERE id = ?;",
        callback,
        params
      );
    },
  };
};
