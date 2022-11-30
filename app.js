// Express 기본 모듈
import express from 'express';
import http from 'http';

// Express 미들웨어
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import serveStatic from 'serve-static';

// 오류핸들러
import expressErrorHandler from 'express-error-handler';

// 세션 미들웨어
import expressSession from 'express-session';

// 파일업로드용 미들웨어
import multer from 'multer';
import fs from 'fs';

// 클라이언트에서 ajax로 요청했을 때 CORS(다중 서버 접속) 지원
import cors from 'cors';

// MySQL 데이터베이스를 사용할 수 있는 mysql 모듈 불러오기
import mysql from 'mysql';

// MySQL 데이터베이스 연결 설정
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'test',
  debug: false,
});

// 익스프레스 객체 생성
const app = express();

// 기본 속성 설정
app.set('port', process.env.PORT || 3002);

// body-parser 사용하여 파싱
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// static 폴더 설정
app.use('/public', serveStatic('public'));
app.use('/upload', serveStatic('upload'));

// cookie-parser 설정
app.use(cookieParser());

// 세션 설정
app.use(
  expressSession({
    secret: 'askfsdlfwiueff',
    resave: true,
    saveUninitialized: true,
  })
);

// CORS 설정
app.use(cors());

// multer 미들웨어 사용
// 미들웨어 사용순서 중요 body-parser -> multer -> router
// 파일제한: 10개, 1GB
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'uploads');
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname + Date.now());
  },
});

const upload = multer({
  storage: storage,
  limits: {
    files: 10,
    fileSize: 1024 * 1024 * 1024,
  },
});

// 라우터 사용하여 라우팅 함수 등록
const router = express.Router();

// 사진 업로드
router.route('/api/photo').post(upload.array('photo', 1), (req, res) => {
  console.log('/api/photo 호출됨');

  try {
    var files = req.files;

    console.dir('#===== 업로드된 첫번째 파일 정보 =====#');
    console.dir(req.files[0]);
    console.dir('#=====#');

    // 현재의 파일 정보를 저장할 변수 선언
    var originalname = '',
      filename = '',
      mimetype = '',
      size = 0;

    if (Array.isArray(files)) {
      // 배열에 들어가 있는 경우 (설정에서 1개의 파일도 배열에 넣게 했음)
      console.log('배열에 들어있는 파일 갯수 : %d', files.length);

      for (var index = 0; index < files.length; index++) {
        originalname = files[index].originalname;
        filename = files[index].filename;
        mimetype = files[index].mimetype;
        size = files[index].size;
      }
    } else {
      // 배열에 들어가 있지 않은 경우 (현재 설정에서는 해당 없음)
      console.log('파일 갯수 : 1 ');

      originalname = files[index].originalname;
      filename = files[index].name;
      mimetype = files[index].mimetype;
      size = files[index].size;
    }

    console.log(
      '현재 파일 정보 : ' +
        originalname +
        ', ' +
        filename +
        ', ' +
        mimetype +
        ', ' +
        size
    );

    // 클라이언트에 응답 전송
    res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8' });
    res.write('<h3>파일 업로드 성공</h3>');
    res.write('<hr/>');
    res.write(
      '<p>원본 파일명 : ' +
        originalname +
        ' -> 저장 파일명 : ' +
        filename +
        '</p>'
    );
    res.write('<p>MIME TYPE : ' + mimetype + '</p>');
    res.write('<p>파일 크기 : ' + size + '</p>');
    res.end();
  } catch (err) {
    console.dir(err.stack);
  }
});

router.route('/api/product').get((req, res) => {
  console.log('/api/product 호출됨');

  if (req.session.user) {
    res.redirect('/public/product.html');
  } else {
    res.redirect('/public/login.html');
  }
});

// 로그인
router.route('/api/login').post((req, res) => {
  console.log('/api/login 호출됨');

  const { id, password } = req.body;

  const inputId = id || req.query.id;
  const inputPassword = password || req.query.password;

  if (req.session.user) {
    console.log('이미 로그인되어 상품 페이지로 이동합니다.');
    res.redirect('/public/product.html');
  } else {
    // 세션 저장
    req.session.user = {
      id: inputId,
      name: '소녀시대',
      authorized: true,
    };
    res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8' });
    res.write(`<h1>로그인 성공</h1>`);
    res.write(`id: ${inputId}, password: ${inputPassword}</p>`);
    res.write(`<br><br><a href='/api/product'>상품페이지로 이동하기</a>`);
    res.end();
  }
});

// 로그아웃
router.route('/api/logout').get((req, res) => {
  console.log('/api/logout 호출됨');

  if (req.session.user) {
    // 로그인된 상태
    console.log('로그아웃합니다.');
    req.session.destroy((err) => {
      if (err) throw err;

      console.log('세션을 삭제하고 로그아웃되었습니다.');
      res.redirect('../login.html');
    });
  } else {
    // 로그인 안 된 상태
    console.log('아직 로그인되어 있지 않습니다.');
    res.redirect('/public/login.html');
  }
});

router.route('/api/showCookie').get((req, res) => {
  console.log('/api/showCookie 호출됨');
  res.send(req.cookies);
});

router.route('/api/setCookie').get((req, res) => {
  console.log('/api/setCookie 호출됨');

  res.cookie('user', {
    id: 'mike',
    name: '소녀시대',
    authorized: true,
  });

  res.redirect('/api/showCookie');
});

// 로그인 처리 함수
router.route('/process/login').post(function (req, res) {
  console.log('/process/login 호출됨.');

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
        res.write("<br><br><a href='/public/login2.html'>다시 로그인하기</a>");
        res.end();
      } else {
        // 조회된 레코드가 없는 경우 실패 응답 전송
        res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8' });
        res.write('<h1>로그인  실패</h1>');
        res.write('<div><p>아이디와 패스워드를 다시 확인하십시오.</p></div>');
        res.write("<br><br><a href='/public/login2.html'>다시 로그인하기</a>");
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
router.route('/process/adduser').post(function (req, res) {
  console.log('/process/adduser 호출됨.');

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

          console.log('inserted ' + result.affectedRows + ' rows');

          var insertId = result.insertId;
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

// 라우터 객체 등록
app.use('/', router);

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

//사용자를 등록하는 함수
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

app.use('/', router);

// 오류 핸들러 A
// app.all('*', (req, res) => {
//   res.status(404).send('<h1>ERROR - 페이지를 찾을 수 없습니다.</h1>');
// });

// 오류 핸들러 B
const errorHandler = expressErrorHandler({
  static: {
    404: '/public/404.html',
  },
});

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

http.createServer(app).listen(app.get('port'), function () {
  console.log('익스프레스 서버를 시작했습니다.' + app.get('port'));
});
