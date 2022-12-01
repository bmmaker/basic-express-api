// Passport 사용
import passport from 'passport';
import flash from 'connect-flash';
import passportLocal from 'passport-local';

//페스포트 로그인 설정
const LacalStrategy = passportLocal.Strategy;

const validateLogin = async (req, res, next) => {
  try {
    const result = passport.use(
      'local-login',
      new LacalStrategy(
        {
          usernameField: 'email',
          passwordField: 'password',
          passReqToCallback: true,
        },
        (req, email, password, done) => {
          db = app.get(db);
          db.User.findOne({ email }, (err, user) => {
            if (err) return done(err);
            if (!user) {
              console.log('계정이 일치하지 않음');
              return done(
                null,
                false,
                req.flash('loginMessage', '등록된 계정이 없습니다.')
              );
            }
          });
          /*
          const authenticated = user.authenticate(
            password,
            user._doc.salt,
            user._doc.hasheed_password
          );
          if (!authenticated) {
            console.log('비밀번호 일치하지 않음');
            return done(
              null,
              false,
              req.flash('loginMessage', ' 비밀번호가 일치하지 않습니다.')
            );
          }*/
          console.log('계정과 비밀번호가 일치함');
          return done(null, user);
        }
      )
    );
    if (result.done === (null, user)) {
      next();
    } else {
      throw console.error('error');
    }
  } catch (err) {
    next(err);
  }
};

export { validateLogin };
