const BASE = 'http://localhost:3001/api';

const FIRST_NAMES = ['王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '马', '朱', '胡', '郭', '何', '林', '罗', '高', '郑', '梁', '谢', '宋', '唐', '许', '韩', '冯', '邓', '曹', '彭', '曾', '肖', '田', '董', '袁', '潘', '于', '蒋', '蔡', '余', '杜', '叶', '程', '苏', '魏', '吕', '丁', '任', '沈'];
const LAST_NAMES = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '秀英', '华', '鹏', '飞', '平', '刚', '桂英', '文', '辉', '鑫', '宇', '博', '浩', '然', '轩', '涵', '怡', '欣', '佳', '琪', '婷婷', '思', '雨', '雪', '晨', '阳', '昊', '睿', '梓', '子涵', '一诺', '语桐'];

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B500', '#6C5CE7', '#A29BFE', '#FD79A8', '#FDCB6E', '#E17055', '#00B894', '#0984E3', '#D63031', '#74B9FF', '#A8E6CF', '#FFD93D'];

const DESCRIPTIONS = [
  '大学同学，关系很好', '高中同桌，常联系', '公司同事，同部门', '邻居，从小认识',
  '游戏好友，经常组队', '健身伙伴', '读书会成员', '旅行认识的朋友',
  '亲戚，过年常走动', '发小，感情深厚', '社团朋友', '项目合作伙伴',
  '校友会认识', '兴趣小组', '运动俱乐部', '技术交流群友',
  '同行业从业者', '朋友介绍认识', '客户转朋友', '志愿者同伴',
];

async function request(url, options = {}) {
  const res = await fetch(BASE + url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.message || '请求失败');
  }
  return json.data;
}

function randomName() {
  const f = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const l = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return f + l;
}

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function randomDesc() {
  return DESCRIPTIONS[Math.floor(Math.random() * DESCRIPTIONS.length)];
}

async function seed() {
  console.log('开始批量生成数据...');

  // 先生成 25 个人物
  const persons = [];
  const usedNames = new Set();
  for (let i = 0; i < 25; i++) {
    let name;
    do { name = randomName(); } while (usedNames.has(name));
    usedNames.add(name);
    const p = await request('/persons', {
      method: 'POST',
      body: JSON.stringify({ name, avatar: randomColor(), description: randomDesc() }),
    });
    persons.push(p);
    console.log(`  创建人物: ${p.name} (id=${p.id})`);
  }

  // 随机建立 45 条关系（无向，不重复，不自环）
  const relationshipSet = new Set();
  let created = 0;
  let attempts = 0;
  while (created < 45 && attempts < 500) {
    attempts++;
    const a = persons[Math.floor(Math.random() * persons.length)];
    const b = persons[Math.floor(Math.random() * persons.length)];
    if (a.id === b.id) continue;
    const key = a.id < b.id ? `${a.id}-${b.id}` : `${b.id}-${a.id}`;
    if (relationshipSet.has(key)) continue;
    relationshipSet.add(key);
    try {
      const r = await request('/relationships', {
        method: 'POST',
        body: JSON.stringify({ from_person_id: a.id, to_person_id: b.id }),
      });
      created++;
      console.log(`  建立关系: ${a.name} ↔ ${b.name} (id=${r.id})`);
    } catch (err) {
      console.log(`  关系失败: ${a.name} ↔ ${b.name}: ${err.message}`);
    }
  }

  console.log(`\n完成！创建了 ${persons.length} 个人物，${created} 条关系。`);
}

seed().catch(console.error);
