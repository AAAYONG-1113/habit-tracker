
# 习惯追踪系统（后端部分）

本项目为“习惯追踪与打卡系统”的后端服务，使用 Node.js + Express + MySQL 实现。你可以通过以下步骤导入数据库、运行后端服务并进行测试。

---

## 📁 项目结构

```
project-folder/
├── app.js               // 后端主程序入口
├── package.json         // Node.js 依赖文件
├── habit_db.sql         // MySQL 数据库导出文件
└── README.md            // 使用说明
```

---

## 💾 数据库导入

1. 安装并打开 MySQL。
2. 新建一个数据库（例如：habit_db）。
3. 导入 SQL 文件：

```bash
mysql -u root -p habit_db < habit_db.sql
```

⚠️ 注意：若数据库 `habit_db` 不存在，可先执行：

```sql
CREATE DATABASE habit_db;
```

---

## 🚀 启动后端服务

1. 安装依赖（仅第一次）：

```bash
npm install
```

2. 启动服务：

```bash
node app.js
```

3. 默认监听地址为：

```
http://localhost:3000
```

---

## 📡 接口说明

### 用户注册  
- `POST /users/register`  
- 参数：`{ "username": "xxx", "password": "xxx" }`

### 用户登录  
- `POST /users/login`  
- 参数：`{ "username": "xxx", "password": "xxx" }`

### 打卡  
- `POST /habits/checkin`  
- 参数：`{ "userId": 1, "habitName": "早起" }`  
- 防止重复打卡同一天

### 获取打卡记录  
- `GET /checkins?user_id=1`

### 获取连续打卡天数  
- `GET /checkins/streak?user_id=1`

---

## ✅ 注意事项

- 请确保数据库连接配置正确（app.js 中的用户名和密码）。
- 如需修改端口或数据库名，请在 `app.js` 文件中修改相关配置。
- 接口返回为 JSON 格式，可用 Postman、curl 或前端页面进行测试。

---
