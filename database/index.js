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

export default pool;
