const User = require('../../models/User');

module.exports = async function authenticate(strategy, email, displayName, done) {
  let userData;

  if (!email) {
    return done(null, false, 'Не указан email');
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
