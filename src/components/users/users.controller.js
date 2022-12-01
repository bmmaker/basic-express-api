import { db } from '../../config/db';

const loginCont = function (req, res) {
  console.log('/login 호출됨.');

  // 요청 파라미터 확인
  var paramId = req.body.id || req.query.id;
  var paramPassword = req.body.password || req.query.password;

  console.log('요청 파라미터 : ' + paramId + ', ' + paramPassword);

  // db 객체가 초기화된 경우, authUser 함수 호출하여 사용자 인증
  if (db) {
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
};

// 사용자를 인증하는 함수
var authUser = function (id, password, callback) {
  console.log('authUser 호출됨 : ' + id + ', ' + password);

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

    var columns = ['id', 'name', 'age'];
    var tablename = 'users';

    // SQL 문을 실행합니다.
    var exec = conn.query(
      'select ?? from ?? where id = ? and password = ?',
      [columns, tablename, id, password],
      function (err, rows) {
        conn.release(); // 반드시 해제해야 함
        console.log('실행 대상 SQL : ' + exec.sql);

        if (rows?.length > 0) {
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

export { loginCont };
