import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Tag,
  Check,
  Trash2,
  Edit2,
  X,
  Tv,
  Download,
  Search,
  Filter,
  CalendarDays,
  List,
  AlertCircle,
  Sparkles,
  Share2
} from 'lucide-react';
import { Channel } from '../../types';
import { CHANNELS_DATA } from '../../data/channels';

export interface CalendarEvent {
  id: string;
  title: string;
  dateStr: string; // "YYYY-MM-DD" e.g. "2026-10-17"
  startTime: string; // "09:00"
  endTime: string; // "10:30"
  isAllDay?: boolean;
  category: 'work' | 'personal' | 'tv' | 'sports' | 'urgent';
  location?: string;
  channelId?: string; // e.g. 'vtv1'
  description?: string;
  reminderMinutes?: number;
}

export const EVENT_CATEGORIES = {
  work: { label: 'Công việc', color: '#0078d4', bg: 'bg-[#0078d4]', text: 'text-[#0078d4]', border: 'border-[#0078d4]/30' },
  personal: { label: 'Cá nhân', color: '#8764b8', bg: 'bg-[#8764b8]', text: 'text-[#8764b8]', border: 'border-[#8764b8]/30' },
  tv: { label: 'Truyền hình & TV', color: '#d83b01', bg: 'bg-[#d83b01]', text: 'text-[#d83b01]', border: 'border-[#d83b01]/30' },
  sports: { label: 'Thể thao', color: '#107c41', bg: 'bg-[#107c41]', text: 'text-[#107c41]', border: 'border-[#107c41]/30' },
  urgent: { label: 'Nhắc nhở quan trọng', color: '#e81123', bg: 'bg-[#e81123]', text: 'text-[#e81123]', border: 'border-[#e81123]/30' }
};

// Seed default events around October 2026
const DEFAULT_EVENTS: CalendarEvent[] = [
  {
    id: 'evt-1',
    title: 'Thời sự 19h VTV1 HD Trực tiếp',
    dateStr: '2026-10-17',
    startTime: '19:00',
    endTime: '19:50',
    isAllDay: false,
    category: 'tv',
    channelId: 'vtv1',
    location: 'Phim trường S4 - Đài Truyền hình Việt Nam',
    description: 'Bản tin Thời sự toàn cảnh với tiêu điểm phát triển kinh tế số và tổng hợp tin tức trong nước & quốc tế.',
    reminderMinutes: 15
  },
  {
    id: 'evt-2',
    title: 'Họp đồng bộ dự án Sparkle (Dev) Fluent 2026',
    dateStr: '2026-10-17',
    startTime: '10:00',
    endTime: '11:30',
    isAllDay: false,
    category: 'work',
    location: 'Microsoft Teams / Phòng họp trực tuyến V-One',
    description: 'Báo cáo tiến độ hoàn thiện bộ giao diện Fluent Acrylic, tối ưu Mail & Calendar tabs và hệ thống kênh truyền hình.',
    reminderMinutes: 30
  },
  {
    id: 'evt-3',
    title: 'Trực tiếp Bán kết Bóng chuyền ASIAD 2026',
    dateStr: '2026-10-17',
    startTime: '15:30',
    endTime: '17:30',
    isAllDay: false,
    category: 'sports',
    channelId: 'vtv5',
    location: 'Kênh VTV5 & VTV Cần Thơ',
    description: 'Đội tuyển bóng chuyền nữ Việt Nam thi đấu trận bán kết kịch tính tại Đại hội Thể thao Châu Á 2026.',
    reminderMinutes: 15
  },
  {
    id: 'evt-4',
    title: 'Gặp mặt bạn bè Swift Social & Cafe cuối tuần',
    dateStr: '2026-10-18',
    startTime: '14:30',
    endTime: '16:30',
    isAllDay: false,
    category: 'personal',
    location: 'The Coffee House - Phố Cổ Hà Nội',
    description: 'Gặp mặt team phát triển Swift Social cùng các thành viên tích cực trao đổi về kế hoạch phát triển cộng đồng.',
    reminderMinutes: 60
  },
  {
    id: 'evt-5',
    title: 'Chương trình Chào Buổi Sáng VTV1',
    dateStr: '2026-10-19',
    startTime: '05:30',
    endTime: '07:00',
    isAllDay: false,
    category: 'tv',
    channelId: 'vtv1',
    location: 'Kênh VTV1 HD',
    description: 'Điểm tin buổi sáng, dự báo thời tiết và nhịp sống thường nhật cùng VTV1.',
    reminderMinutes: 10
  },
  {
    id: 'evt-6',
    title: 'Sao kê định kỳ & Thanh toán Swift Bank',
    dateStr: '2026-10-20',
    startTime: '09:00',
    endTime: '09:30',
    isAllDay: false,
    category: 'urgent',
    location: 'Ứng dụng Swift Bank',
    description: 'Kiểm tra biến động số dư và thanh toán hóa đơn tiện ích tự động.',
    reminderMinutes: 60
  },
  {
    id: 'evt-7',
    title: 'Thử nghiệm công thức Phở Bò Cookbook',
    dateStr: '2026-10-21',
    startTime: '11:00',
    endTime: '13:00',
    isAllDay: false,
    category: 'personal',
    location: 'Bếp gia đình',
    description: 'Nấu phở bò tái lăn theo công thức chuẩn vị 3 miền trên tab Cookbook V-One.',
    reminderMinutes: 30
  },
  {
    id: 'evt-8',
    title: 'Sinh nhật Câu Lạc Bộ V-One Sparkle',
    dateStr: '2026-10-25',
    startTime: '09:00',
    endTime: '17:00',
    isAllDay: true,
    category: 'personal',
    location: 'Trung tâm Hội nghị Sparkle Studio',
    description: 'Sự kiện kỷ niệm ngày thành lập cộng đồng những người yêu truyền hình Việt Nam.',
    reminderMinutes: 1440
  }
];

// Helper for Vietnamese Lunar Day Approximation for Year 2026 (Tháng 8 - 9 Âm Lịch)
// Oct 2026 corresponds to late 8th / early 9th lunar month in Vietnamese calendar
function getVietnameseLunarDate(year: number, month: number, day: number): string {
  // Approximate conversion for October 2026:
  // 2026-10-01 is roughly 21/8 Âm lịch
  // 2026-10-10 is roughly 1/9 Âm lịch
  // 2026-10-24 is roughly 15/9 Âm lịch (Rằm tháng 9)
  try {
    const baseDate = new Date(2026, 9, 1); // 1 Oct 2026
    const curDate = new Date(year, month, day);
    const diffDays = Math.round((curDate.getTime() - baseDate.getTime()) / (86400000));
    
    // Lunar day base calculation
    let lunarDay = (21 + diffDays);
    let lunarMonth = 8;
    
    if (lunarDay > 29) {
      lunarDay = lunarDay - 29;
      lunarMonth = 9;
    }
    if (lunarDay > 30) {
      lunarDay = lunarDay - 30;
      lunarMonth = 10;
    }

    if (lunarDay === 1) return `1/${lunarMonth} ÂL`;
    if (lunarDay === 15) return `Rằm (15/${lunarMonth})`;
    return `${lunarDay}`;
  } catch {
    return `${day}`;
  }
}

interface CalendarAppProps {
  navigate?: (route: string) => void;
}

export const CalendarApp: React.FC<CalendarAppProps> = ({ navigate }) => {
  // Current view date (starts at local date in October 2026)
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date(2026, 9, 17));
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date(2026, 9, 17));
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'agenda'>('month');

  // Events storage
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    try {
      const saved = localStorage.getItem('vone_fluent_calendar_events');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_EVENTS;
  });

  // Filter categories
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'work',
    'personal',
    'tv',
    'sports',
    'urgent'
  ]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [viewingEvent, setViewingEvent] = useState<CalendarEvent | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<'work' | 'personal' | 'tv' | 'sports' | 'urgent'>('work');
  const [formDate, setFormDate] = useState('2026-10-17');
  const [formStartTime, setFormStartTime] = useState('09:00');
  const [formEndTime, setFormEndTime] = useState('10:00');
  const [formIsAllDay, setFormIsAllDay] = useState(false);
  const [formLocation, setFormLocation] = useState('');
  const [formChannelId, setFormChannelId] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formReminder, setFormReminder] = useState(15);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('vone_fluent_calendar_events', JSON.stringify(events));
    } catch {}
  }, [events]);

  // Format Helper: YYYY-MM-DD
  const formatYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Navigations
  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      setCurrentDate(d);
      setSelectedDate(d);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 1);
      setCurrentDate(d);
      setSelectedDate(d);
    }
  };

  const handleToday = () => {
    const today = new Date(2026, 9, 17);
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Open Add Event modal for a specific date
  const openNewEventModal = (dateStr?: string) => {
    setEditingEvent(null);
    setFormTitle('');
    setFormCategory('work');
    setFormDate(dateStr || formatYMD(selectedDate));
    setFormStartTime('09:00');
    setFormEndTime('10:00');
    setFormIsAllDay(false);
    setFormLocation('');
    setFormChannelId('');
    setFormDescription('');
    setFormReminder(15);
    setIsEventModalOpen(true);
  };

  // Open Edit Event
  const openEditEventModal = (evt: CalendarEvent) => {
    setViewingEvent(null);
    setEditingEvent(evt);
    setFormTitle(evt.title);
    setFormCategory(evt.category);
    setFormDate(evt.dateStr);
    setFormStartTime(evt.startTime);
    setFormEndTime(evt.endTime);
    setFormIsAllDay(!!evt.isAllDay);
    setFormLocation(evt.location || '');
    setFormChannelId(evt.channelId || '');
    setFormDescription(evt.description || '');
    setFormReminder(evt.reminderMinutes || 15);
    setIsEventModalOpen(true);
  };

  // Save Event
  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast('Vui lòng nhập tiêu đề sự kiện');
      return;
    }

    if (editingEvent) {
      // Update
      setEvents((prev) =>
        prev.map((evt) =>
          evt.id === editingEvent.id
            ? {
                ...evt,
                title: formTitle,
                category: formCategory,
                dateStr: formDate,
                startTime: formStartTime,
                endTime: formEndTime,
                isAllDay: formIsAllDay,
                location: formLocation,
                channelId: formChannelId || undefined,
                description: formDescription,
                reminderMinutes: formReminder
              }
            : evt
        )
      );
      showToast('Đã cập nhật sự kiện thành công! 📅');
    } else {
      // Create new
      const newEvt: CalendarEvent = {
        id: `evt-${Date.now()}`,
        title: formTitle,
        category: formCategory,
        dateStr: formDate,
        startTime: formStartTime,
        endTime: formEndTime,
        isAllDay: formIsAllDay,
        location: formLocation,
        channelId: formChannelId || undefined,
        description: formDescription,
        reminderMinutes: formReminder
      };
      setEvents((prev) => [...prev, newEvt]);
      showToast('Đã thêm sự kiện mới vào lịch! ✨');
    }

    setIsEventModalOpen(false);
  };

  // Delete Event
  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setViewingEvent(null);
    showToast('Đã xóa sự kiện khỏi lịch');
  };

  // Export iCalendar (.ics) file
  const handleExportIcs = () => {
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Sparkle Dev Fluent Calendar//VI',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];

    events.forEach((evt) => {
      const cleanDate = evt.dateStr.replace(/-/g, '');
      const startT = evt.isAllDay ? '' : `T${evt.startTime.replace(/:/g, '')}00`;
      const endT = evt.isAllDay ? '' : `T${evt.endTime.replace(/:/g, '')}00`;

      icsContent.push('BEGIN:VEVENT');
      icsContent.push(`UID:${evt.id}@sparkle.dev`);
      icsContent.push(`DTSTAMP:${cleanDate}T000000Z`);
      if (evt.isAllDay) {
        icsContent.push(`DTSTART;VALUE=DATE:${cleanDate}`);
      } else {
        icsContent.push(`DTSTART:${cleanDate}${startT}`);
        icsContent.push(`DTEND:${cleanDate}${endT}`);
      }
      icsContent.push(`SUMMARY:${evt.title}`);
      if (evt.description) icsContent.push(`DESCRIPTION:${evt.description}`);
      if (evt.location) icsContent.push(`LOCATION:${evt.location}`);
      icsContent.push('END:VEVENT');
    });

    icsContent.push('END:VCALENDAR');

    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Sparkle_Lich_${currentDate.getMonth() + 1}_2026.ics`;
    link.click();
    showToast('Đã tải xuống tệp lịch .ics! Bạn có thể nhập vào Google / Apple Calendar.');
  };

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      if (!selectedCategories.includes(evt.category)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = evt.title.toLowerCase().includes(q);
        const matchDesc = evt.description?.toLowerCase().includes(q);
        const matchLoc = evt.location?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchLoc) return false;
      }
      return true;
    });
  }, [events, selectedCategories, searchQuery]);

  // Month Grid Calculation
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Days from prev month to fill the first row (starting Monday = 1)
    let startDayOfWeek = firstDay.getDay(); // 0 is Sunday, 1 is Monday...
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // convert Monday = 0

    const days = [];

    // Previous month filler days
    const prevLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevLastDay - i);
      days.push({ date: d, isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      days.push({ date: d, isCurrentMonth: true });
    }

    // Next month filler days to complete 35 or 42 cells
    const remaining = 42 - days.length;
    for (let i = 1; i <= (remaining >= 7 ? remaining - 7 : remaining); i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: d, isCurrentMonth: false });
    }

    return days;
  }, [currentDate]);

  // Week Days Calculation for Week View
  const weekDays = useMemo(() => {
    const curr = new Date(currentDate);
    const day = curr.getDay();
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const monday = new Date(curr.setDate(diff));

    const days = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(monday);
      nextDay.setDate(monday.getDate() + i);
      days.push(nextDay);
    }
    return days;
  }, [currentDate]);

  // Hours for day / week view: 07:00 to 22:00
  const hoursList = useMemo(() => {
    const hours = [];
    for (let h = 7; h <= 22; h++) {
      hours.push(`${String(h).padStart(2, '0')}:00`);
    }
    return hours;
  }, []);

  const MONTH_NAMES = [
    'Tháng Một', 'Tháng Hai', 'Tháng Ba', 'Tháng Tư',
    'Tháng Năm', 'Tháng Sáu', 'Tháng Bảy', 'Tháng Tám',
    'Tháng Chín', 'Tháng Mười', 'Tháng Mười Một', 'Tháng Mười Hai'
  ];

  const WEEKDAY_NAMES = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const FULL_WEEKDAY_NAMES = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];

  return (
    <div className="w-full h-full flex-1 min-h-[calc(100vh-64px)] flex flex-col bg-[#f3f4f6] dark:bg-[#1a1c20] text-neutral-900 dark:text-neutral-100 overflow-hidden font-sans select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 px-4 py-2.5 rounded-full bg-neutral-900/90 dark:bg-white/95 text-white dark:text-neutral-900 text-xs font-semibold shadow-2xl flex items-center gap-2 border border-white/20 animate-fade-in backdrop-blur-md">
          <CalendarIcon className="w-3.5 h-3.5 text-[#0078d4] dark:text-[#4cc2ff]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Command Bar */}
      <header className="h-14 border-b border-black/10 dark:border-white/10 bg-white/80 dark:bg-[#202328]/80 backdrop-blur-md px-4 flex items-center justify-between shrink-0">
        {/* Left: Navigation and Month Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 rounded-[6px] hover:bg-black/5 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
              title="Khoảng thời gian trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 rounded-[6px] hover:bg-black/5 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
              title="Khoảng thời gian tiếp theo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="px-2.5 py-1 rounded-[6px] text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 transition-colors cursor-pointer"
            >
              Hôm nay
            </button>
          </div>

          <h1 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <span>{MONTH_NAMES[currentDate.getMonth()]}, {currentDate.getFullYear()}</span>
            <span className="text-xs font-normal text-neutral-400">
              (Âm lịch: Tháng {currentDate.getMonth() === 9 ? '8 - 9' : '8'})
            </span>
          </h1>
        </div>

        {/* Right: Search, Views Switcher, New Event & Export */}
        <div className="flex items-center gap-2">
          {/* Quick Search */}
          <div className="relative hidden md:block">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm Sự Kiện..."
              className="w-44 h-8 pl-8 pr-2.5 rounded-[8px] bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#0078d4]"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-[8px] p-0.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs">
            {(['month', 'week', 'day', 'agenda'] as const).map((mode) => {
              const labels = {
                month: 'Tháng',
                week: 'Tuần',
                day: 'Ngày',
                agenda: 'Lịch trình'
              };
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={`px-2.5 py-1 rounded-[6px] font-medium transition-colors cursor-pointer ${
                    viewMode === mode
                      ? 'bg-white dark:bg-[#282c31] text-[#0078d4] dark:text-[#4cc2ff] font-bold shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  {labels[mode]}
                </button>
              );
            })}
          </div>

          {/* Export iCal */}
          <button
            type="button"
            onClick={handleExportIcs}
            className="h-8 px-2.5 rounded-[8px] border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Xuất lịch ra file iCalendar (.ics)"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Xuất .ics</span>
          </button>

          {/* New Event Button */}
          <button
            type="button"
            onClick={() => openNewEventModal()}
            className="h-8 px-3 rounded-[8px] bg-[#0078d4] hover:bg-[#0067c0] active:bg-[#005a9e] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Thêm sự kiện</span>
          </button>
        </div>
      </header>

      {/* Main Container: Sidebar + Calendar Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Mini Sidebar: Mini Month picker + Category Filters */}
        <aside className="w-64 border-r border-black/10 dark:border-white/10 bg-white/70 dark:bg-[#202328]/80 backdrop-blur-xl flex flex-col p-4 shrink-0 overflow-y-auto space-y-6">
          {/* Mini Calendar Jump Widget */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              <span>{MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
              {WEEKDAY_NAMES.map((w, i) => (
                <div key={i} className="text-neutral-400 font-semibold py-1">
                  {w}
                </div>
              ))}
              {monthDays.slice(0, 35).map((item, idx) => {
                const isSelected = formatYMD(item.date) === formatYMD(selectedDate);
                const isToday = formatYMD(item.date) === '2026-10-17';

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedDate(item.date);
                      setCurrentDate(item.date);
                    }}
                    className={`h-6 rounded-[4px] flex items-center justify-center font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#0078d4] text-white font-bold'
                        : isToday
                        ? 'border border-[#0078d4] text-[#0078d4] dark:text-[#4cc2ff]'
                        : item.isCurrentMonth
                        ? 'text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5'
                        : 'text-neutral-400 dark:text-neutral-600'
                    }`}
                  >
                    {item.date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Filter Checkboxes */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Lịch của tôi
            </h3>

            <div className="space-y-1.5 text-xs">
              {Object.entries(EVENT_CATEGORIES).map(([key, cat]) => {
                const isChecked = selectedCategories.includes(key);

                return (
                  <label
                    key={key}
                    className="flex items-center gap-2.5 py-1 px-1.5 rounded-[6px] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        setSelectedCategories((prev) =>
                          isChecked ? prev.filter((k) => k !== key) : [...prev, key]
                        );
                      }}
                      className="rounded text-[#0078d4] focus:ring-[#0078d4]"
                    />
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="flex-1 text-neutral-700 dark:text-neutral-300">
                      {cat.label}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {events.filter((e) => e.category === key).length}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Quick TV Link Card */}
          <div className="p-3 rounded-[10px] bg-gradient-to-br from-[#d83b01]/10 to-orange-500/10 border border-[#d83b01]/20 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#d83b01] dark:text-orange-400">
              <Tv className="w-4 h-4" />
              <span>Lịch phát sóng VTV</span>
            </div>
            <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Theo dõi trực tiếp các chương trình Thời sự, Phim truyện và Thể thao trên Live TV.
            </p>
            <button
              type="button"
              onClick={() => navigate?.('/schedule')}
              className="text-xs font-semibold text-[#d83b01] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Xem toàn bộ EPG Guide</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>

        {/* Calendar View Area */}
        <main className="flex-1 flex flex-col bg-white dark:bg-[#1a1c20] overflow-hidden">
          {/* ================= 1. MONTH VIEW ================= */}
          {viewMode === 'month' && (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Day-of-week header row */}
              <div className="grid grid-cols-7 border-b border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] text-xs font-semibold text-neutral-600 dark:text-neutral-400 text-center py-2 shrink-0">
                {FULL_WEEKDAY_NAMES.map((name, idx) => (
                  <div key={idx} className={idx >= 5 ? 'text-amber-600 dark:text-amber-400' : ''}>
                    {name}
                  </div>
                ))}
              </div>

              {/* Month Day Cells Grid (7 columns x 5-6 rows) */}
              <div className="flex-1 grid grid-cols-7 grid-rows-6 divide-x divide-y divide-black/10 dark:divide-white/10 overflow-hidden">
                {monthDays.map((item, idx) => {
                  const dateStr = formatYMD(item.date);
                  const isToday = dateStr === '2026-10-17';
                  const isSelected = dateStr === formatYMD(selectedDate);
                  const dayEvents = filteredEvents.filter((e) => e.dateStr === dateStr);
                  const lunarDateStr = getVietnameseLunarDate(
                    item.date.getFullYear(),
                    item.date.getMonth(),
                    item.date.getDate()
                  );

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedDate(item.date);
                      }}
                      onDoubleClick={() => openNewEventModal(dateStr)}
                      className={`p-1.5 flex flex-col justify-between overflow-hidden cursor-pointer transition-colors relative group ${
                        !item.isCurrentMonth
                          ? 'bg-black/[0.02] dark:bg-white/[0.01] opacity-40'
                          : isSelected
                          ? 'bg-[#0078d4]/5 dark:bg-[#4cc2ff]/5'
                          : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'
                      }`}
                    >
                      {/* Top Date Header: Solar Day + Lunar Day (Âm lịch) */}
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              isToday
                                ? 'bg-[#0078d4] text-white shadow-xs'
                                : isSelected
                                ? 'bg-black/10 dark:bg-white/10 font-bold'
                                : 'text-neutral-900 dark:text-neutral-100'
                            }`}
                          >
                            {item.date.getDate()}
                          </span>
                          <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">
                            {lunarDateStr}
                          </span>
                        </div>

                        {/* Quick add '+' on hover */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openNewEventModal(dateStr);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-neutral-500 hover:text-neutral-900 transition-opacity"
                          title="Thêm sự kiện ngày này"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Events Chips in this day cell */}
                      <div className="flex-1 overflow-y-auto no-scrollbar space-y-1">
                        {dayEvents.slice(0, 3).map((evt) => {
                          const catInfo = EVENT_CATEGORIES[evt.category];

                          return (
                            <div
                              key={evt.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingEvent(evt);
                              }}
                              className="px-1.5 py-0.5 rounded-[4px] text-[11px] truncate flex items-center gap-1 font-medium transition-all hover:scale-[1.02] shadow-xs cursor-pointer"
                              style={{
                                backgroundColor: `${catInfo.color}20`,
                                color: catInfo.color,
                                borderLeft: `3px solid ${catInfo.color}`
                              }}
                              title={`${evt.startTime} - ${evt.title}`}
                            >
                              {!evt.isAllDay && (
                                <span className="text-[9px] font-mono opacity-80 shrink-0">
                                  {evt.startTime}
                                </span>
                              )}
                              <span className="truncate">{evt.title}</span>
                            </div>
                          );
                        })}

                        {dayEvents.length > 3 && (
                          <div className="text-[10px] font-semibold text-neutral-400 px-1">
                            +{dayEvents.length - 3} sự kiện nữa
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= 2. WEEK VIEW ================= */}
          {viewMode === 'week' && (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Week header row */}
              <div className="grid grid-cols-8 border-b border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] text-xs font-semibold py-2 shrink-0">
                <div className="text-center text-neutral-400">Giờ</div>
                {weekDays.map((d, i) => {
                  const dateStr = formatYMD(d);
                  const isToday = dateStr === '2026-10-17';
                  return (
                    <div key={i} className="text-center">
                      <div className="text-neutral-500 text-[11px]">{WEEKDAY_NAMES[i]}</div>
                      <div className={`font-bold text-sm ${isToday ? 'text-[#0078d4]' : ''}`}>
                        {d.getDate()}/{d.getMonth() + 1}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Hourly Grid */}
              <div className="flex-1 overflow-y-auto divide-y divide-black/10 dark:divide-white/10">
                {hoursList.map((hour) => (
                  <div key={hour} className="grid grid-cols-8 min-h-[52px] divide-x divide-black/10 dark:divide-white/10">
                    <div className="p-1 text-center text-[10px] text-neutral-400 font-mono">
                      {hour}
                    </div>

                    {weekDays.map((d, idx) => {
                      const dateStr = formatYMD(d);
                      const matchingEvents = filteredEvents.filter(
                        (e) => e.dateStr === dateStr && e.startTime.startsWith(hour.slice(0, 2))
                      );

                      return (
                        <div
                          key={idx}
                          onDoubleClick={() => {
                            setFormStartTime(hour);
                            openNewEventModal(dateStr);
                          }}
                          className="p-1 space-y-1 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] relative"
                        >
                          {matchingEvents.map((evt) => {
                            const cat = EVENT_CATEGORIES[evt.category];
                            return (
                              <div
                                key={evt.id}
                                onClick={() => setViewingEvent(evt)}
                                className="p-1 rounded-[4px] text-[10px] font-semibold truncate cursor-pointer shadow-xs border-l-2"
                                style={{
                                  backgroundColor: `${cat.color}25`,
                                  color: cat.color,
                                  borderColor: cat.color
                                }}
                              >
                                {evt.title}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= 3. DAY VIEW ================= */}
          {viewMode === 'day' && (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <div className="p-4 border-b border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                    {selectedDate.toLocaleDateString('vi-VN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Âm lịch: {getVietnameseLunarDate(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => openNewEventModal(formatYMD(selectedDate))}
                  className="px-3 py-1.5 rounded-[8px] bg-[#0078d4] text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm sự kiện hôm nay</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filteredEvents.filter((e) => e.dateStr === formatYMD(selectedDate)).length === 0 ? (
                  <div className="p-12 text-center text-neutral-400">
                    <CalendarDays className="w-10 h-10 mx-auto mb-2 text-neutral-300 dark:text-neutral-600 stroke-[1.25]" />
                    <p className="text-sm font-medium">Không có sự kiện nào trong ngày này</p>
                    <p className="text-xs mt-1">Nhấp đúp hoặc bấm nút Thêm sự kiện để tạo lịch mới.</p>
                  </div>
                ) : (
                  filteredEvents
                    .filter((e) => e.dateStr === formatYMD(selectedDate))
                    .map((evt) => {
                      const cat = EVENT_CATEGORIES[evt.category];

                      return (
                        <div
                          key={evt.id}
                          onClick={() => setViewingEvent(evt)}
                          className="p-4 rounded-[12px] bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 hover:border-[#0078d4] transition-all cursor-pointer flex items-start justify-between gap-4"
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className="w-3.5 h-3.5 rounded-full mt-1 shrink-0"
                              style={{ backgroundColor: cat.color }}
                            />
                            <div>
                              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                                {evt.title}
                              </h3>
                              <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>{evt.startTime} - {evt.endTime}</span>
                                </span>
                                {evt.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span>{evt.location}</span>
                                  </span>
                                )}
                              </div>
                              {evt.description && (
                                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">
                                  {evt.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <span
                            className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0"
                            style={{
                              backgroundColor: `${cat.color}20`,
                              color: cat.color
                            }}
                          >
                            {cat.label}
                          </span>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          )}

          {/* ================= 4. AGENDA / SCHEDULE VIEW ================= */}
          {viewMode === 'agenda' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
                <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                  Lịch trình sắp tới ({filteredEvents.length} sự kiện)
                </h2>
                <button
                  type="button"
                  onClick={() => openNewEventModal()}
                  className="px-3 py-1.5 rounded-[8px] bg-[#0078d4] text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm sự kiện mới</span>
                </button>
              </div>

              {filteredEvents.length === 0 ? (
                <div className="p-12 text-center text-neutral-400">
                  <List className="w-10 h-10 mx-auto mb-2 text-neutral-300 stroke-[1.25]" />
                  <p className="text-sm">Không tìm thấy sự kiện nào phù hợp</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEvents
                    .slice()
                    .sort((a, b) => a.dateStr.localeCompare(b.dateStr) || a.startTime.localeCompare(b.startTime))
                    .map((evt) => {
                      const cat = EVENT_CATEGORIES[evt.category];

                      return (
                        <div
                          key={evt.id}
                          onClick={() => setViewingEvent(evt)}
                          className="p-4 rounded-[12px] bg-black/[0.02] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 hover:border-[#0078d4] transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-16 text-center shrink-0">
                              <div className="text-xs font-bold text-neutral-900 dark:text-white">
                                {evt.dateStr.split('-')[2]}/{evt.dateStr.split('-')[1]}
                              </div>
                              <div className="text-[10px] text-neutral-400 font-mono">
                                {evt.startTime}
                              </div>
                            </div>

                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                                {evt.title}
                              </h4>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 mt-1">
                                {evt.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-[#0078d4]" />
                                    <span>{evt.location}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            <span
                              className="text-xs font-semibold px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: `${cat.color}20`,
                                color: cat.color
                              }}
                            >
                              {cat.label}
                            </span>
                            {evt.channelId && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate?.(`/live-tv?channel=${evt.channelId}`);
                                }}
                                className="px-2 py-1 rounded-[6px] bg-[#d83b01] text-white text-[11px] font-semibold flex items-center gap-1 hover:bg-[#d83b01]/90"
                              >
                                <Tv className="w-3 h-3" />
                                <span>Xem Live</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ================= MODAL: NEW / EDIT EVENT ================= */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#24272e] rounded-[16px] border border-black/10 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
            <div className="h-12 px-5 border-b border-black/10 dark:border-white/10 flex items-center justify-between shrink-0 bg-black/[0.02] dark:bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#0078d4] dark:text-[#4cc2ff]" />
                <span className="text-sm font-bold text-neutral-900 dark:text-white">
                  {editingEvent ? 'Chỉnh sửa sự kiện' : 'Thêm sự kiện mới (New Event)'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsEventModalOpen(false)}
                className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-neutral-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="p-5 space-y-4 overflow-y-auto text-xs">
              {/* Event Title */}
              <div>
                <label className="block text-neutral-500 font-medium mb-1">Tiêu đề sự kiện *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ví dụ: Thời sự 19h VTV1 HD, Họp phòng ban..."
                  className="w-full h-9 px-3 rounded-[8px] bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0078d4]"
                />
              </div>

              {/* Category Picker */}
              <div>
                <label className="block text-neutral-500 font-medium mb-1.5">Phân loại / Màu sắc</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(EVENT_CATEGORIES).map(([key, cat]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFormCategory(key as any)}
                      className={`h-8 px-2.5 rounded-[6px] border flex items-center gap-2 text-left font-medium transition-colors ${
                        formCategory === key
                          ? 'border-[#0078d4] bg-[#0078d4]/10 text-[#0078d4] dark:text-[#4cc2ff] font-bold'
                          : 'border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:bg-black/5'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="truncate">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & All Day */}
              <div className="grid grid-cols-2 gap-3 items-end">
                <div>
                  <label className="block text-neutral-500 font-medium mb-1">Ngày sự kiện</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full h-9 px-3 rounded-[8px] bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0078d4]"
                  />
                </div>
                <label className="flex items-center gap-2 h-9 cursor-pointer pb-2">
                  <input
                    type="checkbox"
                    checked={formIsAllDay}
                    onChange={(e) => setFormIsAllDay(e.target.checked)}
                    className="rounded text-[#0078d4] focus:ring-[#0078d4]"
                  />
                  <span className="text-neutral-700 dark:text-neutral-300 font-medium">Sự kiện cả ngày</span>
                </label>
              </div>

              {/* Time slots (if not all day) */}
              {!formIsAllDay && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-500 font-medium mb-1">Giờ bắt đầu</label>
                    <input
                      type="time"
                      value={formStartTime}
                      onChange={(e) => setFormStartTime(e.target.value)}
                      className="w-full h-9 px-3 rounded-[8px] bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-neutral-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-500 font-medium mb-1">Giờ kết thúc</label>
                    <input
                      type="time"
                      value={formEndTime}
                      onChange={(e) => setFormEndTime(e.target.value)}
                      className="w-full h-9 px-3 rounded-[8px] bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-neutral-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Location & TV Channel Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-500 font-medium mb-1">Địa điểm</label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="Phòng họp, quán cafe, online..."
                    className="w-full h-9 px-3 rounded-[8px] bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-neutral-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-500 font-medium mb-1">Kênh TV liên kết (tùy chọn)</label>
                  <select
                    value={formChannelId}
                    onChange={(e) => setFormChannelId(e.target.value)}
                    className="w-full h-9 px-3 rounded-[8px] bg-white dark:bg-[#1a1c20] border border-black/10 dark:border-white/10 text-neutral-900 dark:text-white focus:outline-none"
                  >
                    <option value="">Không liên kết kênh</option>
                    {CHANNELS_DATA.slice(0, 15).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-neutral-500 font-medium mb-1">Mô tả / Ghi chú</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Thêm thông tin chi tiết, link tài liệu hoặc ghi chú..."
                  className="w-full p-2.5 rounded-[8px] bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-neutral-900 dark:text-white focus:outline-none resize-none"
                />
              </div>

              {/* Reminder minutes */}
              <div>
                <label className="block text-neutral-500 font-medium mb-1">Nhắc nhở trước</label>
                <select
                  value={formReminder}
                  onChange={(e) => setFormReminder(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded-[8px] bg-white dark:bg-[#1a1c20] border border-black/10 dark:border-white/10 text-neutral-900 dark:text-white focus:outline-none"
                >
                  <option value={0}>Không nhắc nhở</option>
                  <option value={10}>10 phút trước</option>
                  <option value={15}>15 phút trước</option>
                  <option value={30}>30 phút trước</option>
                  <option value={60}>1 giờ trước</option>
                  <option value={1440}>1 ngày trước</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="h-9 px-3 rounded-[8px] border border-black/10 dark:border-white/10 hover:bg-black/5 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded-[8px] bg-[#0078d4] hover:bg-[#0067c0] text-white font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>{editingEvent ? 'Lưu thay đổi' : 'Tạo sự kiện'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: VIEW EVENT DETAILS ================= */}
      {viewingEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#24272e] rounded-[16px] border border-black/10 dark:border-white/10 shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0"
                  style={{ backgroundColor: EVENT_CATEGORIES[viewingEvent.category].color }}
                />
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${EVENT_CATEGORIES[viewingEvent.category].color}20`,
                    color: EVENT_CATEGORIES[viewingEvent.category].color
                  }}
                >
                  {EVENT_CATEGORIES[viewingEvent.category].label}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewingEvent(null)}
                className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-neutral-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white leading-snug">
                {viewingEvent.title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
                <CalendarIcon className="w-3.5 h-3.5 text-[#0078d4]" />
                <span>
                  {viewingEvent.dateStr} (
                  {viewingEvent.isAllDay
                    ? 'Cả ngày'
                    : `${viewingEvent.startTime} - ${viewingEvent.endTime}`}
                  )
                </span>
              </div>
            </div>

            {viewingEvent.location && (
              <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300">
                <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span>{viewingEvent.location}</span>
              </div>
            )}

            {viewingEvent.description && (
              <p className="text-xs text-neutral-600 dark:text-neutral-400 whitespace-pre-line leading-relaxed bg-black/[0.02] dark:bg-white/[0.02] p-3 rounded-[8px] border border-black/5 dark:border-white/5">
                {viewingEvent.description}
              </p>
            )}

            {viewingEvent.channelId && (
              <button
                type="button"
                onClick={() => {
                  setViewingEvent(null);
                  navigate?.(`/live-tv?channel=${viewingEvent.channelId}`);
                }}
                className="w-full h-9 rounded-[8px] bg-[#d83b01] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs hover:bg-[#d83b01]/90"
              >
                <Tv className="w-4 h-4" />
                <span>Xem trực tiếp trên Live TV</span>
              </button>
            )}

            <div className="pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleDeleteEvent(viewingEvent.id)}
                className="h-8 px-2.5 rounded-[6px] hover:bg-rose-500/10 text-rose-600 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa sự kiện</span>
              </button>

              <button
                type="button"
                onClick={() => openEditEventModal(viewingEvent)}
                className="h-8 px-3 rounded-[6px] bg-[#0078d4] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#0067c0]"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Chỉnh sửa</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
