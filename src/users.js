import { Router } from 'express';
import { pool } from './database/index.js';
const usersRouter = Router();

// // 로그인
// usersRouter.route('/login').post((req, res) => {
//   console.log('/login 호출됨');

//   const { id, password } = req.body;

//   const inputId = id || req.query.id;
//   const inputPassword = password || req.query.password;

//   if (req.session.user) {
//     console.log('이미 로그인되어 상품 페이지로 이동합니다.');
//     res.redirect('/public/product.html');
//   } else {
//     // 세션 저장
//     req.session.user = {
//       id: inputId,
//       name: '소녀시대',
//       authorized: true,
//     };
//     res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8' });
//     res.write(`<h1>로그인 성공</h1>`);
//     res.write(`id: ${inputId}, password: ${inputPassword}</p>`);
//     res.write(`<br><br><a href='/product'>상품페이지로 이동하기</a>`);
//     res.end();
//   }
// });

// // 로그아웃
// usersRouter.route('/logout').get((req, res) => {
//   console.log('/logout 호출됨');

//   if (req.session.user) {
//     // 로그인된 상태
//     console.log('로그아웃합니다.');
//     req.session.destroy((err) => {
//       if (err) throw err;

//       console.log('세션을 삭제하고 로그아웃되었습니다.');
//       res.redirect('../login.html');
//     });
//   } else {
//     // 로그인 안 된 상태
//     console.log('아직 로그인되어 있지 않습니다.');
//     res.redirect('/public/login.html');
//   }
// });

// usersRouter.route('/showCookie').get((req, res) => {
//   console.log('/showCookie 호출됨');
//   res.send(req.cookies);
// });

// usersRouter.route('/setCookie').get((req, res) => {
//   console.log('/setCookie 호출됨');

//   res.cookie('user', {
//     id: 'mike',
//     name: '소녀시대',
//     authorized: true,
//   });

//   res.redirect('/showCookie');
// });

// 로그인 처리 함수
usersRouter.route('/login').post(function (req, res) {
  console.log('/login 호출됨.');

  // 요청 파라미터 확인
  var paramId = req.body.id || req.query.id;
  var paramPassword = req.body.password || req.query.password;

  console.log('요청 파라미터 : ' + paramId + ', ' + paramPassword);

  // pool 객체가 초기화된 경우, authUser 함수 호출하여 사용자 인증
  if (pool) {
    authUser(paramId, paramPassword, function (err, rows) {
      // 에러 발생 시, 클라이언트로 에러 전송
      if (err) {
        console.error('사용자 로그인 중 에러 발생 : ' + err.stack);

        res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8' });
        res.write('<h2>사용자 로그인 중 에러 발생</h2>');
        res.write('<p>' + err.stack + '</p>');
        res.end();

        return;
      }

      // 조회된 레코드가 있으면 성공 응답 전송
      if (rows) {
        console.dir(rows);

        // 조회 결과에서 사용자 이름 확인
        var username = rows[0].name;

        res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8' });
        res.write('<h1>로그인 성공</h1>');
        res.write('<div><p>사용자 아이디 : ' + paramId + '</p></div>');
        res.write('<div><p>사용자 이름 : ' + username + '</p></div>');
        res.write("<br><br><a href='/public/login.html'>다시 로그인하기</a>");
        res.end();
      } else {
        // 조회된 레코드가 없는 경우 실패 응답 전송
        res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8' });
        res.write('<h1>로그인  실패</h1>');
        res.write('<div><p>아이디와 패스워드를 다시 확인하십시오.</p></div>');
        res.write("<br><br><a href='/public/login.html'>다시 로그인하기</a>");
        res.end();
      }
    });
  } else {
    // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
    res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8' });
    res.write('<h2>데이터베이스 연결 실패</h2>');
    res.write('<div><p>데이터베이스에 연결하지 못했습니다.</p></div>');
    res.end();
  }
});

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

  // pool 객체가 초기화된 경우, addUser 함수 호출하여 사용자 추가
  if (pool) {
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

// 사용자를 인증하는 함수
var authUser = function (id, password, callback) {
  console.log('authUser 호출됨 : ' + id + ', ' + password);

  // 커넥션 풀에서 연결 객체를 가져옴
  pool.getConnection(function (err, conn) {
    if (err) {
      if (conn) {
        conn.release(); // 반드시 해제해야 함
      }
      callback(err, null);
      return;
    }
    console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId);

    var columns = ['id', 'name', 'age'];
    var tablename = 'users';

    // SQL 문을 실행합니다.
    var exec = conn.query(
      'select ?? from ?? where id = ? and password = ?',
      [columns, tablename, id, password],
      function (err, rows) {
        conn.release(); // 반드시 해제해야 함
        console.log('실행 대상 SQL : ' + exec.sql);

        if (rows.length > 0) {
          console.log(
            '아이디 [%s], 패스워드 [%s] 가 일치하는 사용자 찾음.',
            id,
            password
          );
          callback(null, rows);
        } else {
          console.log('일치하는 사용자를 찾지 못함.');
          callback(null, null);
        }
      }
    );

    conn.on('error', function (err) {
      console.log('데이터베이스 연결 시 에러 발생함.');
      console.dir(err);

      callback(err, null);
    });
  });
};

//사용자를 등록하는 함수f
var addUser = function (id, name, age, password, callback) {
  console.log(
    'addUser 호출됨 : ' + id + ', ' + password + ', ' + name + ', ' + age
  );

  // 커넥션 풀에서 연결 객체를 가져옴
  pool.getConnection(function (err, conn) {
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
