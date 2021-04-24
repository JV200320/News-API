var express = require('express');
var router = express.Router();
let User = require('../app/models/user');
let News = require('../app/models/news');
const WithAuth = require('../app/middlewares/auth');

router.post('/create', WithAuth, async (req, res, next) => {
  let { title, body } = req.body;
  try {
    let news = new News({ title: title, body: body, posted_by: req.user._id });
    await news.save();
    next(news);
    res.status(200).json(news)
  } catch (error) {
    res.status(500).json({ err: "error while creating new" })
  }
})

router.delete('/delete/:id', WithAuth, async (req, res, next) => {
  let { id } = req.params;
  let user = req.user;
  try {
    let news = await News.findById(id)
    await news.remove(id)
    res.status(200).json(news)
  } catch (error) {
    res.status(500).json({ err: "error while deleting new" })
  }

})

router.get('/user', WithAuth, async (req, res) => {
  let user = await User.findById(req.user._id);
  let userNews = [];
  try {
    for (let i = 0; i <= user.news.length - 1; i++) {
      let add = await News.findById(user.news[i]);
      userNews.push(add)
    }
    res.status(200).json({ userNews })
  } catch (error) {
    res.status(500).json({ err: "error while finding user news" })
  }
})

router.get('/', WithAuth, async (req, res) => {
  let news = await News.find()
  try {
    res.status(200).json({ news })
  } catch (error) {
    res.json({ error: error }).status(500)
  }
})

router.get('/search', WithAuth, async (req, res) => {
  const { query } = req.query;
  try {
    let news = await News
      .find({ $text: { $search: query } });
    res.json(news).status(200);
  } catch (error) {
    res.json({ error: error }).status(500)
  }
})

router.get('/search/:id', WithAuth, async (req, res) => {
  const { query } = req.query;
  const { id } = req.params
  try {
    let news = await News
      .find({ posted_by: id })
      .find({ $text: { $search: query } });
    res.json(news).status(200);
  } catch (error) {
    res.json({ error: error }).status(500)
  }
})

module.exports = router;