var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
let User = require('../app/models/user');
let News = require('../app/models/news');
require('dotenv').config();
const secret = process.env.JWT_TOKEN;
const WithAuth = require('../app/middlewares/auth');
const bcrypt = require('bcrypt');


router.post('/register', async (req, res, next) => {
  let { username, email, password } = req.body;
  const newUser = new User({ username, email, password })
  try {
    await newUser.save();
    res.status(200).json(newUser)
  } catch (error) {
    res.status(500).json({ err: 'Error while registering new user.' })
  }
});

router.post('/login', async (req, res) => {
  let { email, password } = req.body;
  try {
    let user = await User.findOne({ email: email });
    if (user) {
      user.isCorrectPassword(password, function (err, same) {
        if (same) {
          const token = jwt.sign({ email }, secret, { expiresIn: '1d' });
          res.status(200).json({ user: user, token: token })
        } else {
          res.status(401).json({ err: "Invalid email or password." })
        }
      })
    } else {
      res.status(401).json({ err: "Invalid email or password." })
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal error while logging in, please try again.' })
  }
})

router.delete('/delete', WithAuth, async (req, res) => {
  try {
    for (let i = 0; i <= req.user.news.length - 1; i++) {
      await News.findByIdAndDelete(req.user.news[i])
    }
    await User.findByIdAndDelete(req.user._id)
    res.status(200).json(req.user)
  } catch (error) {
    res.status(500).json({ error: 'Internal error while deleting user, please try again.' })
  }
})

async function UpdateDifferent(hashedPassword, combo) {
  await User.findOneAndUpdate({ _id: combo.user._id }, { $set: { email: combo.email, password: hashedPassword } })
}
async function UpdateSame(combo) {
  await User.findOneAndUpdate({ _id: combo.user._id }, { $set: { email: combo.email } })
}

router.put('/update', WithAuth, async (req, res, next) => {
  let user = req.user;
  let { email, password } = req.body;
  let combo = {
    user: user,
    email: email,
    password: password
  }
  try {
    user.isCorrectPassword(password, function (err, same) {
      if (!same) {
        bcrypt.hash(password, 10, (err, hashedPassword) => {
          if (err) {
            console.log(err)
          } else {
            UpdateDifferent(hashedPassword, combo)
            res.status(200).json({ result: "different" })
          }
        })
      } else {
        UpdateSame(combo);
        res.status(200).json({ result: "equal" })
      }
    })
  } catch (error) {
    res.status(500).json({ error: 'Internal error while deleting user, please try again.' })
  }
})


module.exports = router;
