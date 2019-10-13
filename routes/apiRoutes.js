const db = require("../models");

const controller = require("./controller/controllerFunctions");

module.exports = function (app) {
  // Get all examples
  let controlFunctions = new controller(db);

  //Gets data for autocomplete
  app.get("/api", function (req, res) {
    db.beers
      .findAll({
        attributes: ["beer_name", "beer_type", "brewrey"]
      })
      .then(result => {
        let data = {};
        result.forEach(elem => {
          data[`${elem.dataValues.beer_name}`] = null;
          data[`${elem.dataValues.beer_type}`] = null;
          data[`${elem.dataValues.brewrey}`] = null;
        });
        res.json(data);
      });
  });

  app.get("/api/beer/:id", (req, res) => {
    let beerId = req.params.id;
    controlFunctions.beerById(beerId, result => {
      res.json(result);
    });
  });
  app.delete("/api/beer/:id", (req, res) => {
    if (req.params.id === undefined) {
      res.sendStatus("404");
    } else {
      controlFunctions.deleteBeer(req.params.id, result => {
        res.sendStatus("200");
      });
    }
  });
  app.post("/api/beer", (req, res) => {
    let beerObj = {
      name: req.body.name,
      type: req.body.type,
      description: req.body.description,
      brewrey: req.body.brewrey
    };
    controlFunctions.addBeer(beerObj, result => {
      if (result) {
        window.location.reload();
      } else {
        res.sendStatus("404");
      }
    });
  });
  // post new revies
  app.post("/api/review", (req, res) => {
    let reviewObj = {
      rating: req.body.reviewRating,
      paragraph: req.body.reviewParagraph,
      userId: req.body.id,
      beerId: req.body.beerid
    };
    controlFunctions.addReview(reviewObj, result => {
      let user = {
        userName: req.session.userName,
        userId: req.session.userId
      };
      if (result.affectedRows !== 0) {
        controlFunctions.beerById(reviewObj.beerId, beerResult => {
          res.render("search-results", {
            user: user,
            beer: beerResult
          });
        });
      } else {
        res.render("404");
      }
    });
  });
  app.put("/api/beer/:id", (req, res) => {
    controlFunctions.calcRating(req.params.id, result => {
      if (result) {
        res.sendStatus("200");
      } else {
        res.sendStatus("404");
      }
    });
  });
  //grab all reviews by the id of a specific beer
  app.get("/api/review/:id", (req, res) => {
    if (req.params.id === undefined) {
      res.sendStatus("404");
    } else {
      controlFunctions.beerReviews(req.params.id, result => {
        res.json(result);
      });
    }
  });
  app.get("/api/user/:id", (req, res) => {
    if (req.params.id === undefined) {
      res.sendStatus("404");
    } else {
      controlFunctions.findAuthor(req.params.id, result => {
        res.json(result);
      });
    }
  });
  app.put("/api/user/:id", (req, res) => {
    let reqObj = {
      userId: req.params.id,
      newUrl: req.body.newUrl
    };
    controlFunctions.newProfilePic(reqObj, result => {
      if (result !== "404") {
        res.sendStatus("200");
      } else {
        res.sendStatus("404");
      }
    });
  });

  app.post("/login", (req, res) => {
    controlFunctions.login(req, userData => {
      if (userData !== "404") {
        req.session.userId = userData.userID;
        req.session.userName = userData.userName;
        req.session.userRole = userData.userRole;
        req.session.save();
        let user = {
          userName: req.session.userName,
          userId: req.session.userId
        };
        if (req.session.userRole === "admin") {
          res.render("admin", {
            msg: "Welcome Admin!",
            user: user
          });
        } else {
          res.render("index", {
            msg: "Welcome to H-town Brews!",
            msgTwo: "Search for beers to rate and review",
            user: user
          });
        }
      } else {
        res.sendStatus("404");
      }
    });
  });

  app.post("/api/newUser", (req, res) => {
    controlFunctions.newUserQuery(req, res, result => {
      if (result !== "404") {
        res.json(result);
      } else {
        res.sendStatus("404");
      }
    });
  });
  // DELETE or EDIT REVIEW
  app.delete("/api/review/:reviewId", (req, res) => {
    let reviewId = req.params.reviewId;
    db.reviews.destroy({ where: { id: reviewId } }).then((result) => {
      res.sendStatus(200);
    });
  });
};

