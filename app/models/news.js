const mongoose = require('mongoose');
let User = require('./user');

let newsSchema = new mongoose.Schema({
  title: String,
  body: String,
  posted_at: { type: Date, default: Date.now },
  posted_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
})

newsSchema.post('save', async (news) => {
  try {
    let user = await User.findById(news.posted_by);
    user.news.push(news._id)
    await user.save()
  } catch (error) {
    console.log(error)
  }
})

module.exports = mongoose.model('News', newsSchema);