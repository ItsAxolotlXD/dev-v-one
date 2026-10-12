import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

export interface SystemTask {
  id: string;
  name: string;
  description: string;
  category: 'Apps' | 'Background processes' | 'V-One (Dev) Services';
  status: 'Running' | 'Terminated' | 'Efficiency mode';
  cpu: number;
  memory: number; // in MB
  disk: number; // in MB/s
  network: number; // in Kbps
  gpu: number; // in %
  pid: number;
  isCritical?: boolean;
}

// 7 exact tasks requested by user, sorted strictly A-Z
const INITIAL_SYSTEM_TASKS: SystemTask[] = [
  {
    id: 'task-copilot',
    name: 'Copilot Runtime Engine',
    description: 'Xử lý các truy vấn trí tuệ nhân tạo và hội thoại Copilot',
    category: 'Apps',
    status: 'Running',
    cpu: 1.8,
    memory: 64.2,
    disk: 0.1,
    network: 48,
    gpu: 0.8,
    pid: 3120,
    isCritical: false
  },
  {
    id: 'task-m3u8',
    name: 'M3U8 Extension',
    description: 'Trình giải mã và truyền dẫn luồng HLS cho tab Watch',
    category: 'Apps',
    status: 'Running',
    cpu: 5.6,
    memory: 128.5,
    disk: 1.4,
    network: 3200,
    gpu: 14.2,
    pid: 4812,
    isCritical: false
  },
  {
    id: 'task-keyboard',
    name: 'Swift Keyboard Engine',
    description: 'Trình điều khiển bàn phím ảo Native Virtual Keyboard',
    category: 'Background processes',
    status: 'Running',
    cpu: 0.2,
    memory: 18.4,
    disk: 0.0,
    network: 0,
    gpu: 0.0,
    pid: 5290,
    isCritical: false
  },
  {
    id: 'task-host',
    name: 'V-One Experience Host',
    description: 'Tiến trình lõi điều phối giao diện và hoạt động V-One (Dev)',
    category: 'V-One (Dev) Services',
    status: 'Running',
    cpu: 4.2,
    memory: 182.0,
    disk: 0.8,
    network: 120,
    gpu: 8.5,
    pid: 1024,
    isCritical: true // nếu end task sẽ crash web
  },
  {
    id: 'task-update',
    name: 'V-One Update Services',
    description: 'Dịch vụ cập nhật nền tảng và kiểm tra tính toàn vẹn hệ thống',
    category: 'V-One (Dev) Services',
    status: 'Running',
    cpu: 0.4,
    memory: 42.6,
    disk: 0.2,
    network: 15,
    gpu: 0.0,
    pid: 2048,
    isCritical: true // nếu end task sẽ crash web
  },
  {
    id: 'task-webview',
    name: 'WebView Rendering Engine',
    description: 'Bộ máy dựng hình banner, hình ảnh và logo các kênh truyền hình',
    category: 'Background processes',
    status: 'Running',
    cpu: 3.1,
    memory: 92.4,
    disk: 0.5,
    network: 240,
    gpu: 12.0,
    pid: 6140,
    isCritical: false // nếu end task banner/logo sẽ hiển thị spinning ring
  },
  {
    id: 'task-widgets',
    name: 'Widgets Dashboard Experience',
    description: 'Trình quản lý bảng tiện ích Widgets và cấp dữ liệu VnExpress',
    category: 'Apps',
    status: 'Running',
    cpu: 2.4,
    memory: 78.1,
    disk: 0.3,
    network: 540,
    gpu: 4.6,
    pid: 7380,
    isCritical: false // nếu end task Widgets tab ko hoạt động
  },
  {
    id: 'task-edge',
    name: 'Microsoft Edge Browser',
    description: 'Trình duyệt web nhân Chromium đa luồng và bảo mật',
    category: 'Apps',
    status: 'Running',
    cpu: 3.5,
    memory: 142.0,
    disk: 1.8,
    network: 860,
    gpu: 14.2,
    pid: 7920,
    isCritical: false
  },
  {
    id: 'task-file-explorer',
    name: 'Windows File Explorer',
    description: 'Trình quản lý tệp tin và lưu trữ hệ thống tệp Fluent',
    category: 'Apps',
    status: 'Running',
    cpu: 1.1,
    memory: 64.2,
    disk: 1.2,
    network: 20,
    gpu: 1.2,
    pid: 8120,
    isCritical: false
  },
  {
    id: 'task-photos',
    name: 'Gallery Media Library',
    description: 'Trình quản lý và lưu trữ thư viện hình ảnh và video Gallery',
    category: 'Apps',
    status: 'Running',
    cpu: 2.1,
    memory: 86.4,
    disk: 2.1,
    network: 320,
    gpu: 8.4,
    pid: 8990,
    isCritical: false
  },
  {
    id: 'task-camera',
    name: 'Windows Camera Engine',
    description: 'Bộ điều khiển phần cứng quang học và chụp ảnh trực tiếp',
    category: 'Apps',
    status: 'Running',
    cpu: 2.8,
    memory: 98.6,
    disk: 1.4,
    network: 0,
    gpu: 16.5,
    pid: 9140,
    isCritical: false
  },
  {
    id: 'task-ms-paint',
    name: 'Microsoft Paint',
    description: 'Ứng dụng vẽ và chỉnh sửa đồ họa đa năng',
    category: 'Apps',
    status: 'Running',
    cpu: 1.8,
    memory: 72.5,
    disk: 0.4,
    network: 0,
    gpu: 6.8,
    pid: 8460,
    isCritical: false
  }
];

export type CrashPhase = 'idle' | 'cursor-busy' | 'splash' | 'crashed';

interface SystemTasksContextType {
  tasks: SystemTask[];
  endTask: (id: string) => void;
  restartTask: (id: string) => void;
  toggleEfficiencyMode: (id: string) => void;
  isTaskRunning: (id: string) => boolean;
  isSystemCrashed: boolean;
  crashPhase: CrashPhase;
  crashReason: string | null;
  restartSystem: () => void;
  runNewTask: (name: string) => void;
}

const SystemTasksContext = createContext<SystemTasksContextType | undefined>(undefined);

export const SystemTasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<SystemTask[]>(INITIAL_SYSTEM_TASKS);
  const [isSystemCrashed, setIsSystemCrashed] = useState(false);
  const [crashPhase, setCrashPhase] = useState<CrashPhase>('idle');
  const [crashReason, setCrashReason] = useState<string | null>(null);
  const crashTimeoutsRef = React.useRef<NodeJS.Timeout[]>([]);

  // Periodically fluctuate CPU and memory slightly for active tasks to look realistic
  useEffect(() => {
    if (isSystemCrashed) return;

    const interval = setInterval(() => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.status === 'Terminated') return t;
          const cpuDelta = (Math.random() - 0.49) * 0.5;
          const newCpu = Math.max(0.1, Number((t.cpu + cpuDelta).toFixed(1)));
          const memDelta = (Math.random() - 0.5) * 0.8;
          const newMem = Math.max(10, Number((t.memory + memDelta).toFixed(1)));
          return {
            ...t,
            cpu: newCpu,
            memory: newMem,
          };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [isSystemCrashed]);

  // Check critical task crashes with 5s cursor busy + 5s splash screen sequence
  const endTask = useCallback((id: string) => {
    setTasks((prev) => {
      const target = prev.find((t) => t.id === id);
      if (target && target.isCritical) {
        setCrashReason(target.name);
        setCrashPhase('cursor-busy');
        if (typeof document !== 'undefined') {
          document.documentElement.style.cursor = 'wait';
          document.body.style.cursor = 'wait';
        }

        // Clear any previous timers
        crashTimeoutsRef.current.forEach(clearTimeout);
        crashTimeoutsRef.current = [];

        // 1. Mouse cursor becomes busy for 5 seconds
        const timer1 = setTimeout(() => {
          setCrashPhase('splash');
          if (typeof document !== 'undefined') {
            document.documentElement.style.cursor = '';
            document.body.style.cursor = '';
          }
        }, 5000);

        // 2. Splash screen runs for 5 seconds (5000ms to 10000ms), then app crashes
        const timer2 = setTimeout(() => {
          setCrashPhase('crashed');
          setIsSystemCrashed(true);
        }, 10000);

        crashTimeoutsRef.current.push(timer1, timer2);
      }
      return prev.map((t) =>
        t.id === id ? { ...t, status: 'Terminated', cpu: 0, network: 0 } : t
      );
    });
  }, []);

  const restartTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const initial = INITIAL_SYSTEM_TASKS.find((i) => i.id === id);
        return {
          ...t,
          status: 'Running',
          cpu: initial ? initial.cpu : 2.0,
          memory: initial ? initial.memory : 50.0,
          network: initial ? initial.network : 100,
        };
      })
    );
  }, []);

  const toggleEfficiencyMode = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const nextStatus = t.status === 'Efficiency mode' ? 'Running' : 'Efficiency mode';
        return {
          ...t,
          status: nextStatus,
          cpu: nextStatus === 'Efficiency mode' ? Number((t.cpu * 0.4).toFixed(1)) : t.cpu,
        };
      })
    );
  }, []);

  const isTaskRunning = useCallback(
    (id: string) => {
      const task = tasks.find((t) => t.id === id);
      return task ? task.status !== 'Terminated' : true;
    },
    [tasks]
  );

  const restartSystem = useCallback(() => {
    crashTimeoutsRef.current.forEach(clearTimeout);
    crashTimeoutsRef.current = [];
    if (typeof document !== 'undefined') {
      document.documentElement.style.cursor = '';
      document.body.style.cursor = '';
    }
    setTasks(INITIAL_SYSTEM_TASKS);
    setCrashPhase('idle');
    setIsSystemCrashed(false);
    setCrashReason(null);
  }, []);

  const runNewTask = useCallback((name: string) => {
    const newTask: SystemTask = {
      id: `task-custom-${Date.now()}`,
      name,
      description: 'Tiến trình do người dùng khởi chạy',
      category: 'Apps',
      status: 'Running',
      cpu: Number((Math.random() * 2 + 1).toFixed(1)),
      memory: Number((Math.random() * 30 + 20).toFixed(1)),
      disk: 0.1,
      network: 80,
      gpu: 0.5,
      pid: Math.floor(Math.random() * 7000) + 3000,
      isCritical: false,
    };
    setTasks((prev) => [...prev, newTask].sort((a, b) => a.name.localeCompare(b.name)));
  }, []);

  // Ensure tasks are always sorted from A to Z
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => a.name.localeCompare(b.name));
  }, [tasks]);

  return (
    <SystemTasksContext.Provider
      value={{
        tasks: sortedTasks,
        endTask,
        restartTask,
        toggleEfficiencyMode,
        isTaskRunning,
        isSystemCrashed,
        crashPhase,
        crashReason,
        restartSystem,
        runNewTask,
      }}
    >
      {children}
    </SystemTasksContext.Provider>
  );
};

export const useSystemTasks = () => {
  const context = useContext(SystemTasksContext);
  if (!context) {
    throw new Error('useSystemTasks must be used within a SystemTasksProvider');
  }
  return context;
};
