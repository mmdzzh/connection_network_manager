# 前端设计文档

## 页面布局

```
┌─────────────────────────────────────────────────────────────┐
│  Sidebar (w-80)  │           3D Canvas (flex-1)               │
│  ─────────────── │  ┌───────────────────────────────────────┐ │
│  Title           │  │                                       │ │
│  Add buttons     │  │     星云状三维拓扑关系图                  │ │
│  Forms           │  │                                       │ │
│  Search          │  │    ● ──── ●                             │ │
│  ─────────────── │  │     \   /                               │ │
│  Person List     │  │      ●                                  │ │
│  ─────────────── │  │                                       │ │
│  Count           │  │  ┌─────────────┐ (PersonDetail overlay) │ │
│                  │  │  │  详情面板     │                       │ │
│                  │  │  └─────────────┘                       │ │
│                  │  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 组件清单

| 组件 | 文件 | 职责 |
|------|------|------|
| App | App.tsx | 根布局，数据初始化 |
| Sidebar | Sidebar.tsx | 左侧面板：操作按钮、表单、列表 |
| PersonForm | PersonForm.tsx | 添加朋友表单（含颜色选择） |
| RelationshipForm | RelationshipForm.tsx | 建立关系表单（下拉选择） |
| PersonDetail | PersonDetail.tsx | 朋友详情浮窗（关联列表） |
| NetworkGraph | NetworkGraph.tsx | 3D Canvas + 力导向模拟 |
| Node | NetworkGraph.tsx | 3D球体节点（悬浮、点击交互） |
| Line | NetworkGraph.tsx | 3D连线 |

## 状态管理 (Zustand)

```typescript
interface AppState {
  persons: Person[];
  graphData: GraphData;
  selectedPerson: PersonWithConnections | null;
  loading: boolean;
  error: string | null;
}
```

## 3D 交互设计

- **OrbitControls**: 左键旋转、滚轮缩放、右键平移
- **节点悬浮**: 放大 + 发光增强 + 显示姓名标签
- **节点点击**: 打开 PersonDetail 面板
- **力导向算法**: 自定义物理模拟（斥力 + 弹簧 + 中心引力）

## 配色方案

- 背景: `#020617` (slate-950)
- 面板: `#0f172a` (slate-900)
- 边框: `#1e293b` (slate-800)
- 文字: 白色 / `#94a3b8` (slate-400)
- 强调: `#2563eb` (blue-600) / `#059669` (emerald-600)
