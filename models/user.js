const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema ({
  email: {
    type: String,
    required: true,
    unique: true
  }
})

// this will add a username, password field and additional methods
UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', UserSchema)