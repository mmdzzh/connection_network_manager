# API 接口文档

## 基础信息
- Base URL: `http://localhost:3001/api`
- Content-Type: `application/json`

## 响应格式
```json
{
  "success": true,
  "data": {},
  "message": "可选的错误信息"
}
```

## 接口列表

### 健康检查
```
GET /api/health
```

### 朋友管理

#### 获取所有朋友
```
GET /api/persons
```
响应：
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "张三", "avatar": "#FF6B6B", "description": "...", "created_at": "..." }
  ]
}
```

#### 获取单个朋友详情
```
GET /api/persons/:id
```
响应含 `connections` 数组：
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "张三",
    "connections": [
      { "id": 2, "name": "李四", "avatar": "#4ECDC4" }
    ]
  }
}
```

#### 创建朋友
```
POST /api/persons
```
请求体：
```json
{
  "name": "张三",
  "avatar": "#FF6B6B",
  "description": "大学同学"
}
```

#### 更新朋友
```
PUT /api/persons/:id
```

#### 删除朋友
```
DELETE /api/persons/:id
```

### 关系管理

#### 获取拓扑图数据
```
GET /api/relationships
```
响应：
```json
{
  "success": true,
  "data": {
    "nodes": [{ "id": 1, "name": "张三", "avatar": "#FF6B6B" }],
    "links": [{ "source": 1, "target": 2 }]
  }
}
```

#### 建立关系
```
POST /api/relationships
```
请求体：
```json
{
  "from_person_id": 1,
  "to_person_id": 2
}
```

#### 删除关系
```
DELETE /api/relationships/:id
```
