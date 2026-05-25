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


---

## 打包并发布 Release（含可执行文件）

### 打包产物说明

| 产物 | 路径 | 大小 | 说明 |
|---|---|---|---|
| Portable EXE | `dist-electron/人际关系三维拓扑图 1.0.0.exe` | ~78 MB | 免安装，双击直接运行 |
| 解压版目录 | `dist-electron/win-unpacked/` | ~200 MB | 包含所有依赖文件 |

### 完整步骤

#### 步骤 1：确认代码已推送
```bash
git status   # 确保 working tree clean
git log --oneline -3
```
如有未提交的修改，先提交并推送：
```bash
git add .
git commit -m "release: v1.0.0"
git push origin main
```

#### 步骤 2：确保开发服务器全部关闭
**必须关闭所有占用 3001 端口的进程**，否则打包后的应用启动会因端口冲突而崩溃。
```bash
# Windows PowerShell
 taskkill /F /IM node.exe
# 或
Get-NetTCPConnection -LocalPort 3001 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

#### 步骤 3：重新编译前后端
```bash
# 根目录下执行
npm run build
```
这会依次执行：
1. `cd frontend && npm run build` —— Vite 构建生产版前端
2. `cd backend && npm run build` —— TypeScript 编译后端

#### 步骤 4：Electron 打包
```bash
# 根目录下执行
npx electron-builder --win
```
输出目录：`dist-electron/`
- `人际关系三维拓扑图 1.0.0.exe` —— 最终交付物
- `win-unpacked/` —— 解压版（调试用）

> 打包配置位于根目录 `package.json` 的 `build` 字段：
> - `target: "portable"` —— 生成单文件免安装 exe
> - `electronDist: "node_modules/electron/dist"` —— 使用本地 Electron，避免重复下载
> - `extraResources` —— 将 `backend/node_modules` 映射到 `resources/node_modules`，解决 native module 加载

#### 步骤 5：在 GitHub 上创建 Release 并上传 exe

1. 打开浏览器访问：
   ```
   https://github.com/mmdzzh/connection_network_manager/releases
   ```

2. 点击右侧绿色按钮 **"Create a new release"**

3. 填写发布信息：
   - **Choose a tag**: 选择 `v1.0.0`（或点击 "Create new tag" 输入新版本如 `v1.0.1`）
   - **Release title**: `v1.0.0 - 人际关系三维拓扑图`
   - **Description**:
     ```markdown
     ## 功能特性
     - 三维力导向关系拓扑图可视化
     - 人员管理（姓名、简介、头像）
     - 支持颜色头像和本地图片头像上传（自动缩放至 256x256）
     - 关系建立并支持关系类型标注（同事/家人/同学/恋人/师生/邻居/合作伙伴/其他）
     - 数据导出/导入（JSON 格式，图片内嵌 base64）
     - 一键清零所有数据
     - Electron 桌面端打包（Windows portable，免安装）

     ## 系统要求
     - Windows 10 / Windows 11
     - 无需安装 Node.js
     - 数据自动存储在 `%APPDATA%/connection_network/`

     ## 技术栈
     - 前端：React 18 + Vite + Three.js + @react-three/fiber + Tailwind CSS
     - 后端：Express + SQLite3
     - 桌面端：Electron 30.5.1 + electron-builder
     ```

4. 上传打包产物：
   - 在页面下方的 **"Attach binaries by dropping them here or selecting them."** 区域
   - 将 `dist-electron/人际关系三维拓扑图 1.0.0.exe` 拖入，或点击选择文件
   - 等待上传完成（~78 MB，根据网速需要几秒到几分钟）

5. 勾选/取消勾选：
   - ✅ **Set as the latest release**（设为最新 release）
   - ☐ **This is a pre-release**（非预发布版，不勾选）

6. 点击 **"Publish release"** 按钮发布

#### 步骤 6：验证 Release

发布后，Release 页面 URL 形如：
```
https://github.com/mmdzzh/connection_network_manager/releases/tag/v1.0.0
```

确认：
- [ ] 标题和描述正确显示
- [ ] Assets 列表中有 `人际关系三维拓扑图 1.0.0.exe`
- [ ] 点击 Download 可以正常下载

#### 步骤 7：本地快速验证打包产物

下载或直接运行本地 `dist-electron/人际关系三维拓扑图 1.0.0.exe`：
1. **确保没有 dev 服务器占用 3001 端口**
2. 双击 exe，等待 3~5 秒启动
3. 应用窗口出现后：
   - 点击 **+ 添加朋友** → 输入姓名 → 提交，确认创建成功
   - 点击 **↔ 建立关系** → 选择两人 + 关系类型 → 提交
   - 观察 3D 图谱中连线和关系类型标签
   - 点击 **↓ 导出** → 确认 JSON 文件下载成功
   - 点击 **⚠ 清零所有数据** → 确认后列表清空
   - 点击 **↑ 导入** → 选择刚才导出的 JSON → 确认数据恢复

---

## Release 版本管理备忘

### 发新版时的 checklist
```bash
# 1. 更新版本号（package.json）
# 2. 重新编译 + 打包
npm run build
npx electron-builder --win

# 3. 提交版本更新
git add package.json package-lock.json
git commit -m "release: bump version to v1.x.x"
git push origin main

# 4. 打新 tag
git tag -a v1.x.x -m "Release v1.x.x"
git push origin v1.x.x

# 5. 去 GitHub Releases 页面创建新 Release 并上传 exe
```

### 版本号规则
- `v1.0.0` —— 主版本.次版本.修订号
- 修复 bug：修订号 +1（如 `v1.0.1`）
- 新增功能：次版本 +1（如 `v1.1.0`）
- 重大重构：主版本 +1（如 `v2.0.0`）
