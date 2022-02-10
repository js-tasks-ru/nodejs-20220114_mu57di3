const User = require('../../models/User');
const mongoose = require('mongoose');

module.exports = async function authenticate(strategy, email, displayName, done) {
  let userData;

  if (!email) {
    done(null, false, 'Не указан email');
  }

  userData = await User.findOne({email: email});

  if (!userData) {
    try {
      userData = await User.create({email: email, displayName: displayName});
    } catch (e) {
      return done(e);
    }
  }

  return done(null, userData);
};
