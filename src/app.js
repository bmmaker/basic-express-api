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

// 클라이언트에서 ajax로 요청했을 때 CORS(다중 서버 접속) 지원
import cors from 'cors';

import { router } from './routes.js';

// 익스프레스 객체 생성
const app = express();

// 기본 속성 설정
app.set('port', process.env.PORT || 3002);

// body-parser 사용하여 파싱
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// static 폴더 설정
app.use('/public', serveStatic('public'));
app.use('/uploads', serveStatic('uploads'));

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

// 라우터 설정
app.use(router);

// 404 에러 페이지 처리
var errorHandler = expressErrorHandler({
  static: {
    404: './public/404.html',
  },
});

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

// 오류 핸들러
// app.all('*', (req, res) => {
//   res.status(404).send('<h1>ERROR - 페이지를 찾을 수 없습니다.</h1>');
// });

http.createServer(app).listen(app.get('port'), function () {
  console.log('익스프레스 서버를 시작했습니다.' + app.get('port'));
});
