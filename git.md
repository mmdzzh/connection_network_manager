# Git 操作记录

## 仓库信息
- **仓库地址**: https://github.com/mmdzzh/connection_network_manager.git
- **本地路径**: F:\\CppProject\\connection_network
- **默认分支**: main

---

## 操作步骤

### 1. 初始化 Git 仓库
```bash
cd F:\\CppProject\\connection_network
git init
```
输出:
```
Initialized empty Git repository in F:/CppProject/connection_network/.git/
```

### 2. 添加远程仓库
```bash
git remote add origin https://github.com/mmdzzh/connection_network_manager.git
```

### 3. 创建 .gitignore
创建了 `.gitignore` 文件，排除了以下目录和文件：
- `node_modules/`（所有层级的依赖目录）
- `dist-electron/`、`dist/`、`frontend/dist/`、`backend/dist/`（构建输出）
- `data.sqlite`、`*.sqlite`（数据库文件）
- `backend/uploads/`、`frontend/uploads/`（上传的头像文件）
- `temp-asar/`、`temp-asar2/`（临时目录）
- `test-*.png`（测试截图）
- `.env`、日志文件、IDE 配置等

### 4. 移除不应提交的文件
从暂存区移除了以下已跟踪但实际不应提交的文件：
- `backend/uploads/avatars/avatar-26-1779629803010.png`
- `temp-asar/` 目录下的临时文件
- `temp-asar2/` 目录下的临时文件
- `test-assets/test-avatar.png`
- `test-avatar.png` ~ `test-avatar5.png`
- `test-electron.png` ~ `test-electron3.png`
- `test-final.png`
- `test-screenshot.png` ~ `test-screenshot3.png`

### 5. 配置 Git 用户身份
```bash
git config user.email "dev@example.com"
git config user.name "Developer"
```

### 6. 提交代码
```bash
git add .
git commit -m "feat: initial release with 3D relationship graph, avatar upload, export/import, reset, relationship types"
```
提交信息:
- 52 files changed, 10629 insertions(+)
- 包含完整的项目代码：前端(React+Three.js)、后端(Express+SQLite)、Electron 打包配置

### 7. 推送主分支到远程
```bash
git branch -M main
git push -u origin main
```
输出:
```
branch 'main' set up to track 'origin/main'.
To https://github.com/mmdzzh/connection_network_manager.git
 * [new branch]      main -> main
```

### 8. 创建并推送版本标签
```bash
git tag -a v1.0.0 -m "Release v1.0.0 - 人际关系三维拓扑图"
git push origin v1.0.0
```
输出:
```
To https://github.com/mmdzzh/connection_network_manager.git
 * [new tag]         v1.0.0 -> v1.0.0
```

---

## 项目包含的核心功能

| 功能 | 说明 |
|---|---|
| 三维关系拓扑图 | React 18 + Vite + Three.js/R3F，力导向物理模拟 |
| 人员 CRUD | 创建、查看、删除人员，支持姓名/简介/头像 |
| 头像上传 | 颜色头像或本地图片（客户端自动 resize 到 256x256） |
| 关系类型 | 朋友/同事/家人/同学/恋人/师生/邻居/合作伙伴/其他 |
| 3D 图谱关系标签 | 连线中点显示关系类型 |
| 导出关系图 | JSON 格式，图片头像内嵌 base64 |
| 导入关系图 | 清空现有数据后重建，保留关系类型 |
| 清零数据 | 一键清空所有人员和关系，清理头像文件 |
| Electron 桌面端 | 打包为 portable exe，数据库存储在 userData |

---

## 如何创建 GitHub Release

由于当前环境没有 GitHub Personal Access Token，无法通过 API 自动创建 release。请按以下步骤在 GitHub 网页上手动创建：

1. 打开 https://github.com/mmdzzh/connection_network_manager/releases
2. 点击右侧绿色的 **"Create a new release"** 按钮
3. 在 "Choose a tag" 下拉框中选择已推送的 **`v1.0.0`**
4. 标题填写：`v1.0.0 - 人际关系三维拓扑图`
5. 描述填写:
   ```
   ## 功能特性
   - 三维力导向关系拓扑图可视化
   - 人员管理（姓名、简介、头像）
   - 支持颜色头像和本地图片头像上传
   - 关系建立并支持关系类型标注（同事/家人/同学等）
   - 数据导出/导入（JSON 格式，图片内嵌 base64）
   - 一键清零所有数据
   - Electron 桌面端打包（Windows portable）

   ## 技术栈
   - 前端：React 18 + Vite + Three.js + @react-three/fiber + Tailwind CSS
   - 后端：Express + SQLite3
   - 桌面端：Electron 30.5.1 + electron-builder
   ```
6. 点击 **"Publish release"**

---

## 本地开发命令

```bash
# 安装依赖
npm install
cd backend && npm install
cd ../frontend && npm install

# 开发模式（同时启动前后端）
npm run dev

# 构建
npm run build

# Electron 打包
npm run electron:build
```
