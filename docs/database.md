# 数据库设计文档

## ER图

```
┌─────────────┐         ┌─────────────────┐         ┌─────────────┐
│   Person    │         │  Relationship   │         │   Person    │
├─────────────┤         ├─────────────────┤         ├─────────────┤
│ id (PK)     │◄────────┤ id (PK)         ├────────►│ id (PK)     │
│ name        │    1    │ from_person_id  │    1    │ name        │
│ avatar      │    N    │ to_person_id    │    N    │ avatar      │
│ description │         │ created_at      │         │ description │
│ created_at  │         └─────────────────┘         │ created_at  │
└─────────────┘                                     └─────────────┘
```

## 表结构

### persons
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PK, AUTOINCREMENT | 主键 |
| name | TEXT | NOT NULL, UNIQUE | 姓名 |
| avatar | TEXT | NULL | 颜色标识（十六进制） |
| description | TEXT | NULL | 个人简介 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

### relationships
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PK, AUTOINCREMENT | 主键 |
| from_person_id | INTEGER | NOT NULL, FK | 关系起点 |
| to_person_id | INTEGER | NOT NULL, FK | 关系终点 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

### 约束
- `from_person_id ≠ to_person_id`（业务层校验）
- `(from_person_id, to_person_id)` UNIQUE
- ON DELETE CASCADE 级联删除关系
