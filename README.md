# Cloudflare DNS Manager

一个基于 Node.js/Express + React 的 Cloudflare DNS 解析记录管理面板，提供简洁的 Web 界面来管理您的域名 DNS 记录。

## 功能特性

- 🌐 查看所有 Cloudflare 账户下的域名
- 📋 查看指定域名的所有 DNS 解析记录
- ➕ 添加新的 DNS 记录
- ✏️ 修改现有 DNS 记录
- 🗑️ 删除 DNS 记录
- 🔒 安全的 API Token 管理（仅在后端存储）
- 🎨 现代化的响应式 UI 设计

## 技术栈

- **后端**: Node.js + Express.js
- **前端**: React + Vite + Tailwind CSS
- **API**: Cloudflare API v4
- **状态管理**: React Hooks

## 项目结构

```
/cloudflare-dns-manager
├── /server                 # 后端 Express 应用
│   ├── package.json
│   └── server.js
├── /client                 # 前端 React 应用
│   ├── package.json
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   └── RecordForm.jsx
│   │   └── main.jsx
│   └── ...
├── .env                    # 环境变量配置
├── .env.example           # 环境变量示例
└── README.md
```

## 安装与启动

### 前置条件

1. Node.js (版本 16 或更高)
2. Cloudflare 账户和 API Token

### 获取 Cloudflare API Token

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 点击右上角用户头像 -> "My Profile"
3. 选择 "API Tokens" 标签
4. 点击 "Create Token"
5. 选择 "Custom token" 或使用 "Edit zone DNS" 模板
6. 配置权限：
   - Zone:Zone:Read (读取域名列表)
   - Zone:DNS:Edit (管理 DNS 记录)
7. 复制生成的 Token

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd cloudflare-dns-manager
   ```

2. **配置环境变量**
   ```bash
   cp .env.example .env
   # 编辑 .env 文件，填入您的 Cloudflare API Token
   ```

3. **安装后端依赖**
   ```bash
   cd server
   npm install
   ```

4. **安装前端依赖**
   ```bash
   cd ../client
   npm install
   ```

### 启动应用

1. **启动后端服务器**
   ```bash
   cd server
   npm run dev  # 开发模式 (使用 nodemon)
   # 或
   npm start    # 生产模式
   ```
   
   后端服务器将运行在 `http://localhost:3001`

2. **启动前端应用** (新开一个终端窗口)
   ```bash
   cd client
   npm run dev
   ```
   
   前端应用将运行在 `http://localhost:5173`

3. **访问应用**
   
   在浏览器中打开 `http://localhost:5173` 即可使用应用。

## 使用说明

1. **选择域名**: 从下拉菜单中选择要管理的域名
2. **查看记录**: 选择域名后自动显示该域名下的所有 DNS 记录
3. **添加记录**: 点击"添加新记录"按钮，填写表单后提交
4. **修改记录**: 点击记录行中的"修改"按钮，更新信息后提交
5. **删除记录**: 点击记录行中的"删除"按钮，确认后删除

## 支持的 DNS 记录类型

- A (IPv4 地址)
- AAAA (IPv6 地址)
- CNAME (别名)
- MX (邮件交换)
- TXT (文本记录)
- SRV (服务记录)
- NS (名称服务器)
- PTR (指针记录)

## 安全注意事项

- Cloudflare API Token 仅存储在后端服务器的环境变量中
- 前端永远不会接触到 API Token
- 所有 API 请求都通过后端代理进行
- 建议在生产环境中使用 HTTPS

## 开发说明

### 后端 API 端点

- `GET /api/zones` - 获取域名列表
- `GET /api/zones/:zoneId/dns_records` - 获取 DNS 记录
- `POST /api/zones/:zoneId/dns_records` - 添加 DNS 记录
- `PUT /api/zones/:zoneId/dns_records/:recordId` - 修改 DNS 记录
- `DELETE /api/zones/:zoneId/dns_records/:recordId` - 删除 DNS 记录

### 前端组件结构

- `App.jsx` - 主应用组件
- `RecordForm.jsx` - DNS 记录表单组件

## 故障排除

1. **API Token 权限不足**
   - 确保 Token 具有 Zone:Zone:Read 和 Zone:DNS:Edit 权限

2. **CORS 错误**
   - 确保后端服务器正在运行
   - 检查前端代理配置是否正确

3. **连接失败**
   - 确认 .env 文件中的 API Token 是否正确
   - 检查网络连接是否正常

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
