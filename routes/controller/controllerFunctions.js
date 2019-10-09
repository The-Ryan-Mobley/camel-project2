module.exports = function(db) {
  const crypto = require("crypto");
  this.searchBeers = async (keyword, callback) => {
    results = await db.beers.findAll({
      where: {
        beer_name: { $like: keyword }
      }
    });
    callback(results);
    console.table(results);
  };
  this.beerById = async (beerId, callback) => {
    results = await db.beers.findOne({
      where: {
        id: beerId
      }
    });
    callback(results);
  };
  /*will calculate the average rating of the beer by taking the review scores from the reviews table
  and calcing their average*/
  this.beerReviews = async (beerId, callback) => {
    //lists reviews by beer id
    result = await db.reviews.findAll({
      where: {
        id: beerId
      }
    });
    callback(result);
  };
  this.addReview = async (reviewObj, callback) => {
    //add review to table
    let result = await db.reviews.create({
      reviewRating: reviewObj.rating,
      reviewParagraph: reviewObj.paragraph,
      beerId: reviewObj.beerId,
      userId: reviewObj.userId
    });
    callback(result);
  };
  this.findReviewAuthor = async (authorId, callback) => {
    let result = await db.users.findOne({
      where: {
        id: authorId
      },
      attributes: ["username"]
    });
    if (result.length) {
      callback(result);
    } else {
      callback("404");
    }
  };
  this.userReviews = async user => {
    //lists reviews where review_author = user
  };
  //***************************************************password validation**************************************************** */
  this.getSalt = async username => {
    let result = db.users.findOne({
      where: { userName: username },
      attributes: { salt }
    });
    if (result.length) {
      console.table(result);
      return result[0];
    } else {
      console.log("err retrying");
      this.getSalt(username);
    }
  };
  this.genRandomString = length => {
    //makes the hash salt
    return crypto
      .randomBytes(Math.ceil(length / 2))
      .toString("hex") /** convert to hexadecimal format */
      .slice(0, length); /** return required number of characters */
  };
  this.sha512 = (password, salt) => {
    let hash = crypto.createHmac(
      "sha512",
      salt
    ); /** Hashing algorithm sha512 */
    hash.update(password.toString());
    let value = hash.digest("hex");
    return {
      salt: salt,
      passwordHash: value
    };
  };
  this.newUserQuery = async (req, res, callback) => {
    //hashes the password then stores user values and salt in DB
    let newUser = {
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      role: "guest"
    };
    let Salt = this.genRandomString(16); /** Gives us salt of length 16 */
    let passwordData = this.sha512(newUser.username, newUser.password, Salt);
    let result = await db.users.create({
      userName: newUser.username,
      email: newUser.email,
      password: passwordData.passwordHash,
      role: "guest",
      salt: passwordData.salt
    });

    if (result) {
      callback(result);
    } else {
      console.log("err");
    }
  };
  /*****************************************************Check Sessions*****************************************************/
  this.login = async (req, callback) => {
    const sess = req.session;
    const post = req.body;

    let userSalt = this.getSalt(post.userName);
    let name = post.userName;
    let pass = this.sha512(post.password, userSalt);
    let results = await db.users.findOne({
      where: {
        userName: name,
        password: pass
      }
    });

    if (results.length) {
      sess.userId = results[0].id;
      sess.user = results[0];
      console.log(results[0].id);
      let userData = {
        user: req.session.user,
        userID: req.session.userId
      };
      if (userId === null) {
        console.log("error");
        return;
      } else {
        callback(userData);
      }
    }
  };
  this.dashboard = async (req, res, data, callback) => {
    let result = await db.users.findOne({
      where: { id: data.userId }
    });
    if (result.length) {
      callback(result);
    } else {
      console.log("ERR");
    }

    if (results.length) {
      sess.userId = results.id;
      sess.user = results;
      console.log(results.id);
      let userData = {
        user: req.session.user,
        userID: req.session.userId
      };
      if (userId === null) {
        res.redirect("/", {
          msg: "Invalid Login",
          user: req.session.userName
        });
        return;
      } else {
        this.dashboard(req, res, userData);
      }
    } else {
      res.render("/", {
        msg: "Wrong Credentials",
        user: req.session.userName
      });
    }
  };
  this.dashboard = async (req, res, data) => {
    let result = db.users.findOne({
      where: { id: data.userId }
    });
    if (result.length) {
      res.render("/", {
        msg: "Welcome to H-town Brews!",
        user: data.user
      });
    } else {
      console.log("ERR");
    }
  };
};
