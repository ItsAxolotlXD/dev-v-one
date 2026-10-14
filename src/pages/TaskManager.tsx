import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Cpu, 
  Layers, 
  Play, 
  Square, 
  RotateCw, 
  Search, 
  Terminal, 
  Clock, 
  Zap, 
  TrendingUp,
  X,
  AlertTriangle,
  Monitor,
  Wifi,
  Sparkles,
  Tv,
  Keyboard,
  RefreshCw
} from 'lucide-react';
import { FluentTaskManagerIcon } from '../components/FluentIcons';
import { useSystemTasks, SystemTask } from '../context/SystemTasksContext';

interface TaskManagerProps {
  navigate?: (route: string) => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({ navigate }) => {
  const { 
    tasks, 
    endTask, 
    restartTask, 
    toggleEfficiencyMode, 
    runNewTask 
  } = useSystemTasks();

  const [activeTab, setActiveTab] = useState<'processes' | 'performance' | 'apphistory' | 'services'>('processes');
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(tasks[0]?.id || 'task-copilot');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');

  // Filter tasks based on search
  const filteredTasks = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return tasks;
    return tasks.filter(
      (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || String(t.pid).includes(q)
    );
  }, [tasks, searchQuery]);

  const selectedProcess = useMemo(() => {
    return tasks.find((t) => t.id === selectedProcessId) || null;
  }, [tasks, selectedProcessId]);

  const handleEndTask = () => {
    if (!selectedProcessId) return;
    endTask(selectedProcessId);
  };

  const handleRestartTask = () => {
    if (!selectedProcessId) return;
    restartTask(selectedProcessId);
  };

  const handleToggleEfficiency = () => {
    if (!selectedProcessId) return;
    toggleEfficiencyMode(selectedProcessId);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;
    runNewTask(newTaskName.trim());
    setNewTaskName('');
    setIsNewTaskModalOpen(false);
  };

  // Overall metrics calculation
  const overallMetrics = useMemo(() => {
    const activeTasks = tasks.filter((t) => t.status !== 'Terminated');
    const totalCpu = Number(activeTasks.reduce((acc, t) => acc + t.cpu, 0).toFixed(1));
    const totalMem = Number((activeTasks.reduce((acc, t) => acc + t.memory, 0) / 1024 + 1.6).toFixed(2));
    const totalNet = Math.round(activeTasks.reduce((acc, t) => acc + t.network, 0));
    return {
      cpu: Math.min(100, totalCpu),
      memory: totalMem,
      network: totalNet,
    };
  }, [tasks]);

  const getTaskIcon = (name: string) => {
    if (name.includes('Copilot')) return <Sparkles className="w-4 h-4 text-[#0078d4] dark:text-[#4cc2ff]" />;
    if (name.includes('M3U8')) return <Tv className="w-4 h-4 text-purple-500" />;
    if (name.includes('Keyboard')) return <Keyboard className="w-4 h-4 text-amber-500" />;
    if (name.includes('Experience Host') || name.includes('Update')) return <Activity className="w-4 h-4 text-rose-500" />;
    if (name.includes('WebView')) return <Monitor className="w-4 h-4 text-sky-500" />;
    if (name.includes('Widgets')) return <Layers className="w-4 h-4 text-emerald-500" />;
    return <Cpu className="w-4 h-4 text-neutral-400" />;
  };

  return (
    <div className="w-full min-h-screen bg-transparent text-[#111827] dark:text-[#f3f4f6] flex flex-col p-3 sm:p-5 md:p-6 select-none font-sans">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#0078d4]/10 dark:bg-[#4cc2ff]/20 text-[#0078d4] dark:text-[#4cc2ff] flex items-center justify-center shrink-0 border border-[#4cc2ff]/30 shadow-xs">
            <FluentTaskManagerIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111827] dark:text-white">
                Task Manager
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-[#0078d4]/10 dark:bg-[#4cc2ff]/20 text-[#0078d4] dark:text-[#4cc2ff] border border-[#0078d4]/20 dark:border-[#4cc2ff]/30">
                A-Z Tasks • Sparkle (Dev)
              </span>
            </div>
            <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] mt-0.5">
              Quản lý tiến trình, theo dõi hiệu năng hệ thống và các thành phần cốt lõi của Sparkle (Dev).
            </p>
          </div>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => setIsNewTaskModalOpen(true)}
            className="px-3 py-1.5 rounded-[5px] bg-[#0078d4] dark:bg-[#4cc2ff] hover:bg-[#106ebe] dark:hover:bg-[#6bd0ff] text-white dark:text-black text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run new task</span>
          </button>

          <button
            type="button"
            disabled={!selectedProcess || selectedProcess.status === 'Terminated'}
            onClick={handleEndTask}
            className={`px-3 py-1.5 rounded-[5px] text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
              !selectedProcess || selectedProcess.status === 'Terminated'
                ? 'opacity-40 cursor-not-allowed border-black/10 dark:border-white/10 text-neutral-400'
                : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30 cursor-pointer'
            }`}
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>End task</span>
          </button>

          {selectedProcess?.status === 'Terminated' ? (
            <button
              type="button"
              onClick={handleRestartTask}
              className="px-3 py-1.5 rounded-[5px] text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Restart task</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={!selectedProcess}
              onClick={handleToggleEfficiency}
              className={`px-3 py-1.5 rounded-[5px] text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
                selectedProcess?.status === 'Efficiency mode'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                  : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-neutral-700 dark:text-neutral-300 hover:bg-black/10 dark:hover:bg-white/10'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Efficiency mode</span>
            </button>
          )}
        </div>
      </div>

      {/* Warning banner for critical processes */}
      {selectedProcess?.isCritical && selectedProcess.status !== 'Terminated' && (
        <div className="mb-3 px-3.5 py-2 rounded-[6px] bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            <strong>Cảnh báo:</strong> <em>{selectedProcess.name}</em> là thành phần hệ thống chính. Nếu bạn bấm <strong>End task</strong>, ứng dụng web sẽ bị crash ngay lập tức!
          </span>
        </div>
      )}

      {/* Fluent Segmented Tabs Bar */}
      <div className="flex items-center gap-1 border-b border-black/10 dark:border-white/10 pb-2 mb-4 overflow-x-auto no-scrollbar">
        {[
          { id: 'processes', label: 'Processes (A-Z)', icon: Activity },
          { id: 'performance', label: 'Performance', icon: TrendingUp },
          { id: 'apphistory', label: 'App history', icon: Clock },
          { id: 'services', label: 'Services', icon: Layers }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-[5px] text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-white/80 dark:bg-[#2b2b2b] text-[#0078d4] dark:text-[#4cc2ff] shadow-xs border border-black/10 dark:border-white/10 font-semibold'
                  : 'text-[#4b5563] dark:text-[#d1d5db] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: PROCESSES (SORTED A-Z) */}
      {activeTab === 'processes' && (
        <div className="flex-1 flex flex-col bg-white/70 dark:bg-[#282c31]/80 backdrop-blur-md rounded-[8px] border border-black/10 dark:border-white/10 shadow-xs overflow-hidden">
          {/* Search & Filter Header */}
          <div className="p-3 border-b border-black/10 dark:border-white/10 flex items-center justify-between gap-3 bg-black/[0.02] dark:bg-black/20">
            <div className="group relative flex-1 max-w-sm h-8 sm:h-8.5 bg-black/5 dark:bg-[#282c31] border border-black/10 dark:border-white/10 rounded-[5px] flex items-center px-3.5 gap-2 transition-all focus-within:ring-1 focus-within:ring-[#0078d4]/30 dark:focus-within:ring-[#4cc2ff]/30 focus-within:border-b-2 focus-within:border-b-[#005fb8] dark:focus-within:border-b-[#4cc2ff]">
              <Search className="w-3.5 h-3.5 text-[#71717a] dark:text-[#a1a1aa] shrink-0 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm tác vụ (A-Z, PID) hoặc dùng /search..."
                className="w-full bg-transparent text-xs text-[#111827] dark:text-white placeholder-[#71717a] dark:placeholder-[#9ca3af] outline-none border-none py-1 pr-6 no-fluent-line"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 text-[#71717a] hover:text-black dark:hover:text-white p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="text-xs text-[#6b7280] dark:text-[#9ca3af]">
              Đang hiển thị <span className="font-semibold text-black dark:text-white">{filteredTasks.length}</span> tác vụ (Sắp xếp A-Z)
            </div>
          </div>

          {/* Processes Table */}
          <div className="flex-1 overflow-x-auto overflow-y-auto no-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10 bg-black/[0.04] dark:bg-black/30 text-[#4b5563] dark:text-[#9ca3af] sticky top-0 z-10 font-semibold">
                  <th className="py-2.5 px-3 min-w-[260px]">Tên tác vụ (A-Z)</th>
                  <th className="py-2.5 px-3 min-w-[120px]">Trạng thái</th>
                  <th className="py-2.5 px-3 text-right min-w-[70px]">CPU</th>
                  <th className="py-2.5 px-3 text-right min-w-[90px]">Memory</th>
                  <th className="py-2.5 px-3 text-right min-w-[80px]">Disk</th>
                  <th className="py-2.5 px-3 text-right min-w-[90px]">Network</th>
                  <th className="py-2.5 px-3 text-right min-w-[70px]">GPU</th>
                  <th className="py-2.5 px-3 text-center min-w-[70px]">PID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {filteredTasks.map((proc) => {
                  const isSelected = selectedProcessId === proc.id;
                  return (
                    <tr
                      key={proc.id}
                      onClick={() => setSelectedProcessId(proc.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#0078d4]/10 dark:bg-[#4cc2ff]/15 text-[#0078d4] dark:text-white font-medium'
                          : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                      }`}
                    >
                      {/* Name & Impact Note */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-[5px] bg-white dark:bg-black/40 flex items-center justify-center shrink-0 border border-black/10 dark:border-white/10 shadow-xs">
                            {getTaskIcon(proc.name)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold truncate text-[13px]">{proc.name}</div>
                            <div className="text-[11px] text-[#6b7280] dark:text-[#9ca3af] truncate">
                              {proc.description}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[10px] font-semibold ${
                            proc.status === 'Running'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              : proc.status === 'Efficiency mode'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                              : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {proc.status}
                        </span>
                      </td>

                      {/* CPU */}
                      <td className="py-2.5 px-3 text-right font-mono">
                        <span className={proc.cpu > 4 ? 'text-amber-600 dark:text-amber-400 font-bold' : ''}>
                          {proc.cpu.toFixed(1)}%
                        </span>
                      </td>

                      {/* Memory */}
                      <td className="py-2.5 px-3 text-right font-mono">
                        {proc.memory.toFixed(1)} MB
                      </td>

                      {/* Disk */}
                      <td className="py-2.5 px-3 text-right font-mono text-[#6b7280] dark:text-[#9ca3af]">
                        {proc.disk.toFixed(1)} MB/s
                      </td>

                      {/* Network */}
                      <td className="py-2.5 px-3 text-right font-mono">
                        <span className={proc.network > 1000 ? 'text-[#0078d4] dark:text-[#4cc2ff] font-semibold' : ''}>
                          {proc.network} Kbps
                        </span>
                      </td>

                      {/* GPU */}
                      <td className="py-2.5 px-3 text-right font-mono">
                        {proc.gpu.toFixed(1)}%
                      </td>

                      {/* PID */}
                      <td className="py-2.5 px-3 text-center font-mono text-[#6b7280] dark:text-[#9ca3af]">
                        {proc.pid}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer Details on Selected Process Impact */}
          {selectedProcess && (
            <div className="p-3 bg-black/[0.03] dark:bg-black/30 border-t border-black/10 dark:border-white/10 text-xs text-[#4b5563] dark:text-[#d1d5db]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <strong className="text-black dark:text-white">{selectedProcess.name}:</strong>{' '}
                  {selectedProcess.id === 'task-host' && 'Đây là phần chính. Nếu End Task -> Gây lỗi crash sập toàn bộ web.'}
                  {selectedProcess.id === 'task-update' && 'Đây là phần chính. Nếu End Task -> Gây lỗi crash sập toàn bộ web.'}
                  {selectedProcess.id === 'task-copilot' && 'Nếu End Task -> Không thể trò chuyện và hỏi đáp với AI Copilot.'}
                  {selectedProcess.id === 'task-m3u8' && 'Nếu End Task -> Không thể giải mã phát các kênh Live TV ở tab Watch.'}
                  {selectedProcess.id === 'task-webview' && 'Nếu End Task -> Các banner và logo kênh sẽ ngừng tải, luôn chạy vòng xoay spinning ring.'}
                  {selectedProcess.id === 'task-widgets' && 'Nếu End Task -> Bảng Widgets tab sẽ ngừng hoạt động.'}
                  {selectedProcess.id === 'task-keyboard' && 'Nếu End Task -> Bàn phím ảo Native Virtual Keyboard sẽ bị tắt bỏ.'}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {selectedProcess.status === 'Terminated' ? (
                    <button
                      type="button"
                      onClick={handleRestartTask}
                      className="px-2.5 py-1 rounded bg-[#0078d4] dark:bg-[#4cc2ff] text-white dark:text-black font-semibold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCw className="w-3 h-3" />
                      <span>Khôi phục tiến trình</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleEndTask}
                      className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold text-xs flex items-center gap-1 cursor-pointer hover:bg-rose-500/20"
                    >
                      <Square className="w-3 h-3 fill-current" />
                      <span>End task</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: PERFORMANCE */}
      {activeTab === 'performance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="space-y-3">
            <div className="p-4 rounded-[8px] bg-white/75 dark:bg-[#282c31]/80 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#0078d4]/10 dark:bg-[#4cc2ff]/20 text-[#0078d4] dark:text-[#4cc2ff] flex items-center justify-center shrink-0">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-[#6b7280] dark:text-[#9ca3af] font-medium">CPU Tổng hợp</div>
                  <div className="text-lg font-bold text-black dark:text-white">{overallMetrics.cpu}%</div>
                  <div className="text-[11px] text-[#6b7280] dark:text-[#9ca3af]">3.40 GHz • 8 Cores</div>
                </div>
              </div>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">Ổn định</span>
            </div>

            <div className="p-4 rounded-[8px] bg-white/75 dark:bg-[#282c31]/80 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-[#6b7280] dark:text-[#9ca3af] font-medium">Memory (RAM)</div>
                  <div className="text-lg font-bold text-black dark:text-white">{overallMetrics.memory} / 8.0 GB</div>
                  <div className="text-[11px] text-[#6b7280] dark:text-[#9ca3af]">Dung lượng sử dụng</div>
                </div>
              </div>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">Normal</span>
            </div>

            <div className="p-4 rounded-[8px] bg-white/75 dark:bg-[#282c31]/80 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                  <Wifi className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-[#6b7280] dark:text-[#9ca3af] font-medium">Network (Băng thông)</div>
                  <div className="text-lg font-bold text-black dark:text-white">{overallMetrics.network} Kbps</div>
                  <div className="text-[11px] text-[#6b7280] dark:text-[#9ca3af]">HLS Streaming</div>
                </div>
              </div>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">Live</span>
            </div>
          </div>

          <div className="lg:col-span-2 p-5 rounded-[8px] bg-white/75 dark:bg-[#282c31]/80 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-black dark:text-white">Tổng quan tài nguyên Sparkle (Dev)</h3>
            <div className="h-48 w-full bg-black/5 dark:bg-black/30 rounded-md border border-black/5 dark:border-white/5 flex items-end gap-2 p-4">
              {tasks.map((t) => (
                <div key={t.id} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div
                    style={{ height: `${Math.min(100, Math.max(10, t.cpu * 12))}%` }}
                    className="w-full bg-gradient-to-t from-[#0078d4] to-[#4cc2ff] rounded-t-xs"
                  />
                  <span className="text-[9px] font-mono mt-1 text-[#6b7280] dark:text-[#9ca3af] truncate w-full text-center">
                    {t.name.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SERVICES & HISTORY */}
      {(activeTab === 'services' || activeTab === 'apphistory') && (
        <div className="p-4 rounded-[8px] bg-white/75 dark:bg-[#282c31]/80 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-xs text-xs space-y-2">
          <div className="font-semibold text-sm text-black dark:text-white">Lịch sử và dịch vụ hệ thống Sparkle (Dev)</div>
          <p className="text-[#6b7280] dark:text-[#9ca3af]">
            Tất cả 7 tiến trình cốt lõi được giám sát chặt chẽ từ A đến Z bởi trình điều khiển Task Manager.
          </p>
        </div>
      )}

      {/* Run New Task Modal */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#282c31] rounded-[10px] border border-black/10 dark:border-white/10 shadow-2xl p-5 select-text">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#0078d4] dark:text-[#4cc2ff]" />
                <h3 className="text-sm font-bold text-black dark:text-white">Run new task</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewTaskModalOpen(false)}
                className="text-neutral-500 hover:text-black dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#4b5563] dark:text-[#9ca3af] mb-1">
                  Nhập tên tác vụ hoặc tiến trình cần khởi chạy:
                </label>
                <input
                  type="text"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  placeholder="Ví dụ: Diagnostics Tool, EPG Fetcher..."
                  autoFocus
                  className="w-full h-8 px-3 rounded-[5px] bg-black/5 dark:bg-[#1b1f24] border border-black/10 dark:border-white/10 text-xs text-[#111827] dark:text-white outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className="px-4 py-1.5 rounded-[5px] border border-black/10 dark:border-white/10 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTaskName.trim()}
                  className="px-4 py-1.5 rounded-[5px] bg-[#0078d4] dark:bg-[#4cc2ff] hover:bg-[#106ebe] dark:hover:bg-[#6bd0ff] text-white dark:text-black text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  OK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
