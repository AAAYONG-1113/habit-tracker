const express = require('express'); // 引入 express
const app = express(); // 创建 express 应用实例
const mysql = require('mysql2'); // 引入 mysql2
const bodyParser = require('body-parser'); // 引入 body-parser

// 使用中间件解析 JSON 请求体
app.use(bodyParser.json());

// 创建数据库连接
const db = mysql.createConnection({
    host: 'localhost',       // 本地数据库
    user: 'root',            // 你的 MySQL 用户名
    password: '1113',        // 你的 MySQL 密码（如没有密码就留空：''）
    database: 'habit_db'     // 数据库名称
});

// 测试数据库连接
db.connect(err => {
    if (err) {
        console.error('数据库连接失败:', err);
    } else {
        console.log('成功连接到数据库');
    }
});

// 注册接口
app.post('/users/register', (req, res) => {
    const { username, password } = req.body;

    const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(sql, [username, password], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                res.status(409).json({ error: '用户名已存在' });
            } else {
                console.error('数据库错误:', err);
                res.status(500).json({ error: '注册失败' });
            }
        } else {
            res.json({ message: '注册成功' });
        }
    });
});

// 登录接口
app.post('/users/login', (req, res) => {
    const { username, password } = req.body;

    const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(sql, [username, password], (err, results) => {
        if (err) {
            console.error('数据库查询失败:', err);
            return res.status(500).json({ error: '登录失败' });
        }

        if (results.length > 0) {
            res.json({ message: '登录成功', user: results[0] });
        } else {
            res.status(401).json({ error: '用户名或密码错误' });
        }
    });
});

// 打卡接口
// 打卡接口（加入防止重复打卡逻辑）
app.post('/habits/checkin', (req, res) => {
    const { userId, habitName } = req.body;
    const checkinDate = new Date().toISOString().split('T')[0]; // 今天的日期（格式：YYYY-MM-DD）

    // 查询是否今天已经打过卡
    const checkSql = 'SELECT * FROM checkins WHERE user_id = ? AND habit_name = ? AND checkin_date = ?';
    db.query(checkSql, [userId, habitName, checkinDate], (err, results) => {
        if (err) {
            console.error('检查打卡失败:', err);
            return res.status(500).json({ error: '服务器错误' });
        }

        if (results.length > 0) {
            // 已经打过卡
            return res.status(409).json({ error: '今天已经打过卡了' });
        }

        // 没打过卡，插入记录
        const insertSql = 'INSERT INTO checkins (user_id, habit_name, checkin_date) VALUES (?, ?, ?)';
        db.query(insertSql, [userId, habitName, checkinDate], (err, result) => {
            if (err) {
                console.error('打卡失败:', err);
                return res.status(500).json({ error: '打卡失败' });
            }
            res.json({ message: '打卡成功' });
        });
    });
});

// 获取用户的打卡记录
app.get('/checkins', (req, res) => {
    const userId = req.query.user_id;

    if (!userId) {
        return res.status(400).json({ error: '缺少 user_id 参数' });
    }

    const sql = 'SELECT * FROM checkins WHERE user_id = ? ORDER BY checkin_date DESC';
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('查询失败:', err);
            return res.status(500).json({ error: '查询失败' });
        }
        res.json(results);
    });
});
// 统计用户连续打卡天数
app.get('/checkins/streak', (req, res) => {
    const userId = req.query.user_id;

    if (!userId) {
        return res.status(400).json({ error: '缺少 user_id 参数' });
    }

    const sql = `
        SELECT checkin_date 
        FROM checkins 
        WHERE user_id = ? 
        ORDER BY checkin_date DESC
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('查询失败:', err);
            return res.status(500).json({ error: '查询失败' });
        }

        let streak = 0;
        let today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let record of results) {
            const checkinDate = new Date(record.checkin_date);
            checkinDate.setHours(0, 0, 0, 0);

            if (streak === 0) {
                // 第一次比较：今天 or 昨天
                if (
                    checkinDate.getTime() === today.getTime() || 
                    checkinDate.getTime() === today.getTime() - 86400000
                ) {
                    streak++;
                    today.setDate(today.getDate() - 1);
                } else {
                    break;
                }
            } else {
                if (checkinDate.getTime() === today.getTime()) {
                    streak++;
                    today.setDate(today.getDate() - 1);
                } else {
                    break;
                }
            }
        }

        res.json({ streak });
    });
});

// 启动服务器
app.listen(3000, () => {
    console.log('服务器已启动，监听端口 3000');
});