// MySQL 데이터베이스를 사용할 수 있는 mysql 모듈 불러오기
import mysql from 'mysql';

// MySQL 데이터베이스 연결 설정
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.MYSQL_HOST,
  user: 'root',
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  debug: false,
});

console.log('데이터베이스에 연결되었습니다.');

export { pool };
