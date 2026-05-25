import { useState } from 'react';
import { useAppStore } from '../stores/appStore';

const RELATIONSHIP_TYPES = [
  '朋友', '同事', '家人', '同学', '恋人', '师生', '邻居', '合作伙伴', '其他',
];

export default function RelationshipForm({ onClose }: { onClose: () => void }) {
  const persons = useAppStore((s) => s.persons);
  const [fromId, setFromId] = useState<number | ''>('');
  const [toId, setToId] = useState<number | ''>('');
  const [relType, setRelType] = useState('朋友');
  const addRelationship = useAppStore((s) => s.addRelationship);
  const loading = useAppStore((s) => s.loading);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fromId === '' || toId === '') return;
    await addRelationship(Number(fromId), Number(toId), relType);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-slate-300 mb-1">朋友 A</label>
        <select
          value={fromId}
          onChange={(e) => setFromId(e.target.value ? Number(e.target.value) : '')}
          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 text-white"
          required
        >
          <option value="">请选择</option>
          {persons.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-slate-300 mb-1">关系类型</label>
        <select
          value={relType}
          onChange={(e) => setRelType(e.target.value)}
          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 text-white"
        >
          {RELATIONSHIP_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-slate-300 mb-1">朋友 B</label>
        <select
          value={toId}
          onChange={(e) => setToId(e.target.value ? Number(e.target.value) : '')}
          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 text-white"
          required
        >
          <option value="">请选择</option>
          {persons.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={loading || fromId === toId}
          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-lg font-medium transition-colors"
        >
          {loading ? '建立中...' : '建立关系'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
        >
          取消
        </button>
      </div>
    </form>
  );
}
