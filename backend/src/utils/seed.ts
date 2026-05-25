import { openDb, run, get, all } from '../config/database';
import { initDb } from '../config/database';

const FIRST_NAMES = [
  '张', '李', '王', '刘', '陈', '杨', '赵', '黄', '周', '吴',
  '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗',
  '梁', '宋', '郑', '谢', '韩', '唐', '冯', '于', '董', '萧',
];

const LAST_NAMES = [
  '伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋',
  '勇', '艳', '杰', '娟', '涛', '明', '超', '秀', '霞', '平',
  '刚', '桂英', '华', '建国', '文', '辉', '玲', '婷', '宇', '欣',
  '浩然', '梓涵', '子轩', '诗涵', '俊杰', '梦瑶', '雨泽', '思远', '晓燕', '志强',
];

const DESCRIPTIONS = [
  '大学同学', '高中同学', '同事', '邻居', '发小', '棋友',
  '驴友', '球友', '书友', '网友', '合作伙伴', '客户',
  '导师', '学生', '亲戚', '朋友的朋友', '健身伙伴', '饭搭子',
  '游戏队友', '老乡', '志愿者伙伴', '社区朋友', '兴趣小组',
];

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8B500', '#6C5CE7', '#A29BFE', '#FD79A8', '#FDCB6E',
  '#E17055', '#00B894', '#0984E3', '#E84393', '#2D3436',
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateName(): string {
  return randomItem(FIRST_NAMES) + randomItem(LAST_NAMES);
}

async function seed() {
  await initDb();

  // 1. 清空现有数据
  const db = openDb();
  db.exec('DELETE FROM relationships; DELETE FROM persons;', (err) => {
    if (err) console.error('Clear error:', err);
  });
  db.close();
  console.log('Cleared existing data.');

  // 2. 批量添加朋友
  const personCount = randomInt(15, 25);
  const createdIds: number[] = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < personCount; i++) {
    let name = generateName();
    while (usedNames.has(name)) {
      name = generateName();
    }
    usedNames.add(name);

    try {
      const result = await run(
        'INSERT INTO persons (name, avatar, description) VALUES (?, ?, ?)',
        [name, randomItem(COLORS), randomItem(DESCRIPTIONS)]
      );
      createdIds.push(result.lastID!);
      console.log(`Created person: ${name} (id=${result.lastID})`);
    } catch (err: any) {
      console.error(`Failed to create ${name}:`, err.message);
    }
  }

  // 3. 随机建立关系
  const relationshipCount = randomInt(20, Math.min(40, createdIds.length * 2));
  const existingPairs = new Set<string>();
  let createdRels = 0;

  for (let i = 0; i < relationshipCount * 3; i++) {
    if (createdRels >= relationshipCount) break;

    const a = randomItem(createdIds);
    const b = randomItem(createdIds);
    if (a === b) continue;

    const pairKey = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (existingPairs.has(pairKey)) continue;
    existingPairs.add(pairKey);

    try {
      await run(
        'INSERT INTO relationships (from_person_id, to_person_id) VALUES (?, ?)',
        [a, b]
      );
      createdRels++;
    } catch (err: any) {
      // ignore duplicate
    }
  }

  console.log(`\n✅ Seed completed! Created ${createdIds.length} persons and ${createdRels} relationships.`);

  // 4. 输出统计
  const stats = await all<{ name: string; connections: number }>(`
    SELECT p.name, COUNT(r.id) as connections
    FROM persons p
    LEFT JOIN relationships r ON p.id = r.from_person_id OR p.id = r.to_person_id
    GROUP BY p.id
    ORDER BY connections DESC
    LIMIT 5
  `);
  console.log('\nTop connected persons:');
  stats.forEach((s) => console.log(`  ${s.name}: ${s.connections} connections`));
}

seed().catch(console.error);
