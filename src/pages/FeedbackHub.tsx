import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Lightbulb,
  Bug,
  Image as ImageIcon,
  Paperclip,
  Star,
  Send,
  Clock,
  X,
  Check,
  Trash2,
  FileText,
  ThumbsUp,
  Users,
  ShieldCheck,
  MessageCircle,
  Filter
} from 'lucide-react';
import { logRecallActivity } from '../services/recallService';
import { FluentSearchIcon } from '../components/FluentIcons';
import {
  COMMUNITY_FEEDBACKS_DATA,
  type CommunityFeedbackItem,
} from '../data/communityFeedbacks';

export type { CommunityFeedbackItem };

export interface FeedbackSubmission {
  id: string;
  type: 'suggestion' | 'bug';
  heading: string;
  email: string;
  details: string;
  rating: number; // 1 to 5
  saveLocalDiagnostics: boolean;
  diagnostics?: {
    userAgent: string;
    screenResolution: string;
    timestamp: string;
    route: string;
  };
  attachments: {
    name: string;
    size: string;
    type: 'media' | 'file';
    previewUrl?: string;
  }[];
  createdAt: string;
  upvotes: number;
  hasUpvoted?: boolean;
  status: 'received' | 'investigating' | 'resolved';
}

const STORAGE_KEY = 'vone_feedback_hub_submissions_v2';
const COMMUNITY_STORAGE_KEY = 'vone_feedback_hub_community_v2';

interface FeedbackHubProps {
  navigate?: (route: string) => void;
}

export const FeedbackHub: React.FC<FeedbackHubProps> = ({ navigate }) => {
  // Tabs: 'suggestion' | 'bug' | 'community'
  const [activeTab, setActiveTab] = useState<'suggestion' | 'bug' | 'community'>('suggestion');

  // Form Fields matching user image layout
  const [heading, setHeading] = useState('');
  const [email, setEmail] = useState('');
  const [details, setDetails] = useState('');
  const [attachments, setAttachments] = useState<FeedbackSubmission['attachments']>([]);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [saveLocalCopy, setSaveLocalCopy] = useState<boolean>(true);

  // Submissions list
  const [submissions, setSubmissions] = useState<FeedbackSubmission[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Community feedback items list (initialized with 100 diverse community feedbacks)
  const [communityFeedbacks, setCommunityFeedbacks] = useState<CommunityFeedbackItem[]>(() => {
    try {
      const saved = localStorage.getItem(COMMUNITY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 100) {
          return parsed;
        }
      }
    } catch {}
    return COMMUNITY_FEEDBACKS_DATA;
  });

  // Community search and filter state
  const [communitySearch, setCommunitySearch] = useState('');
  const [communityCategory, setCommunityCategory] = useState<string>('All');
  const [communityStatus, setCommunityStatus] = useState<string>('all');

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Hidden file inputs
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 3200);
  };

  // Sync submissions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
    } catch {}
  }, [submissions]);

  // Sync community feedbacks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(communityFeedbacks));
    } catch {}
  }, [communityFeedbacks]);

  // Log to Recall activity
  useEffect(() => {
    const subtitleMap = {
      suggestion: 'Feature Suggestion Portal',
      bug: 'Bugs Report Portal',
      community: 'Community Feedback Portal'
    };
    logRecallActivity({
      type: 'tab',
      appName: 'Feedback Hub',
      appId: 'feedback-hub',
      title: 'Feedback Hub - Sparkle (Dev)',
      subtitle: subtitleMap[activeTab],
      durationText: 'You spent < 1m on this activity recently',
      badgeText: 'Feedback Hub',
      thumbnail: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-7bX9C6ZMjpXAbn0eXLI2Wk6ZhwUwk0.png',
      route: '/feedback-hub',
      searchKeywords: 'feedback hub bug report feature suggestion community feedback sparkle dev'.toLowerCase()
    });
  }, [activeTab]);

  // File handling helpers
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: FeedbackSubmission['attachments'] = [];
    (Array.from(files) as File[]).forEach((file: File) => {
      const isImg = file.type.startsWith('image/');
      const previewUrl = isImg ? URL.createObjectURL(file) : undefined;
      newAttachments.push({
        name: file.name,
        size: formatFileSize(file.size),
        type: 'media',
        previewUrl
      });
    });

    setAttachments((prev) => [...prev, ...newAttachments]);
    showToast(`Đã đính kèm ${newAttachments.length} tệp đa phương tiện`);
    if (mediaInputRef.current) mediaInputRef.current.value = '';
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: FeedbackSubmission['attachments'] = [];
    (Array.from(files) as File[]).forEach((file: File) => {
      newAttachments.push({
        name: file.name,
        size: formatFileSize(file.size),
        type: 'file'
      });
    });

    setAttachments((prev) => [...prev, ...newAttachments]);
    showToast(`Đã đính kèm ${newAttachments.length} tệp tài liệu`);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!heading.trim()) {
      showToast('Vui lòng nhập tóm tắt phản hồi (Heading)');
      return;
    }
    if (!details.trim()) {
      showToast('Vui lòng nhập chi tiết phản hồi (Details)');
      return;
    }

    const newSubmission: FeedbackSubmission = {
      id: `fb-${Date.now()}`,
      type: activeTab === 'bug' ? 'bug' : 'suggestion',
      heading: heading.trim(),
      email: email.trim(),
      details: details.trim(),
      rating,
      saveLocalDiagnostics: saveLocalCopy,
      diagnostics: saveLocalCopy
        ? {
            userAgent: navigator.userAgent,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            timestamp: new Date().toISOString(),
            route: window.location.pathname
          }
        : undefined,
      attachments: [...attachments],
      createdAt: new Date().toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      upvotes: 1,
      hasUpvoted: true,
      status: 'received'
    };

    setSubmissions((prev) => [newSubmission, ...prev]);

    // Also share into community feed so others can see it
    const newCommunityItem: CommunityFeedbackItem = {
      id: `cf-${Date.now()}`,
      type: activeTab === 'bug' ? 'problem' : 'suggestion',
      title: heading.trim(),
      description: details.trim(),
      category: 'Apps & Tools',
      upvotes: 1,
      hasUpvoted: true,
      status: 'received',
      author: email.trim() || 'Người dùng hiện tại',
      date: new Date().toLocaleDateString('vi-VN'),
      commentsCount: 0,
      officialResponse: 'Đội ngũ phát triển Sparkle (Dev) đã tiếp nhận phản hồi của bạn.'
    };
    setCommunityFeedbacks((prev) => [newCommunityItem, ...prev]);

    // Reset Form
    setHeading('');
    setEmail('');
    setDetails('');
    setAttachments([]);
    setRating(5);

    showToast('Phản hồi của bạn đã được gửi thành công!');
  };

  const handleDeleteSubmission = (id: string) => {
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
    showToast('Đã xóa phản hồi');
  };

  const handleToggleUpvote = (id: string) => {
    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextUpvoted = !s.hasUpvoted;
          return {
            ...s,
            hasUpvoted: nextUpvoted,
            upvotes: nextUpvoted ? s.upvotes + 1 : s.upvotes - 1
          };
        }
        return s;
      })
    );
  };

  const handleToggleCommunityUpvote = (id: string) => {
    setCommunityFeedbacks((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextUpvoted = !item.hasUpvoted;
          showToast(nextUpvoted ? 'Đã ủng hộ đề xuất cộng đồng!' : 'Đã bỏ bình chọn');
          return {
            ...item,
            hasUpvoted: nextUpvoted,
            upvotes: nextUpvoted ? item.upvotes + 1 : item.upvotes - 1
          };
        }
        return item;
      })
    );
  };

  // Filtered Community Feedbacks
  const filteredCommunity = useMemo(() => {
    return communityFeedbacks.filter((item) => {
      const q = communitySearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.author.toLowerCase().includes(q);

      const matchesCat = communityCategory === 'All' || item.category === communityCategory;
      const matchesStatus = communityStatus === 'all' || item.status === communityStatus;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [communityFeedbacks, communitySearch, communityCategory, communityStatus]);

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex flex-col bg-[#1a1a1a] dark:bg-[#1a1a1a] text-[#F3F4F6] select-none font-sans relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 px-4 py-2 rounded-none bg-[#262626] text-white text-xs font-normal shadow-2xl flex items-center gap-2 border border-white/20 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={mediaInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={handleMediaUpload}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="*/*"
        multiple
        className="hidden"
        onChange={handleFileUpload}
      />

      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6 space-y-5">
        {/* Tab Title: Feedback Hub with position and font regular (400) like tab Settings */}
        <div className="pt-1 sm:pt-2 pb-1">
          <h1
            className="text-2xl sm:text-3xl font-normal text-white tracking-tight"
            style={{ fontWeight: 400, fontFamily: "'Segoe UI', 'Segoe UI Variable Text', system-ui, sans-serif" }}
          >
            Feedback Hub
          </h1>
        </div>

        {/* Top Navigation Tabs: Feature Suggestion vs Bugs Report vs Community Feedback */}
        <div className="flex items-center gap-6 sm:gap-8 pt-1 border-b border-white/10 pb-2">
          {/* Feature Suggestion Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('suggestion')}
            className={`group relative flex items-center gap-2 pb-2 text-sm sm:text-base font-normal transition-colors cursor-pointer ${
              activeTab === 'suggestion'
                ? 'text-white'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Lightbulb
              className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-colors ${
                activeTab === 'suggestion' ? 'text-[#ff2bbd]' : 'text-neutral-400 group-hover:text-neutral-200'
              }`}
            />
            <span>Feature Suggestion</span>

            {/* Active Indicator Bar */}
            {activeTab === 'suggestion' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#ff2bbd] rounded-none shadow-[0_0_8px_#ff2bbd]" />
            )}
          </button>

          {/* Bugs Report Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('bug')}
            className={`group relative flex items-center gap-2 pb-2 text-sm sm:text-base font-normal transition-colors cursor-pointer ${
              activeTab === 'bug'
                ? 'text-white'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Bug
              className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-colors ${
                activeTab === 'bug' ? 'text-[#ff2bbd]' : 'text-neutral-400 group-hover:text-neutral-200'
              }`}
            />
            <span>Bugs Report</span>

            {/* Active Indicator Bar */}
            {activeTab === 'bug' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#ff2bbd] rounded-none shadow-[0_0_8px_#ff2bbd]" />
            )}
          </button>

          {/* Community Feedback Tab (newly added next to Bugs Report) */}
          <button
            type="button"
            onClick={() => setActiveTab('community')}
            className={`group relative flex items-center gap-2 pb-2 text-sm sm:text-base font-normal transition-colors cursor-pointer ${
              activeTab === 'community'
                ? 'text-white'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Users
              className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-colors ${
                activeTab === 'community' ? 'text-[#ff2bbd]' : 'text-neutral-400 group-hover:text-neutral-200'
              }`}
            />
            <span>Community Feedback</span>

            {/* Active Indicator Bar */}
            {activeTab === 'community' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#ff2bbd] rounded-none shadow-[0_0_8px_#ff2bbd]" />
            )}
          </button>
        </div>

        {/* TAB 1 & 2: SUGGESTION & BUG FORM VIEW */}
        {(activeTab === 'suggestion' || activeTab === 'bug') && (
          <>
            {/* Main Form Block (No background on the main Suggestion block, seamless with gray background) */}
            <div className="bg-transparent border-0 shadow-none p-0 space-y-5">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Field 1: Heading * (Search box style, no search icon) */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-normal text-neutral-200 flex items-center gap-1">
                    <span>Heading</span>
                    <span className="text-[#ff2bbd]">*</span>
                  </label>
                  <div className="windows-search-box w-full rounded-none px-3 py-1.5 flex items-center transition-all">
                    <input
                      type="text"
                      required
                      value={heading}
                      onChange={(e) => setHeading(e.target.value)}
                      placeholder={activeTab === 'bug' ? 'Summarize the bug issue' : 'Summarize your feedback'}
                      className="w-full bg-transparent text-xs sm:text-[13.5px] text-neutral-100 placeholder:text-[#a6a6a6] outline-none border-none py-1 no-fluent-line"
                    />
                  </div>
                </div>

                {/* Field 2: Email (Search box style, no search icon) */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-normal text-neutral-200">
                    Email
                  </label>
                  <div className="windows-search-box w-full rounded-none px-3 py-1.5 flex items-center transition-all">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Replies will return to your email"
                      className="w-full bg-transparent text-xs sm:text-[13.5px] text-neutral-100 placeholder:text-[#a6a6a6] outline-none border-none py-1 no-fluent-line"
                    />
                  </div>
                </div>

                {/* Field 3: Details * (Search box style, no search icon) */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-normal text-neutral-200 flex items-center gap-1">
                    <span>Details</span>
                    <span className="text-[#ff2bbd]">*</span>
                  </label>
                  <div className="windows-search-box w-full rounded-none p-2.5 transition-all">
                    <textarea
                      required
                      rows={5}
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      placeholder={activeTab === 'bug' ? 'Explain the bug and steps to reproduce' : 'Write and explain your feedback in more details'}
                      className="w-full bg-transparent text-xs sm:text-[13.5px] text-neutral-100 placeholder:text-[#a6a6a6] outline-none border-none resize-y leading-relaxed no-fluent-line"
                    />
                  </div>
                </div>

                {/* Field 4: Attachments (optional) - Buttons styled with sharp corner matching modal dialog "Delete these files" */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-normal text-neutral-200">
                    Attachments (optional)
                  </label>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => mediaInputRef.current?.click()}
                      className="fluent-btn-secondary min-w-[100px] h-[32px] px-4 bg-[#cccccc] dark:bg-[#383838] text-black dark:text-white hover:bg-[#d6d6d6] dark:hover:bg-[#454545] active:bg-[#b8b8b8] dark:active:bg-[#262626] rounded-none text-[13px] font-normal transition-colors cursor-pointer border-0 inline-flex items-center justify-center gap-1.5 shadow-none select-none"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Attach media</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="fluent-btn-secondary min-w-[100px] h-[32px] px-4 bg-[#cccccc] dark:bg-[#383838] text-black dark:text-white hover:bg-[#d6d6d6] dark:hover:bg-[#454545] active:bg-[#b8b8b8] dark:active:bg-[#262626] rounded-none text-[13px] font-normal transition-colors cursor-pointer border-0 inline-flex items-center justify-center gap-1.5 shadow-none select-none"
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>Attach files</span>
                    </button>
                  </div>

                  {/* Attachments preview list */}
                  {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {attachments.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-none bg-[#262626] border border-white/20 text-xs text-neutral-200"
                        >
                          {item.previewUrl ? (
                            <img
                              src={item.previewUrl}
                              alt={item.name}
                              className="w-5 h-5 rounded-none object-cover"
                            />
                          ) : (
                            <FileText className="w-3.5 h-3.5 text-neutral-400" />
                          )}
                          <span className="max-w-[160px] truncate font-normal">{item.name}</span>
                          <span className="text-[10px] text-neutral-400">({item.size})</span>
                          <button
                            type="button"
                            onClick={() => removeAttachment(idx)}
                            className="text-neutral-400 hover:text-rose-400 transition-colors p-0.5 cursor-pointer"
                            title="Remove file"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Field 5: How do you rate Sparkle? */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs sm:text-sm font-normal text-neutral-200">
                    How do you rate Sparkle?
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((starIdx) => {
                      const isFilled = (hoverRating !== null ? hoverRating : rating) >= starIdx;
                      return (
                        <button
                          key={starIdx}
                          type="button"
                          onMouseEnter={() => setHoverRating(starIdx)}
                          onMouseLeave={() => setHoverRating(null)}
                          onClick={() => setRating(starIdx)}
                          aria-label={`Rate ${starIdx} stars`}
                          className="p-1 transition-transform hover:scale-110 active:scale-95 cursor-pointer text-neutral-600 focus:outline-none"
                        >
                          <Star
                            className={`w-6 h-6 transition-colors ${
                              isFilled
                                ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]'
                                : 'text-neutral-600 fill-none'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Field 6: Checkbox for diagnostics */}
                <div className="pt-1">
                  <label className="inline-flex items-center gap-2.5 cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      checked={saveLocalCopy}
                      onChange={(e) => setSaveLocalCopy(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`w-4.5 h-4.5 rounded-none border flex items-center justify-center transition-all ${
                        saveLocalCopy
                          ? 'bg-[#ff2bbd] border-[#ff2bbd] text-white shadow-[0_0_8px_rgba(255,43,189,0.4)]'
                          : 'bg-[rgba(26,26,26,0.5)] border-white/40 text-transparent group-hover:border-white/60'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="text-xs sm:text-sm text-neutral-300 group-hover:text-white transition-colors font-normal">
                      Save a local copy of diagnostics and attachments created when submitting feedback
                    </span>
                  </label>
                </div>

                {/* Field 7: Submit Button - Styled like delete button in modal dialog "Delete these files" */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="fluent-btn-primary min-w-[130px] h-[32px] px-5 bg-[#cccccc] dark:bg-[#383838] text-black dark:text-white hover:bg-[#d6d6d6] dark:hover:bg-[#454545] active:bg-[#b8b8b8] dark:active:bg-[#262626] rounded-none text-[13px] font-normal transition-colors cursor-pointer border-0 inline-flex items-center justify-center gap-2 select-none shadow-none"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Feedback</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Bottom Section: Recent submissions (N) - Using sharp corner instead of rounded corner */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                  <Clock className="w-4 h-4 text-[#ff2bbd]" />
                  <h2
                    className="text-sm sm:text-base font-normal tracking-tight"
                    style={{ fontWeight: 400 }}
                  >
                    Recent submissions ({submissions.length})
                  </h2>
                </div>
                {submissions.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSubmissions([]);
                      showToast('Đã xóa tất cả các bản ghi phản hồi');
                    }}
                    className="text-xs text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer font-normal"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Submissions Container Card with Sharp Corner */}
              {submissions.length === 0 ? (
                <div className="w-full rounded-none bg-[rgba(26,26,26,0.5)] border border-white/20 p-8 text-center text-neutral-400 text-xs sm:text-sm font-normal">
                  No submissions recorded yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {submissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="rounded-none bg-[rgba(26,26,26,0.6)] border border-white/20 p-4 sm:p-5 space-y-3 shadow-none hover:border-white/40 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-none text-[10px] font-normal uppercase tracking-wider ${
                                sub.type === 'bug'
                                  ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                                  : 'bg-[#ff2bbd]/15 text-[#ff72d0] border border-[#ff2bbd]/30'
                              }`}
                            >
                              {sub.type === 'bug' ? (
                                <>
                                  <Bug className="w-3 h-3" />
                                  <span>Bug Report</span>
                                </>
                              ) : (
                                <>
                                  <Lightbulb className="w-3 h-3" />
                                  <span>Suggestion</span>
                                </>
                              )}
                            </span>

                            <span className="text-[11px] text-neutral-400 font-normal">
                              {sub.createdAt}
                            </span>

                            {sub.saveLocalDiagnostics && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-none bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-normal">
                                Diagnostics saved
                              </span>
                            )}
                          </div>

                          <h3 className="text-sm sm:text-base font-normal text-white">
                            {sub.heading}
                          </h3>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleUpvote(sub.id)}
                            className={`fluent-btn-secondary h-[28px] px-2.5 rounded-none text-xs font-normal transition-colors cursor-pointer inline-flex items-center gap-1 ${
                              sub.hasUpvoted
                                ? 'bg-[#ff2bbd] text-white'
                                : 'bg-[#383838] text-white hover:bg-[#454545]'
                            }`}
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>{sub.upvotes}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteSubmission(sub.id)}
                            className="h-[28px] px-2 rounded-none bg-[#383838] text-neutral-300 hover:text-rose-400 hover:bg-rose-500/15 transition-colors cursor-pointer"
                            title="Delete submission"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed font-normal">
                        {sub.details}
                      </p>

                      {/* Rating Stars and metadata */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10 text-xs text-neutral-400 font-normal">
                        <div className="flex items-center gap-1">
                          <span className="text-neutral-400 mr-1">Rating:</span>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= sub.rating
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-neutral-600'
                              }`}
                            />
                          ))}
                        </div>

                        {sub.email && (
                          <span className="truncate max-w-[220px]">
                            From: <span className="text-neutral-300">{sub.email}</span>
                          </span>
                        )}

                        {sub.attachments && sub.attachments.length > 0 && (
                          <span className="flex items-center gap-1 text-[#ff72d0]">
                            <Paperclip className="w-3 h-3" />
                            <span>{sub.attachments.length} attachment(s)</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* TAB 3: COMMUNITY FEEDBACK VIEW */}
        {activeTab === 'community' && (
          <div className="space-y-4 pt-1 animate-fade-in">
            {/* Filter Bar with windows-search-box style */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <div className="windows-search-box flex-1 w-full rounded-none px-3 py-1.5 flex items-center gap-2 transition-all">
                <FluentSearchIcon className="w-4 h-4 text-neutral-400 shrink-0 pointer-events-none" />
                <input
                  type="text"
                  value={communitySearch}
                  onChange={(e) => setCommunitySearch(e.target.value)}
                  placeholder="Search for feedback"
                  className="w-full bg-transparent text-xs sm:text-[13px] text-neutral-100 placeholder:text-[#a6a6a6] outline-none border-none py-1 no-fluent-line"
                />
                {communitySearch && (
                  <button
                    type="button"
                    onClick={() => setCommunitySearch('')}
                    className="p-0.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    title="Clear"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <select
                value={communityCategory}
                onChange={(e) => setCommunityCategory(e.target.value)}
                className="windows-search-box h-[34px] px-3 rounded-none text-xs text-neutral-100 outline-none cursor-pointer bg-[rgba(26,26,26,0.5)] border border-white/40"
              >
                <option value="All" className="bg-[#262626] text-white">All Categories</option>
                <option value="Apps & Tools" className="bg-[#262626] text-white">Apps & Tools</option>
                <option value="Live TV & Streaming" className="bg-[#262626] text-white">Live TV & Streaming</option>
                <option value="Fluent Design & Mica" className="bg-[#262626] text-white">Fluent Design & Mica</option>
                <option value="Performance & Crash" className="bg-[#262626] text-white">Performance & Crash</option>
                <option value="Audio & Video" className="bg-[#262626] text-white">Audio & Video</option>
              </select>

              <select
                value={communityStatus}
                onChange={(e) => setCommunityStatus(e.target.value)}
                className="windows-search-box h-[34px] px-3 rounded-none text-xs text-neutral-100 outline-none cursor-pointer bg-[rgba(26,26,26,0.5)] border border-white/40"
              >
                <option value="all" className="bg-[#262626] text-white">All Statuses</option>
                <option value="resolved" className="bg-[#262626] text-white">Resolved</option>
                <option value="investigating" className="bg-[#262626] text-white">Investigating</option>
                <option value="received" className="bg-[#262626] text-white">Received</option>
              </select>
            </div>

            {/* Total / Filtered Count Summary */}
            <div className="flex items-center justify-between text-xs text-neutral-400 px-0.5">
              <span>Showing {filteredCommunity.length} of {communityFeedbacks.length} community feedbacks</span>
            </div>

            {/* List of Community Items with sharp corners */}
            {filteredCommunity.length === 0 ? (
              <div className="w-full rounded-none bg-[rgba(26,26,26,0.5)] border border-white/20 p-8 text-center text-neutral-400 text-xs sm:text-sm font-normal">
                No matching community feedback found.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCommunity.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-none bg-[rgba(26,26,26,0.6)] border border-white/20 p-4 sm:p-5 space-y-3 shadow-none hover:border-white/40 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-none text-[10px] font-normal uppercase tracking-wider ${
                              item.type === 'problem'
                                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {item.type === 'problem' ? 'Sự cố' : 'Đề xuất'}
                          </span>

                          <span className="text-[11px] text-neutral-400 font-normal">
                            {item.category}
                          </span>
                        </div>

                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-none font-normal ${
                            item.status === 'resolved'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : item.status === 'investigating'
                                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {item.status === 'resolved' ? 'Đã khắc phục' : item.status === 'investigating' ? 'Đang điều tra' : 'Đã tiếp nhận'}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-normal text-white">
                        {item.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
                        {item.description}
                      </p>

                      {item.officialResponse && (
                        <div className="p-3 bg-white/5 border border-white/10 rounded-none text-xs text-neutral-200 flex items-start gap-2 mt-2">
                          <ShieldCheck className="w-4 h-4 text-[#ff2bbd] shrink-0 mt-0.5" />
                          <div>
                            <span className="font-normal text-[#ff72d0]">Kỹ sư Sparkle (Dev): </span>
                            <span className="text-neutral-300">{item.officialResponse}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-1 border-t border-white/10 text-xs text-neutral-400 font-normal">
                      <div className="flex items-center gap-3">
                        <span>Đăng bởi {item.author}</span>
                        <span>•</span>
                        <span>{item.date}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{item.commentsCount} phản hồi</span>
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleCommunityUpvote(item.id)}
                        className={`fluent-btn-secondary h-[28px] px-3 rounded-none text-xs font-normal transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                          item.hasUpvoted
                            ? 'bg-[#ff2bbd] text-white'
                            : 'bg-[#383838] text-white hover:bg-[#454545]'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{item.upvotes}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
