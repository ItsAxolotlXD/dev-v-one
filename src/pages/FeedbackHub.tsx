import React, { useState, useEffect, useMemo } from 'react';
import { 
  MessageSquare, 
  ThumbsUp, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Lightbulb, 
  Send, 
  Sparkles, 
  ChevronRight, 
  X, 
  Paperclip, 
  Camera, 
  ShieldCheck, 
  User, 
  MessageCircle,
  TrendingUp,
  Share2,
  Check
} from 'lucide-react';
import { FluentFeedbackHubIcon, FluentFeedbackHubColorIcon, FluentSearchIcon } from '../components/FluentIcons';

interface FeedbackItem {
  id: string;
  type: 'problem' | 'suggestion';
  title: string;
  description: string;
  category: 'Apps & Tools' | 'Live TV & Streaming' | 'Fluent Design & Mica' | 'Performance & Crash' | 'Audio & Video';
  upvotes: number;
  hasUpvoted?: boolean;
  status: 'investigating' | 'received' | 'resolved';
  author: string;
  date: string;
  commentsCount: number;
  officialResponse?: string;
  severity?: 'low' | 'medium' | 'high' | 'blocker';
}

const DEFAULT_FEEDBACKS: FeedbackItem[] = [
  {
    id: 'fb-1',
    type: 'suggestion',
    title: 'Hỗ trợ thêm tùy chọn Insider Flags "WebView SDK Test Preview" để đổi nền màu xám tối',
    description: 'Mong muốn có thêm flag thử nghiệm WebView SDK để giao diện main tab page, thanh bên và thanh trên cùng hiển thị tông màu xám tối chuẩn WebView desktop hiện đại.',
    category: 'Fluent Design & Mica',
    upvotes: 142,
    hasUpvoted: true,
    status: 'resolved',
    author: 'hoangnam.dev',
    date: '15/10/2026',
    commentsCount: 18,
    officialResponse: 'Đội ngũ phát triển Sparkle (Dev) đã hoàn thiện và đưa tính năng này vào bản cập nhật mới nhất!',
    severity: 'medium'
  },
  {
    id: 'fb-2',
    type: 'problem',
    title: 'Thêm ứng dụng Calculator tính toán khoa học và chuyển đổi tiền tệ VND/USD',
    description: 'Cần có ứng dụng máy tính đa năng tích hợp đầy đủ chế độ cơ bản, khoa học (sin, cos, tan, log) và bảng chuyển đổi đơn vị đo lường.',
    category: 'Apps & Tools',
    upvotes: 98,
    hasUpvoted: false,
    status: 'resolved',
    author: 'tuankhoi_vtv',
    date: '14/10/2026',
    commentsCount: 12,
    officialResponse: 'Đã phát hành tab Calculator chuẩn Fluent Design với đầy đủ các bộ tính toán và lưu lịch sử.',
    severity: 'low'
  },
  {
    id: 'fb-3',
    type: 'suggestion',
    title: 'Bổ sung công cụ Snipping Tool với con trỏ cắt màn hình chữ nhật và bút vẽ chú thích',
    description: 'Rất cần công cụ chụp nhanh màn hình Snipping Tool để cắt từng khung hình phóng sự thời sự và chú thích nhanh bằng bút dạ quang highlighter.',
    category: 'Apps & Tools',
    upvotes: 85,
    hasUpvoted: false,
    status: 'resolved',
    author: 'bichngoc.design',
    date: '14/10/2026',
    commentsCount: 9,
    officialResponse: 'Snipping Tool đã sẵn sàng với chế độ cắt tương tác trực tiếp và công cụ trích xuất văn bản OCR.',
    severity: 'low'
  },
  {
    id: 'fb-4',
    type: 'suggestion',
    title: 'Tăng cường tốc độ tải luồng HLS cho các kênh VTV1 HD và HTV7 HD trong giờ cao điểm',
    description: 'Các luồng phát sóng vào lúc 19h thời sự đôi khi cần bộ đệm nhanh hơn để chống giật hình khi kết nối mạng chập chờn.',
    category: 'Live TV & Streaming',
    upvotes: 64,
    hasUpvoted: false,
    status: 'investigating',
    author: 'quang_minh_news',
    date: '13/10/2026',
    commentsCount: 7,
    officialResponse: 'Kỹ sư hạ tầng mạng đang điều phối máy chủ CDN sao lưu để đảm bảo độ trễ thấp nhất.',
    severity: 'high'
  },
  {
    id: 'fb-5',
    type: 'suggestion',
    title: 'Hỗ trợ thêm tùy chọn xuất ghi chú ra file PDF và PowerPoint trong Notes App',
    description: 'Giao diện soạn thảo hiện tại rất mượt, hy vọng có thêm nút xuất trực tiếp sang slide thuyết trình PPTX.',
    category: 'Apps & Tools',
    upvotes: 47,
    hasUpvoted: false,
    status: 'received',
    author: 'linhdan.cute',
    date: '12/10/2026',
    commentsCount: 4,
    severity: 'medium'
  }
];

interface FeedbackHubProps {
  navigate?: (route: string) => void;
}

export const FeedbackHub: React.FC<FeedbackHubProps> = ({ navigate }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'feedback' | 'new'>('home');
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(() => {
    try {
      const saved = localStorage.getItem('vone_feedback_hub_items');
      return saved ? JSON.parse(saved) : DEFAULT_FEEDBACKS;
    } catch {
      return DEFAULT_FEEDBACKS;
    }
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<'all' | 'problem' | 'suggestion'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'trending' | 'upvotes' | 'recent'>('trending');

  // Selected item modal
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);

  // New feedback form state
  const [newType, setNewType] = useState<'problem' | 'suggestion'>('problem');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newCategory, setNewCategory] = useState<FeedbackItem['category']>('Apps & Tools');
  const [newSeverity, setNewSeverity] = useState<'low' | 'medium' | 'high' | 'blocker'>('medium');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    try {
      localStorage.setItem('vone_feedback_hub_items', JSON.stringify(feedbacks));
    } catch {}
  }, [feedbacks]);

  // Upvote toggle
  const toggleUpvote = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFeedbacks((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextState = !item.hasUpvoted;
          const nextCount = nextState ? item.upvotes + 1 : item.upvotes - 1;
          showToast(nextState ? 'Đã ủng hộ (Upvoted) phản hồi!' : 'Đã bỏ bình chọn');
          return { ...item, hasUpvoted: nextState, upvotes: nextCount };
        }
        return item;
      })
    );
  };

  // Submit feedback
  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) {
      showToast('Vui lòng điền đầy đủ tiêu đề và nội dung phản hồi.');
      return;
    }

    const newItem: FeedbackItem = {
      id: `fb-${Date.now()}`,
      type: newType,
      title: newTitle.trim(),
      description: newDesc.trim(),
      category: newCategory,
      upvotes: 1,
      hasUpvoted: true,
      status: 'received',
      author: 'Tôi (Người dùng hiện tại)',
      date: new Date().toLocaleDateString('vi-VN'),
      commentsCount: 0,
      severity: newSeverity,
      officialResponse: 'Cảm ơn bạn đã đóng góp! Đội ngũ phát triển Sparkle (Dev) đã tiếp nhận phản hồi của bạn.'
    };

    setFeedbacks([newItem, ...feedbacks]);
    setNewTitle('');
    setNewDesc('');
    setActiveTab('feedback');
    showToast('Phản hồi của bạn đã được gửi thành công đến đội ngũ kỹ sư!');
  };

  // Filtered & Sorted Feedbacks
  const filteredFeedbacks = useMemo(() => {
    return feedbacks
      .filter((item) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q);

        const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
        const matchesType = typeFilter === 'all' || item.type === typeFilter;
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

        return matchesQuery && matchesCategory && matchesType && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'upvotes') return b.upvotes - a.upvotes;
        if (sortBy === 'recent') return parseInt(b.id.replace('fb-', '') || '0') - parseInt(a.id.replace('fb-', '') || '0');
        return b.upvotes * 1.5 + b.commentsCount - (a.upvotes * 1.5 + a.commentsCount);
      });
  }, [feedbacks, searchQuery, categoryFilter, typeFilter, statusFilter, sortBy]);

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex flex-col bg-[#f9f9f9] dark:bg-[#1a1c20] text-black dark:text-white select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 px-4 py-2 rounded-full bg-black/90 dark:bg-white/95 text-white dark:text-black text-xs font-semibold shadow-2xl flex items-center gap-2 border border-white/20 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Application Ribbon Header */}
      <div className="bg-white dark:bg-[#22252a] border-b border-black/10 dark:border-white/10 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <FluentFeedbackHubColorIcon className="w-8 h-8 shrink-0 drop-shadow-sm" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
                Feedback Hub (Trung tâm phản hồi)
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-[#0078d4]/15 text-[#0078d4] dark:text-[#4cc2ff] text-[10px] font-bold uppercase tracking-wider">
                Insider Preview
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Cầu nối trực tiếp giữa người dùng và đội ngũ phát triển Sparkle (Dev) & Fluent Design
            </p>
          </div>
        </div>

        {/* Action Tabs */}
        <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/10 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'bg-white dark:bg-[#2e3238] text-[#0078d4] dark:text-[#4cc2ff] shadow-xs'
                : 'text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white'
            }`}
          >
            Trang chủ
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('feedback')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'feedback'
                ? 'bg-white dark:bg-[#2e3238] text-[#0078d4] dark:text-[#4cc2ff] shadow-xs'
                : 'text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white'
            }`}
          >
            Xem phản hồi ({feedbacks.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('new')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'new'
                ? 'bg-[#0078d4] text-white shadow-xs'
                : 'bg-[#0078d4]/15 text-[#0078d4] dark:text-[#4cc2ff] hover:bg-[#0078d4]/25'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Gửi phản hồi mới</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6 space-y-6">
        {/* TAB 1: HOME OVERVIEW */}
        {activeTab === 'home' && (
          <div className="space-y-6 animate-fade-in">
            {/* Hero Welcome Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0078d4]/15 via-[#8764b8]/10 to-transparent border border-[#0078d4]/20 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0078d4]/20 text-[#0078d4] dark:text-[#4cc2ff] text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Xây dựng Sparkle (Dev) cùng cộng đồng</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Ý kiến của bạn giúp chúng tôi hoàn thiện ứng dụng tốt hơn mỗi ngày
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  Gửi báo cáo sự cố kỹ thuật, đóng góp ý tưởng tính năng mới, hoặc bình chọn cho các đề xuất mà bạn yêu thích. Các kỹ sư của chúng tôi luôn lắng nghe và phản hồi trực tiếp.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setNewType('problem');
                    setActiveTab('new');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Báo cáo sự cố</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewType('suggestion');
                    setActiveTab('new');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#0078d4] hover:bg-[#006cbd] text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
                >
                  <Lightbulb className="w-4 h-4" />
                  <span>Đề xuất tính năng</span>
                </button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white dark:bg-[#23272d] border border-black/10 dark:border-white/10 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500 font-semibold">Tổng số phản hồi</span>
                  <MessageSquare className="w-4 h-4 text-[#0078d4]" />
                </div>
                <div className="text-2xl font-bold mt-2">{feedbacks.length}</div>
                <span className="text-[11px] text-emerald-500 font-medium">100% được tiếp nhận</span>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-[#23272d] border border-black/10 dark:border-white/10 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500 font-semibold">Đã khắc phục & Phát hành</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-bold mt-2">
                  {feedbacks.filter((f) => f.status === 'resolved').length}
                </div>
                <span className="text-[11px] text-neutral-500 font-medium">Bao gồm WebView SDK, Calculator, Snipping Tool</span>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-[#23272d] border border-black/10 dark:border-white/10 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500 font-semibold">Lượt ủng hộ cộng đồng</span>
                  <ThumbsUp className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-bold mt-2">
                  {feedbacks.reduce((acc, f) => acc + f.upvotes, 0)}
                </div>
                <span className="text-[11px] text-amber-500 font-medium">Tương tác sôi nổi</span>
              </div>
            </div>

            {/* Top Trending Feedback Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#0078d4]" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Phản hồi thịnh hành nhất</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('feedback')}
                  className="text-xs text-[#0078d4] dark:text-[#4cc2ff] hover:underline font-semibold"
                >
                  Xem tất cả ({feedbacks.length}) →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {feedbacks.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedFeedback(item)}
                    className="p-4 rounded-xl bg-white dark:bg-[#23272d] border border-black/10 dark:border-white/10 hover:border-[#0078d4]/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          item.type === 'problem' ? 'bg-rose-500/15 text-rose-500' : 'bg-emerald-500/15 text-emerald-500'
                        }`}>
                          {item.type === 'problem' ? 'Sự cố' : 'Đề xuất'}
                        </span>
                        <span className="text-[11px] text-neutral-400 font-medium">{item.category}</span>
                      </div>
                      <h4 className="text-sm font-bold text-neutral-900 dark:text-white line-clamp-1">{item.title}</h4>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-black/5 dark:border-white/5 text-xs text-neutral-400">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5" />
                        <span>{item.author}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => toggleUpvote(item.id, e)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                          item.hasUpvoted
                            ? 'bg-[#0078d4] text-white'
                            : 'bg-black/5 dark:bg-white/10 text-neutral-700 dark:text-neutral-200 hover:bg-black/10'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{item.upvotes}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BROWSE FEEDBACKS */}
        {activeTab === 'feedback' && (
          <div className="space-y-4 animate-fade-in">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm Kiếm Phản Hồi, Sự Cố Hoặc Ý Tưởng..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-[#23272d] border border-black/10 dark:border-white/10 text-xs outline-none focus:border-[#0078d4]"
                />
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              </div>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-[#23272d] border border-black/10 dark:border-white/10 text-xs font-semibold outline-none cursor-pointer"
              >
                <option value="All">Tất cả danh mục</option>
                <option value="Apps & Tools">Apps & Tools</option>
                <option value="Live TV & Streaming">Live TV & Streaming</option>
                <option value="Fluent Design & Mica">Fluent Design & Mica</option>
                <option value="Performance & Crash">Performance & Crash</option>
                <option value="Audio & Video">Audio & Video</option>
              </select>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-[#23272d] border border-black/10 dark:border-white/10 text-xs font-semibold outline-none cursor-pointer"
              >
                <option value="all">Tất cả loại</option>
                <option value="problem">Chỉ sự cố</option>
                <option value="suggestion">Chỉ đề xuất</option>
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-[#23272d] border border-black/10 dark:border-white/10 text-xs font-semibold outline-none cursor-pointer"
              >
                <option value="trending">Thịnh hành</option>
                <option value="upvotes">Nhiều vote nhất</option>
                <option value="recent">Mới nhất</option>
              </select>
            </div>

            {/* Feedback List */}
            <div className="space-y-3">
              {filteredFeedbacks.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-[#23272d] rounded-2xl border border-black/10 dark:border-white/10">
                  <p className="text-sm font-semibold text-neutral-500">Không tìm thấy phản hồi nào phù hợp</p>
                </div>
              ) : (
                filteredFeedbacks.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedFeedback(item)}
                    className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#23272d] border border-black/10 dark:border-white/10 hover:border-[#0078d4]/40 hover:shadow-md transition-all cursor-pointer flex items-start justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          item.type === 'problem' ? 'bg-rose-500/15 text-rose-500' : 'bg-emerald-500/15 text-emerald-500'
                        }`}>
                          {item.type === 'problem' ? 'Sự cố' : 'Đề xuất'}
                        </span>

                        <span className="text-[11px] px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 font-semibold text-neutral-500">
                          {item.category}
                        </span>

                        {item.status === 'resolved' && (
                          <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Đã khắc phục</span>
                          </span>
                        )}
                        {item.status === 'investigating' && (
                          <span className="flex items-center gap-1 text-[11px] text-amber-500 font-bold">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Đang điều tra</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white leading-snug">
                        {item.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      {item.officialResponse && (
                        <div className="p-2.5 rounded-xl bg-[#0078d4]/10 border border-[#0078d4]/20 text-xs text-[#0078d4] dark:text-[#4cc2ff] flex items-start gap-2 mt-2">
                          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Kỹ sư Microsoft Sparkle Team: </span>
                            <span>{item.officialResponse}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-neutral-400 pt-1">
                        <span>Đăng bởi {item.author}</span>
                        <span>•</span>
                        <span>{item.date}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{item.commentsCount} phản hồi</span>
                        </span>
                      </div>
                    </div>

                    {/* Upvote Button Column */}
                    <div className="flex flex-col items-center shrink-0">
                      <button
                        type="button"
                        onClick={(e) => toggleUpvote(item.id, e)}
                        className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all cursor-pointer ${
                          item.hasUpvoted
                            ? 'bg-[#0078d4] text-white shadow-md scale-105'
                            : 'bg-black/5 dark:bg-white/10 hover:bg-black/10 text-neutral-700 dark:text-neutral-200'
                        }`}
                      >
                        <ThumbsUp className="w-5 h-5 mb-0.5" />
                        <span className="text-xs font-bold font-mono">{item.upvotes}</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SUBMIT NEW FEEDBACK */}
        {activeTab === 'new' && (
          <div className="max-w-2xl mx-auto bg-white dark:bg-[#23272d] border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-xl animate-fade-in space-y-5">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Gửi phản hồi cho nhóm phát triển</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Mô tả chi tiết sự cố hoặc ý tưởng của bạn để chúng tôi có thể tái hiện và hỗ trợ nhanh chóng nhất.
              </p>
            </div>

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setNewType('problem')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                    newType === 'problem'
                      ? 'border-rose-500 bg-rose-500/10 text-rose-500 ring-2 ring-rose-500/20'
                      : 'border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-300'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Báo cáo sự cố (Problem)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNewType('suggestion')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                    newType === 'suggestion'
                      ? 'border-[#0078d4] bg-[#0078d4]/10 text-[#0078d4] dark:text-[#4cc2ff] ring-2 ring-[#0078d4]/20'
                      : 'border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-300'
                  }`}
                >
                  <Lightbulb className="w-4 h-4" />
                  <span>Đề xuất tính năng (Suggestion)</span>
                </button>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Tóm tắt phản hồi (Tiêu đề):
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ví dụ: Cần thêm tính năng xem lại EPG 7 ngày trước..."
                  className="w-full px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-medium outline-none focus:border-[#0078d4]"
                />
              </div>

              {/* Category & Severity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Danh mục:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-medium outline-none"
                  >
                    <option value="Apps & Tools">Apps & Tools</option>
                    <option value="Live TV & Streaming">Live TV & Streaming</option>
                    <option value="Fluent Design & Mica">Fluent Design & Mica</option>
                    <option value="Performance & Crash">Performance & Crash</option>
                    <option value="Audio & Video">Audio & Video</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Mức độ ảnh hưởng:</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-medium outline-none"
                  >
                    <option value="low">Thấp (Góp ý nhỏ)</option>
                    <option value="medium">Trung bình (Bất tiện)</option>
                    <option value="high">Cao (Lỗi chức năng quan trọng)</option>
                    <option value="blocker">Nghiêm trọng (Ứng dụng bị sập)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Mô tả chi tiết và các bước tái hiện:
                </label>
                <textarea
                  required
                  rows={5}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Hãy giải thích cụ thể điều gì đã xảy ra hoặc tính năng này sẽ hoạt động như thế nào..."
                  className="w-full p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs outline-none focus:border-[#0078d4] resize-none leading-relaxed"
                />
              </div>

              {/* Attach Screenshot via Snipping Tool */}
              <div className="p-3.5 rounded-xl bg-black/5 dark:bg-white/5 border border-dashed border-black/20 dark:border-white/20 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <Camera className="w-4 h-4 text-[#0078d4]" />
                  <span>Đính kèm ảnh chụp màn hình minh họa</span>
                </div>
                {navigate && (
                  <button
                    type="button"
                    onClick={() => navigate('/snipping-tool')}
                    className="px-3 py-1.5 rounded-lg bg-[#0078d4]/15 text-[#0078d4] dark:text-[#4cc2ff] text-xs font-semibold hover:bg-[#0078d4]/25 cursor-pointer"
                  >
                    Mở Snipping Tool
                  </button>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('feedback')}
                  className="px-4 py-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#0078d4] hover:bg-[#006cbd] text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi phản hồi</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Detail Modal Dialog */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white dark:bg-[#23272d] border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-2xl animate-fade-in space-y-4">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-black/10 dark:border-white/10">
              <div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  selectedFeedback.type === 'problem' ? 'bg-rose-500/15 text-rose-500' : 'bg-emerald-500/15 text-emerald-500'
                }`}>
                  {selectedFeedback.type === 'problem' ? 'Sự cố kỹ thuật' : 'Đề xuất cải tiến'}
                </span>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white mt-2">
                  {selectedFeedback.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFeedback(null)}
                className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-neutral-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
              {selectedFeedback.description}
            </p>

            {selectedFeedback.officialResponse && (
              <div className="p-3.5 rounded-xl bg-[#0078d4]/10 border border-[#0078d4]/20 text-xs text-[#0078d4] dark:text-[#4cc2ff]">
                <div className="font-bold mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Phản hồi chính thức từ Kỹ sư Microsoft Sparkle:</span>
                </div>
                <p className="leading-relaxed">{selectedFeedback.officialResponse}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-black/10 dark:border-white/10 text-xs">
              <span className="text-neutral-400">Đăng bởi {selectedFeedback.author} • {selectedFeedback.date}</span>
              <button
                type="button"
                onClick={() => toggleUpvote(selectedFeedback.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  selectedFeedback.hasUpvoted
                    ? 'bg-[#0078d4] text-white shadow-md'
                    : 'bg-black/5 dark:bg-white/10 text-neutral-700 dark:text-neutral-200'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span>Ủng hộ ({selectedFeedback.upvotes})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
