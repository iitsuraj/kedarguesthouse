var express = require("express");
var router = express.Router();
var Faq = require("../models/faq");
var Subscriber = require("../models/subscriber");
var Info = require("../models/info");
var Review = require("../models/review");
var async = require("async");
const multer = require("multer");
var fs = require("fs");
var Room = require("../models/room");
var Booking = require("../models/booking");
var moment = require("moment");
const { Parser } = require("json2csv");
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});

router.get("/", async function(req, res) {
  var rooms = await Room.find({})
    .sort({ createdAt: -1 })
    .exec();
  res.render("panel/index", { rooms: rooms });
});
router.get("/room/:id", function(req, res, next) {
  Room.remove({ _id: req.params.id }).exec(function(err) {
    if (err) {
      res.redirect("/404");
    } else {
      res.redirect("/panel");
    }
  });
});
router.post("/", upload.single("productImage"), function(req, res, next) {
  var room = new Room();
  room.type = req.body.type;
  room.price = req.body.price;
  room.image = req.file.originalname;
  room.save(function(err, save) {
    res.redirect("/panel");
  });
});
router.get("/info", function(req, res, next) {
  res.render("panel/info");
});
router.post("/info", upload.single("image"), function(req, res, next) {
  var info = new Info();
  info.info = req.body.info;
  info.video = req.body.video;
  info.image = req.body.image;
  info.save(function(err) {
    if (err) return next(err);
    res.redirect("/panel/info");
  });
});
router.get("/booking", async function(req, res, next) {
  var bookings = await Booking.find({})
    .sort({ createdAt: -1 })
    .populate("room", ["type"])
    .exec();
  res.render("panel/booking", { bookings: bookings, moment: moment });
});
router.get("/booking/all.csv", async function(req, res, next) {
  var booking = await Booking.find({})
    .sort({ createdAt: -1 })
    .populate("room", ["type"])
    .exec();
  const fields = [
    "firstname",
    "mobilenumber",
    "email",
    "checkin",
    "checkout",
    "room.type",
    "paymentid"
  ];
  const json2csvParser = new Parser({ fields, unwind: ["room"] });
  const csv = json2csvParser.parse(booking);
  res.attachment("allbooking.csv");
  res.status(200).send(csv);
});
router.get("/faq", async function(req, res) {
  var faqs = await Faq.find({})
    .sort({ createdAt: -1 })
    .exec();
  res.render("panel/faq", { faqs: faqs });
});
router.get("/faq/:id", function(req, res, next) {
  Faq.remove({ _id: req.params.id }).exec(function(err) {
    if (err) {
      res.redirect("/404");
    } else {
      res.redirect("/panel/faq");
    }
  });
});
router.post("/faq", function(req, res, next) {
  var faq = new Faq();
  faq.question = req.body.question;
  faq.answer = req.body.answer;
  faq.save(function(err, save) {
    if (err) return next(err);
    res.redirect("/panel/faq");
  });
});

router.get("/subscriber", async function(req, res) {
  var subscriber = await Subscriber.find(
    {},
    {
      _id: 0,
      email: 1
    }
  )
    .sort({ createdAt: -1 })
    .limit(10)
    .exec();
  res.render("panel/subscriber", { subscriber: subscriber });
});

router.get("/subscriber/all.csv", async function(req, res, next) {
  var subscriber = await Subscriber.find({})
    .sort({ createdAt: -1 })
    .exec();
  const fields = ["email"];
  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(subscriber);
  res.attachment("allsubscriber.csv");
  res.status(200).send(csv);
});

router.get("/review", async function(req, res) {
  var reviews = await Review.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .exec();
  res.render("panel/review", { reviews: reviews });
});
router.get("/review/all.csv", async function(req, res, next) {
  var review = await Review.find({})
    .sort({ createdAt: -1 })
    .exec();
  const fields = ["name", "email", "comment"];
  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(review);
  res.attachment("allreview.csv");
  res.status(200).send(csv);
});
router.get("/review/:id", function(req, res, next) {
  Review.findById({ _id: req.params.id }, function(err, review) {
    review.home = !review.home;
    review.save(function(err, save) {
      if (err) return res.redirect("/404");
      res.redirect("/panel/review");
    });
  });
});
router.get("/writeareview", function(req, res, next) {
  res.render("main/writereview");
});
router.post("/writeareview", function(req, res, next) {
  var review = new Review();
  review.name = req.body.name;
  review.email = req.body.email;
  review.comment = req.body.comment;
  review.save(function(err, save) {
    if (err) return res.redirect("/404");
    res.redirect("/");
  });
});
module.exports = router;
