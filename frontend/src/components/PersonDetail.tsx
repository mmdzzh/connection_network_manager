import { useAppStore } from '../stores/appStore';
import { isColorAvatar, getAvatarUrl } from '../utils/avatar';

export default function PersonDetail({ onClose }: { onClose: () => void }) {
  const person = useAppStore((s) => s.selectedPerson);
  const removePerson = useAppStore((s) => s.removePerson);
  const loading = useAppStore((s) => s.loading);
  const graphData = useAppStore((s) => s.graphData);

  if (!person) return null;

  const getRelType = (connId: number) => {
    const link = graphData.links.find(
      (l) =>
        (l.source === person.id && l.target === connId) ||
        (l.source === connId && l.target === person.id)
    );
    return link?.type;
  };

  return (
    <div className="absolute top-4 right-4 w-72 bg-slate-900/95 backdrop-blur border border-slate-700 rounded-xl shadow-2xl p-5 z-10">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {isColorAvatar(person.avatar) ? (
            <div
              className="w-10 h-10 rounded-full flex-shrink-0"
              style={{ backgroundColor: person.avatar || '#64748b' }}
            />
          ) : (
            <img
              src={getAvatarUrl(person.avatar)}
              alt={person.name}
              className="w-10 h-10 rounded-full flex-shrink-0 object-cover border border-slate-600"
            />
          )}
          <div>
            <h3 className="font-bold text-lg text-white">{person.name}</h3>
            <p className="text-xs text-slate-400">
              {new Date(person.created_at).toLocaleDateString('zh-CN')} 添加
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors text-xl leading-none"
        >
          ×
        </button>
      </div>

      {person.description && (
        <p className="text-sm text-slate-300 mb-4 leading-relaxed">{person.description}</p>
      )}

      <div className="mb-4">
        <h4 className="text-sm font-semibold text-slate-400 mb-2">
          关联朋友 ({person.connections.length})
        </h4>
        {person.connections.length === 0 ? (
          <p className="text-sm text-slate-500">暂无关联</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {person.connections.map((conn) => {
              const relType = getRelType(conn.id);
              return (
                <span
                  key={conn.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 rounded-full text-sm text-slate-200"
                >
                  {isColorAvatar(conn.avatar) ? (
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: conn.avatar || '#64748b' }}
                    />
                  ) : (
                    <img
                      src={getAvatarUrl(conn.avatar)}
                      alt={conn.name}
                      className="w-2.5 h-2.5 rounded-full object-cover"
                    />
                  )}
                  {conn.name}
                  {relType && (
                    <span className="text-[10px] text-slate-400 ml-0.5">({relType})</span>
                  )}
                </span>
              );
            })}
          </div>
        )}
      </div>

      <button
        onClick={() => removePerson(person.id)}
        disabled={loading}
        className="w-full py-2 bg-red-600/80 hover:bg-red-500 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
      >
        {loading ? '删除中...' : '删除该朋友'}
      </button>
    </div>
  );
}
