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
app.set('port', process.env.PORT || 3001);

// body-parser 사용하여 파싱
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// static 폴더 설정
app.use('/public', serveStatic('public'));
app.use('/upload', serveStatic('upload'));

// 세션 설정
app.use(cookieParser());
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

router.route('/api/books').get((req, res) => {
  console.log('/books 처리함');

  console.log(req.query);

  // res.send("<img src='/img/code.png'>");

  const query = req.query;
  const key = Object.keys(query);
  const value = query[key[0]];
  res.writeHead('200', {
    'Content-Type': 'text/html;charset=utf8',
  });
  res.write(`<h1>Express 서버에서 응답한 결과입니다.</h1>`);
  res.write(`${key}: ${value}</p>`);
  res.end();
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
