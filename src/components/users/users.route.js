import { Router } from 'express';
import { db } from '../../config/db';
import { loginCont } from './users.controller';
// import flash from 'connect-flash';
const usersRouter = Router();

usersRouter.get('/login', (req, res) => {
  console.log('/login 패스 요청됨');
  res.render('login.ejs', { message: req.flash('loginMessage') });
});
// 로그인 처리 함수
usersRouter.post('/login', loginCont);

// 사용자 추가 라우팅 함수
usersRouter.route('/adduser').post(function (req, res) {
  console.log('/adduser 호출됨.');

  var paramId = req.body.id || req.query.id;
  var paramPassword = req.body.password || req.query.password;
  var paramName = req.body.name || req.query.name;
  var paramAge = req.body.age || req.query.age;

  console.log(
    '요청 파라미터 : ' +
      paramId +
      ', ' +
      paramPassword +
      ', ' +
      paramName +
      ', ' +
      paramAge
  );

  // db 객체가 초기화된 경우, addUser 함수 호출하여 사용자 추가
  if (db) {
    addUser(
      paramId,
      paramName,
      paramAge,
      paramPassword,
      function (err, addedUser) {
        // 동일한 id로 추가하려는 경우 에러 발생 - 클라이언트로 에러 전송
        if (err) {
          console.error('사용자 추가 중 에러 발생 : ' + err.stack);

          res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8' });
          res.write('<h2>사용자 추가 중 에러 발생</h2>');
          res.write('<p>' + err.stack + '</p>');
          res.end();

          return;
        }

        // 결과 객체 있으면 성공 응답 전송
        if (addedUser) {
          console.dir(addedUser);

          console.log('inserted ' + addedUser.affectedRows + ' rows');

          var insertId = addedUser.insertId;
          console.log('추가한 레코드의 아이디 : ' + insertId);

          res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8' });
          res.write('<h2>사용자 추가 성공</h2>');
          res.end();
        } else {
          res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8' });
          res.write('<h2>사용자 추가  실패</h2>');
          res.end();
        }
      }
    );
  } else {
    // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
    res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8' });
    res.write('<h2>데이터베이스 연결 실패</h2>');
    res.end();
  }
});

//사용자를 등록하는 함수f
var addUser = function (id, name, age, password, callback) {
  console.log(
    'addUser 호출됨 : ' + id + ', ' + password + ', ' + name + ', ' + age
  );

  // 커넥션 풀에서 연결 객체를 가져옴
  db.getConnection(function (err, conn) {
    if (err) {
      if (conn) {
        conn.release(); // 반드시 해제해야 함
      }

      callback(err, null);
      return;
    }
    console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId);

    // 데이터를 객체로 만듦
    var data = { id: id, name: name, age: age, password: password };

    // SQL 문을 실행함
    var exec = conn.query(
      'insert into users set ?',
      data,
      function (err, result) {
        conn.release(); // 반드시 해제해야 함
        console.log('실행 대상 SQL : ' + exec.sql);

        if (err) {
          console.log('SQL 실행 시 에러 발생함.');
          console.dir(err);

          callback(err, null);

          return;
        }

        callback(null, result);
      }
    );

    conn.on('error', function (err) {
      console.log('데이터베이스 연결 시 에러 발생함.');
      console.dir(err);

      callback(err, null);
    });
  });
};

export { usersRouter };
