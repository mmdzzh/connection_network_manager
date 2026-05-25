# 架构设计文档

## 1. 系统概述

人际关系三维拓扑图是一个全栈 Web 应用，用于可视化和管理人际关系网络。

## 2. 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 前端 | React + TypeScript + Vite | 18 / 5 |
| 3D渲染 | React Three Fiber + Three.js | 8 / 161 |
| 状态管理 | Zustand | 4.5 |
| UI样式 | Tailwind CSS | 3.4 |
| 后端 | Express + TypeScript | 4.18 |
| 数据库 | SQLite3 | 5.1 |
| 构建 | tsx + concurrently | - |

## 3. 架构模式

### 后端 - MVC + Service 分层
```
Request → Routes → Controller → Service → Model → SQLite
```

### 前端 - 组件化 + 状态管理
```
UI Components → Zustand Store → API Client → Backend API
```

## 4. 数据流

1. 用户操作触发 Store Action
2. Store 调用 API Client
3. API Client 发送 HTTP 请求到后端
4. 后端 Controller 接收请求 → Service 处理 → Model 操作数据库
5. 响应返回 → Store 更新状态 → UI 重新渲染

## 5. 部署架构

- 开发模式：前后端分离，Vite dev server 代理 API 请求
- 生产模式：前端构建为静态资源，由后端或 CDN 托管
