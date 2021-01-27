const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatarURL: { type: String, required: false },
  subscription: {
    type: String,
    enum: ['free', 'pro', 'premium'],
    default: 'free',
  },
  contacts: [{ type: 'ObjectId', ref: 'Contact' }],
  token: { type: String, required: false },
});

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;
