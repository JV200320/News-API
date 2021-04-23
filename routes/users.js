var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
let User = require('../app/models/user')
require('dotenv').config();
const secret = process.env.JWT_TOKEN;


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
    res.status(500).json({ error: 'Internal error, please try again.' })
  }
})

module.exports = router;
