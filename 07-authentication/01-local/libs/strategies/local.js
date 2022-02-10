const LocalStrategy = require('passport-local').Strategy;
const User = require('../../models/User');

module.exports = new LocalStrategy(
    {usernameField: 'email', session: false},
    async function(email, password, done) {
      let userData;
      try {
        userData = await User.findOne({email: email});
      } catch (e) {
        return done(null, false, 'Призошла ошибка при обращении к базе данных');
      }

      if (!userData) {
        return done(null, false, 'Нет такого пользователя');
      }

      if (await userData.checkPassword(password)) {
        return done(null, userData.toJSON());
      } else {
        return done(null, false, 'Неверный пароль');
      }
    },
);
