const mysql = require('mysql2');
// 引入 mysql2 库
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',         // 你的数据库用户名
  password: '',         // 你的数据库密码
  database: 'habit_tracker'
});
// 创建一个连接池

module.exports = pool.promise();
//把这个连接池暴露给其他文件用
// 这样其他文件就可以使用这个连接池来执行数据库操作了


