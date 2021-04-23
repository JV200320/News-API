var express = require('express');
var router = express.Router();
let User = require('../app/models/user');
let News = require('../app/models/news');
const WithAuth = require('../app/middlewares/auth');

router.post('/create', WithAuth, async (req, res, next) => {
  let { title, body } = req.body;
  //try {
  let news = new News({ title: title, body: body, posted_by: req.user._id });
  await news.save();
  next(news);
  res.status(200).json(news)
  //} catch (error) {
  res.status(500).json({ err: "error while creating new" })
  //}
})

module.exports = router;