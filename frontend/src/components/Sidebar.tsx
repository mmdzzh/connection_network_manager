import { useState, useRef } from 'react';
import { useAppStore } from '../stores/appStore';
import PersonForm from './PersonForm';
import RelationshipForm from './RelationshipForm';
import { isColorAvatar, getAvatarUrl } from '../utils/avatar';

function ExportImportButtons({ onAfterReset }: { onAfterReset?: () => void }) {
  const exportData = useAppStore((s) => s.exportData);
  const importData = useAppStore((s) => s.importData);
  const resetData = useAppStore((s) => s.resetData);
  const loading = useAppStore((s) => s.loading);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importData(file);
      setTimeout(() => alert('导入成功！'), 50);
    } catch (err: any) {
      setTimeout(() => alert('导入失败: ' + (err.message || '未知错误')), 50);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReset = async () => {
    if (!confirm('确定要清空所有数据吗？此操作不可恢复！')) return;
    try {
      await resetData();
      onAfterReset?.();
      setTimeout(() => alert('已清空所有数据'), 50);
    } catch (err: any) {
      setTimeout(() => alert('清零失败: ' + (err.message || '未知错误')), 50);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleImport}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => exportData()}
          disabled={loading}
          className="flex-1 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-lg text-xs font-medium transition-colors text-white"
        >
          ↓ 导出
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="flex-1 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-lg text-xs font-medium transition-colors text-white"
        >
          ↑ 导入
        </button>
      </div>
      <button
        type="button"
        onClick={handleReset}
        disabled={loading}
        className="w-full py-1.5 bg-red-900/50 hover:bg-red-800/60 disabled:opacity-50 rounded-lg text-xs font-medium transition-colors text-red-300"
      >
        ⚠ 清零所有数据
      </button>
    </div>
  );
}

export default function Sidebar() {
  const persons = useAppStore((s) => s.persons);
  const selectPerson = useAppStore((s) => s.selectPerson);
  const focusNode = useAppStore((s) => s.focusNode);
  const selectedPerson = useAppStore((s) => s.selectedPerson);
  const [showPersonForm, setShowPersonForm] = useState(false);
  const [showRelForm, setShowRelForm] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = persons.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-80 h-full bg-slate-900 border-r border-slate-800 flex flex-col">
      <div className="p-4 border-b border-slate-800">
        <h1 className="text-lg font-bold text-white mb-1">人际关系拓扑图</h1>
        <p className="text-xs text-slate-400">三维可视化关系网络</p>
      </div>

      <div className="p-4 space-y-3 border-b border-slate-800">
        <button
          onClick={() => {
            setShowPersonForm(true);
            setShowRelForm(false);
          }}
          className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium text-sm transition-colors"
        >
          + 添加朋友
        </button>
        <button
          onClick={() => {
            setShowRelForm(true);
            setShowPersonForm(false);
          }}
          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-medium text-sm transition-colors"
        >
          ↔ 建立关系
        </button>
        <ExportImportButtons onAfterReset={() => { setShowPersonForm(false); setShowRelForm(false); }} />
      </div>

      {(showPersonForm || showRelForm) && (
        <div className="p-4 border-b border-slate-800 bg-slate-850">
          {showPersonForm && <PersonForm onClose={() => setShowPersonForm(false)} />}
          {showRelForm && <RelationshipForm onClose={() => setShowRelForm(false)} />}
        </div>
      )}

      <div className="p-3 border-b border-slate-800">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索朋友..."
          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2">
        {filtered.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">
            {search ? '未找到匹配的朋友' : '暂无朋友，点击上方添加'}
          </p>
        ) : (
          filtered.map((person) => (
            <button
              key={person.id}
              onClick={() => {
                selectPerson(person.id);
                focusNode(person.id);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                selectedPerson?.id === person.id
                  ? 'bg-blue-600/20 border border-blue-500/30'
                  : 'hover:bg-slate-800 border border-transparent'
              }`}
            >
              {isColorAvatar(person.avatar) ? (
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0"
                  style={{ backgroundColor: person.avatar || '#64748b' }}
                />
              ) : (
                <img
                  src={getAvatarUrl(person.avatar)}
                  alt={person.name}
                  className="w-8 h-8 rounded-full flex-shrink-0 object-cover border border-slate-600"
                />
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{person.name}</p>
                {person.description && (
                  <p className="text-xs text-slate-400 truncate">{person.description}</p>
                )}
              </div>
            </button>
          ))
        )}
      </div>

      <div className="p-3 border-t border-slate-800 text-xs text-slate-500 text-center">
        共 {persons.length} 位朋友
      </div>
    </div>
  );
}
