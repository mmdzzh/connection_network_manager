import { useEffect } from 'react';
import { useAppStore } from './stores/appStore';
import Sidebar from './components/Sidebar';
import NetworkGraph from './components/NetworkGraph';
import PersonDetail from './components/PersonDetail';

export default function App() {
  const fetchPersons = useAppStore((s) => s.fetchPersons);
  const fetchGraph = useAppStore((s) => s.fetchGraph);
  const selectedPerson = useAppStore((s) => s.selectedPerson);
  const selectPerson = useAppStore((s) => s.selectPerson);
  const error = useAppStore((s) => s.error);
  const clearError = useAppStore((s) => s.clearError);

  useEffect(() => {
    fetchPersons();
    fetchGraph();
  }, [fetchPersons, fetchGraph]);

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-slate-950">
      <Sidebar />

      <div className="flex-1 relative">
        <NetworkGraph />

        {selectedPerson && (
          <PersonDetail onClose={() => selectPerson(null)} />
        )}

        {error && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-red-600 text-white text-sm rounded-lg shadow-lg flex items-center gap-3">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="text-white/80 hover:text-white font-bold"
            >
              ×
            </button>
          </div>
        )}

        <div className="absolute bottom-4 left-4 text-xs text-slate-500 pointer-events-none select-none">
          拖拽旋转 · 滚轮缩放 · 右键平移 · 点击节点查看详情
        </div>
      </div>
    </div>
  );
}
