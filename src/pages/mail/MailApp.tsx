import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Inbox,
  Send,
  Star,
  Trash2,
  Archive,
  FileText,
  AlertOctagon,
  Search,
  Plus,
  RefreshCw,
  Reply,
  Forward,
  MoreVertical,
  Paperclip,
  Check,
  ChevronDown,
  ChevronRight,
  Filter,
  Download,
  Eye,
  X,
  Mail as MailIcon,
  Tag,
  Clock,
  Sparkles,
  ArrowLeft,
  User,
  CheckSquare,
  Square
} from 'lucide-react';
import { FluentSearchIcon } from '../../components/FluentIcons';

export interface EmailAttachment {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'image' | 'doc' | 'sheet' | 'generic';
  url?: string;
}

export interface EmailItem {
  id: string;
  senderName: string;
  senderEmail: string;
  avatar?: string;
  subject: string;
  preview: string;
  body: string;
  timestamp: string;
  dateStr: string;
  isRead: boolean;
  isStarred: boolean;
  folder: 'inbox' | 'starred' | 'sent' | 'drafts' | 'archive' | 'trash' | 'spam';
  category: 'work' | 'personal' | 'tv' | 'system' | 'social';
  attachments?: EmailAttachment[];
  hasAttachment?: boolean;
  replies?: {
    id: string;
    senderName: string;
    senderEmail: string;
    timestamp: string;
    body: string;
  }[];
}

const DEFAULT_EMAILS: EmailItem[] = [
  {
    id: 'mail-1',
    senderName: 'Ban Biên Tập VTV Digital',
    senderEmail: 'bbt@vtv.vn',
    avatar: 'https://static.wikia.nocookie.net/ep-deo/images/d/d4/V-one-dev.png/revision/latest?cb=20261012151735',
    subject: 'Lịch phát sóng trực tiếp Đại hội Thể thao Châu Á ASIAD 2026 & Khung giờ Thời sự 19h HD',
    preview: 'Kính gửi quý khán giả V-One, chúng tôi xin gửi đến quý vị lịch phát sóng và tiếp sóng các môn thi đấu ASIAD...',
    body: `Kính gửi quý khán giả và cộng đồng Sparkle (Dev) V-One,\n\nĐài Truyền hình Việt Nam (VTV) trân trọng thông báo khung giờ phát sóng trực tiếp các môn thi đấu trọng điểm của đoàn thể thao Việt Nam tại Đại hội Thể thao Châu Á (ASIAD 2026) trên các kênh VTV1, VTV5, VTV Cần Thơ và VTV Thể thao:\n\n• 09:00 - 11:30: Vòng loại Bơi lội và Điền kinh (Trực tiếp VTV5 & VTV Cần Thơ)\n• 15:30 - 18:00: Các trận đấu Tứ kết Bóng đá Nam & Bóng chuyền Nữ (VTV5)\n• 19:00 - 19:50: Bản tin Thời sự Toàn cảnh 19h HD đặc biệt với phần bình luận ASIAD\n• 20:00 - 22:30: Chung kết các môn võ thuật & Lễ trao huy chương\n\nQuý vị có thể theo dõi với độ nét chuẩn Full HD trên ứng dụng Sparkle Live TV.\n\nTrân trọng,\nBan Biên tập Truyền hình Số VTV Digital`,
    timestamp: '09:45',
    dateStr: '17/10/2026',
    isRead: false,
    isStarred: true,
    folder: 'inbox',
    category: 'tv',
    hasAttachment: true,
    attachments: [
      { id: 'att-1', name: 'Lich_Phat_Song_ASIAD_2026_VTV.pdf', size: '2.4 MB', type: 'pdf' },
      { id: 'att-2', name: 'Infographic_Lich_Thi_Dau.png', size: '1.8 MB', type: 'image' }
    ]
  },
  {
    id: 'mail-2',
    senderName: 'Trung Tâm An Toàn Swift Bank',
    senderEmail: 'security@swiftbank.vn',
    subject: 'Thông báo sao kê định kỳ & Xác thực giao dịch bảo mật Fluent Key',
    preview: 'Sao kê tài khoản số 1029384756 của quý khách đã được tạo thành công cho kỳ sao kê tháng 10/2026...',
    body: `Kính gửi Quý khách hàng,\n\nSwift Bank xin thông báo sao kê tài khoản thanh toán số 1029384756 của Quý khách đã sẵn sàng.\n\nTổng kết tháng qua:\n• Số dư khả dụng hiện tại: 84.500.000 ₫\n• Tổng số lượt giao dịch Swift Pay 24/7: 18 lượt\n• Điểm tích lũy thành viên Fluent VIP: 1.250 điểm\n\nĐể đảm bảo an toàn tối đa, vui lòng không chia sẻ mã OTP hoặc khóa bảo mật Fluent Token cho bất kỳ ai.\n\nTrân trọng,\nNgân Hàng Số Swift Bank Việt Nam`,
    timestamp: '08:20',
    dateStr: '17/10/2026',
    isRead: false,
    isStarred: false,
    folder: 'inbox',
    category: 'work',
    hasAttachment: true,
    attachments: [
      { id: 'att-3', name: 'Sao_Ke_Thang_10_SwiftBank.xlsx', size: '420 KB', type: 'sheet' }
    ]
  },
  {
    id: 'mail-3',
    senderName: 'Đội Ngũ Phát Triển Sparkle (Dev)',
    senderEmail: 'developer@sparkle.dev',
    subject: 'Chào mừng bạn đến với Sparkle (Dev) 2026 - Hướng dẫn trải nghiệm bộ ứng dụng Fluent',
    preview: 'Cảm ơn bạn đã đồng hành cùng Sparkle (Dev)! Bản cập nhật 26.11 mang đến giao diện Windows 11 Acrylic mượt mà...',
    body: `Xin chào bạn,\n\nChào mừng bạn đến với nền tảng Sparkle (Dev) phiên bản 26.11.\n\nCác tính năng nổi bật được tích hợp sẵn trong hệ thống:\n1. Live TV & EPG Schedule: Xem hơn 80+ kênh truyền hình Việt Nam với độ trễ siêu thấp và lịch phát sóng chi tiết.\n2. Fluent Mail & Calendar: Quản lý hộp thư điện tử cá nhân, gửi nhận email và sắp xếp lịch làm việc chuẩn giao diện Windows 11.\n3. Notes Office Suite: Biên soạn ghi chú phong phú, xuất file Word .docx, PowerPoint và PDF tiện lợi.\n4. Swift Social & Friends: Kết nối với 100 thành viên trong cộng đồng, chia sẻ khoảnh khắc và chat trực tiếp.\n5. Trợ lý AI Copilot: Tìm kiếm nội dung thông minh và giải đáp thắc mắc 24/7.\n\nChúc bạn có những trải nghiệm tuyệt vời cùng Sparkle (Dev)!\n\nThân ái,\nĐội ngũ phát triển Sparkle (Dev)`,
    timestamp: 'Hôm qua',
    dateStr: '16/10/2026',
    isRead: true,
    isStarred: true,
    folder: 'inbox',
    category: 'system'
  },
  {
    id: 'mail-4',
    senderName: 'Hoàng Nam (@hoangnam.dev)',
    senderEmail: 'hoangnam.dev@sparkle.dev',
    subject: 'Gặp mặt cuối tuần & Thảo luận dự án Swift Social Web',
    preview: 'Chào bạn, cuối tuần này team mình có dự định hẹn nhau tại quán cà phê để demo giao diện mới của Swift Social...',
    body: `Chào bạn,\n\nCuối tuần này (Thứ 7, ngày 18/10), nhóm phát triển Swift Social có buổi hẹn offline tại The Coffee House (Hà Nội / TP.HCM) lúc 14:00.\n\nNội dung chính:\n- Review giao diện bảng tin Newsfeed & Stories 24h\n- Tích hợp thêm phòng thoại Discord và mini-game\n- Trao đổi về tính năng gửi file đính kèm tốc độ cao\n\nBạn xác nhận tham gia giúp mình trước Thứ 6 nhé!\n\nThân mến,\nHoàng Nam - Swift Social Core Team`,
    timestamp: 'Hôm qua',
    dateStr: '16/10/2026',
    isRead: true,
    isStarred: false,
    folder: 'inbox',
    category: 'social'
  },
  {
    id: 'mail-5',
    senderName: 'Microsoft Fluent Design Team',
    senderEmail: 'fluent-design@microsoft.com',
    subject: 'Nguyên tắc thiết kế Windows 11 Mica & Acrylic Material cho Web 2026',
    preview: 'Khám phá các tiêu chuẩn mới về hiệu ứng ánh sáng Reveal Effect, bo tròn góc 8px và bảng màu tương phản cao...',
    body: `Hello Developer,\n\nWe are excited to share the latest Fluent Design Guidelines for web experiences:\n\n• Mica & Acrylic Material: Subtle translucent backgrounds that blend beautifully with the desktop wallpaper.\n• Standardized 8px Corner Radius: Clean geometric harmony for inputs, search bars, and floating capsules.\n• Morphing Navigation Indicators: Smooth elastic spring animations for tab transitions.\n• Seamless Dark & Light Mode: Adaptive contrast with high legibility across all display types.\n\nKeep building delightful experiences!\n\nBest regards,\nThe Fluent Design System Team`,
    timestamp: '14/10',
    dateStr: '14/10/2026',
    isRead: true,
    isStarred: true,
    folder: 'inbox',
    category: 'work'
  },
  {
    id: 'mail-6',
    senderName: 'Bếp Trưởng Cookbook V-One',
    senderEmail: 'chef@cookbook.vone.vn',
    subject: 'Gợi ý thực đơn 7 ngày: Món ngon 3 miền chuẩn vị Việt Nam',
    preview: 'Khám phá công thức nấu Phở bò Hà Nội, Bún bò Huế chuẩn vị và Cơm tấm Sài Gòn kèm danh sách đi chợ tự động...',
    body: `Xin chào các bạn yêu ẩm thực,\n\nCookbook vừa bổ sung thêm bộ sưu tập công thức nấu ăn 3 miền đặc sắc:\n- Miền Bắc: Phở bò tái lăn Hà Nội, Nem rán giòn rụm\n- Miền Trung: Bún bò Huế sa tế thơm nồng, Bánh xèo miền Trung\n- Miền Nam: Cơm tấm sườn bì chả, Canh chua cá bông lau\n\nTất cả công thức đều có tính năng tự động nhân khẩu phần ăn và đồng hồ hẹn giờ đếm ngược từng bước nấu.\n\nChúc bạn có những bữa cơm gia đình thật ấm cúng!\n\nBếp trưởng Cookbook`,
    timestamp: '12/10',
    dateStr: '12/10/2026',
    isRead: true,
    isStarred: false,
    folder: 'inbox',
    category: 'personal'
  },
  {
    id: 'mail-7',
    senderName: 'Báo Điện Tử VnExpress',
    senderEmail: 'newsletter@vnexpress.net',
    subject: 'Điểm tin tuần mới: Thị trường công nghệ & Đột phá hạ tầng số quốc gia',
    preview: 'Tổng kết các chuyển động kinh tế số đáng chú ý: các giải pháp truyền hình trực tuyến tương tác cao được ưa chuộng...',
    body: `Bản tin công nghệ VnExpress:\n\n1. Hạ tầng số quốc gia ghi nhận tốc độ tăng trưởng vượt bậc với các giải pháp streaming trực tuyến độ trễ siêu thấp.\n2. Trí tuệ nhân tạo thế hệ mới bắt đầu được tích hợp sâu vào quy trình xử lý công việc văn phòng và tin tức.\n3. Các ngân hàng số tại Việt Nam nâng cấp bảo mật đa lớp chuẩn quốc tế.\n\nĐọc thêm chi tiết trên ứng dụng Articles & Widgets Board của Sparkle.\n\nVnExpress News Team`,
    timestamp: '10/10',
    dateStr: '10/10/2026',
    isRead: true,
    isStarred: false,
    folder: 'inbox',
    category: 'tv'
  },
  // Sent folder email
  {
    id: 'mail-sent-1',
    senderName: 'Tôi (developer@sparkle.dev)',
    senderEmail: 'developer@sparkle.dev',
    subject: 'Góp ý nâng cấp tính năng ghi chú Notes Office & Hộp thư Mail',
    preview: 'Chào đội ngũ phát triển, mình đã trải nghiệm và rất ấn tượng với giao diện Fluent mới...',
    body: `Chào đội ngũ phát triển Sparkle (Dev),\n\nMình đã trải nghiệm và rất ấn tượng với các tính năng mới trong bản phát hành 26.11, đặc biệt là bộ công cụ Notes Office và giao diện Mail & Calendar.\n\nMình xin đề xuất một số ý tưởng cải tiến thêm:\n- Bổ sung bộ lọc email thông minh theo tệp đính kèm\n- Hỗ trợ đánh dấu sao nhanh\n- Thêm tính năng phản hồi nhanh (Quick Reply)\n\nCảm ơn đội ngũ nhiều!\n\nNguyễn Văn Quân`,
    timestamp: '15/10',
    dateStr: '15/10/2026',
    isRead: true,
    isStarred: false,
    folder: 'sent',
    category: 'work'
  },
  // Draft folder email
  {
    id: 'mail-draft-1',
    senderName: 'Tôi (Bản nháp)',
    senderEmail: 'developer@sparkle.dev',
    subject: '[Bản nháp] Kế hoạch tổ chức sinh nhật câu lạc bộ truyền hình',
    preview: 'Dự thảo timeline sự kiện và phân công nhiệm vụ cho các ban truyền thông...',
    body: `Dự thảo kế hoạch sự kiện sinh nhật câu lạc bộ:\n1. Thời gian dự kiến: Thứ Bảy 25/10/2026\n2. Địa điểm: Hội trường V-One Sparkle\n3. Nội dung: Chiếu highlight các chương trình truyền hình yêu thích, mini-game nhận quà Fluent...`,
    timestamp: '13/10',
    dateStr: '13/10/2026',
    isRead: true,
    isStarred: false,
    folder: 'drafts',
    category: 'personal'
  }
];

const CATEGORY_TAGS = {
  work: { label: 'Công việc', color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  personal: { label: 'Cá nhân', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  tv: { label: 'Truyền hình', color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  system: { label: 'Hệ thống', color: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20' },
  social: { label: 'Xã hội', color: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20' }
};

const ACCOUNTS = [
  { id: 'acc-1', email: 'developer@sparkle.dev', name: 'Sparkle Workspace (Cá nhân)', unread: 2 },
  { id: 'acc-2', email: 'workspace@vone.vn', name: 'V-One Workspace', unread: 1 }
];

interface MailAppProps {
  navigate?: (route: string) => void;
}

export const MailApp: React.FC<MailAppProps> = ({ navigate }) => {
  // State
  const [emails, setEmails] = useState<EmailItem[]>(() => {
    try {
      const saved = localStorage.getItem('vone_fluent_mailbox_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((m: EmailItem) => {
            if (m.senderEmail?.includes('cuncon8182') || m.senderName?.includes('cuncon8182')) {
              return {
                ...m,
                senderEmail: 'developer@sparkle.dev',
                senderName: (m.senderName || '').replace('cuncon8182@gmail.com', 'developer@sparkle.dev')
              };
            }
            return m;
          });
        }
      }
    } catch {}
    return DEFAULT_EMAILS;
  });

  const [activeAccount, setActiveAccount] = useState(ACCOUNTS[0]);
  const [activeFolder, setActiveFolder] = useState<'inbox' | 'starred' | 'sent' | 'drafts' | 'archive' | 'trash' | 'spam'>('inbox');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'attachment' | 'starred'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(DEFAULT_EMAILS[0]?.id || null);

  // Multi selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);

  // Compose Modal State
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeCategory, setComposeCategory] = useState<'work' | 'personal' | 'tv' | 'system' | 'social'>('work');
  const [composeAttachments, setComposeAttachments] = useState<EmailAttachment[]>([]);

  // Quick Reply
  const [quickReplyText, setQuickReplyText] = useState('');

  // UI Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Preview attachment modal
  const [previewAttachment, setPreviewAttachment] = useState<EmailAttachment | null>(null);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('vone_fluent_mailbox_data', JSON.stringify(emails));
    } catch {}
  }, [emails]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered emails based on folder, filters and search
  const filteredEmails = useMemo(() => {
    return emails.filter((mail) => {
      // Folder filter
      if (activeFolder === 'starred') {
        if (!mail.isStarred && mail.folder !== 'starred') return false;
        if (mail.folder === 'trash' || mail.folder === 'spam') return false;
      } else {
        if (mail.folder !== activeFolder) return false;
      }

      // Quick filter
      if (filterType === 'unread' && mail.isRead) return false;
      if (filterType === 'attachment' && !mail.hasAttachment) return false;
      if (filterType === 'starred' && !mail.isStarred) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchSender = mail.senderName.toLowerCase().includes(q) || mail.senderEmail.toLowerCase().includes(q);
        const matchSubject = mail.subject.toLowerCase().includes(q);
        const matchBody = mail.body.toLowerCase().includes(q);
        if (!matchSender && !matchSubject && !matchBody) return false;
      }

      return true;
    });
  }, [emails, activeFolder, filterType, searchQuery]);

  // Selected email object
  const currentEmail = useMemo(() => {
    return emails.find((m) => m.id === selectedEmailId) || filteredEmails[0] || null;
  }, [emails, selectedEmailId, filteredEmails]);

  // Folder Counts
  const counts = useMemo(() => {
    return {
      inboxUnread: emails.filter((m) => m.folder === 'inbox' && !m.isRead).length,
      starred: emails.filter((m) => m.isStarred && m.folder !== 'trash').length,
      sent: emails.filter((m) => m.folder === 'sent').length,
      drafts: emails.filter((m) => m.folder === 'drafts').length,
      trash: emails.filter((m) => m.folder === 'trash').length,
      archive: emails.filter((m) => m.folder === 'archive').length
    };
  }, [emails]);

  // Toggle Read/Unread
  const handleToggleRead = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEmails((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const nextRead = !m.isRead;
          showToast(nextRead ? 'Đã đánh dấu đã đọc' : 'Đã đánh dấu chưa đọc');
          return { ...m, isRead: nextRead };
        }
        return m;
      })
    );
  };

  // Toggle Star
  const handleToggleStar = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEmails((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const nextStarred = !m.isStarred;
          showToast(nextStarred ? 'Đã gắn dấu sao thư' : 'Đã bỏ dấu sao');
          return { ...m, isStarred: nextStarred };
        }
        return m;
      })
    );
  };

  // Delete Mail (Move to trash or permanently delete)
  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEmails((prev) => {
      const target = prev.find((m) => m.id === id);
      if (!target) return prev;
      if (target.folder === 'trash') {
        showToast('Đã xóa vĩnh viễn thư');
        return prev.filter((m) => m.id !== id);
      } else {
        showToast('Đã chuyển thư vào Thùng rác');
        return prev.map((m) => (m.id === id ? { ...m, folder: 'trash' as const } : m));
      }
    });

    if (selectedEmailId === id) {
      const remaining = filteredEmails.filter((m) => m.id !== id);
      setSelectedEmailId(remaining[0]?.id || null);
    }
  };

  // Archive Mail
  const handleArchive = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEmails((prev) =>
      prev.map((m) => (m.id === id ? { ...m, folder: 'archive' as const } : m))
    );
    showToast('Đã lưu trữ email');
    if (selectedEmailId === id) {
      const remaining = filteredEmails.filter((m) => m.id !== id);
      setSelectedEmailId(remaining[0]?.id || null);
    }
  };

  // Restore Mail from trash
  const handleRestore = (id: string) => {
    setEmails((prev) =>
      prev.map((m) => (m.id === id ? { ...m, folder: 'inbox' as const } : m))
    );
    showToast('Đã khôi phục email về Hộp thư đến');
  };

  // Synchronize simulation
  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      showToast('Hộp thư đã được đồng bộ hóa mới nhất ✨');
    }, 900);
  };

  // Send New Mail
  const handleSendMail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo.trim()) {
      showToast('Vui lòng nhập địa chỉ người nhận');
      return;
    }
    if (!composeSubject.trim()) {
      showToast('Vui lòng nhập tiêu đề email');
      return;
    }

    const newMail: EmailItem = {
      id: `mail-sent-${Date.now()}`,
      senderName: activeAccount.name,
      senderEmail: activeAccount.email,
      subject: composeSubject,
      preview: composeBody.slice(0, 100),
      body: composeBody || 'Không có nội dung.',
      timestamp: 'Vừa xong',
      dateStr: new Date().toLocaleDateString('vi-VN'),
      isRead: true,
      isStarred: false,
      folder: 'sent',
      category: composeCategory,
      hasAttachment: composeAttachments.length > 0,
      attachments: composeAttachments
    };

    setEmails((prev) => [newMail, ...prev]);
    setIsComposeOpen(false);
    setComposeTo('');
    setComposeSubject('');
    setComposeBody('');
    setComposeAttachments([]);
    showToast('Đã gửi thư thành công! 🚀');
  };

  // Save Draft
  const handleSaveDraft = () => {
    if (!composeSubject.trim() && !composeBody.trim()) {
      setIsComposeOpen(false);
      return;
    }

    const draftMail: EmailItem = {
      id: `mail-draft-${Date.now()}`,
      senderName: 'Tôi (Bản nháp)',
      senderEmail: activeAccount.email,
      subject: composeSubject || '[Không tiêu đề]',
      preview: composeBody.slice(0, 80),
      body: composeBody || '',
      timestamp: 'Vừa lưu',
      dateStr: new Date().toLocaleDateString('vi-VN'),
      isRead: true,
      isStarred: false,
      folder: 'drafts',
      category: composeCategory,
      hasAttachment: composeAttachments.length > 0,
      attachments: composeAttachments
    };

    setEmails((prev) => [draftMail, ...prev]);
    setIsComposeOpen(false);
    setComposeTo('');
    setComposeSubject('');
    setComposeBody('');
    setComposeAttachments([]);
    showToast('Đã lưu thư vào Thư nháp 📝');
  };

  // Quick Reply handler
  const handleSendQuickReply = () => {
    if (!currentEmail || !quickReplyText.trim()) return;

    const newReply = {
      id: `reply-${Date.now()}`,
      senderName: activeAccount.name,
      senderEmail: activeAccount.email,
      timestamp: 'Vừa xong',
      body: quickReplyText
    };

    setEmails((prev) =>
      prev.map((m) => {
        if (m.id === currentEmail.id) {
          const existingReplies = m.replies || [];
          return {
            ...m,
            replies: [...existingReplies, newReply]
          };
        }
        return m;
      })
    );

    setQuickReplyText('');
    showToast('Đã gửi phản hồi thành công!');
  };

  // Batch actions
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredEmails.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEmails.map((m) => m.id));
    }
  };

  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;
    setEmails((prev) =>
      prev.map((m) => (selectedIds.includes(m.id) ? { ...m, folder: 'trash' as const } : m))
    );
    showToast(`Đã chuyển ${selectedIds.length} thư vào Thùng rác`);
    setSelectedIds([]);
  };

  const handleBatchMarkRead = () => {
    if (selectedIds.length === 0) return;
    setEmails((prev) =>
      prev.map((m) => (selectedIds.includes(m.id) ? { ...m, isRead: true } : m))
    );
    showToast(`Đã đánh dấu đã đọc ${selectedIds.length} thư`);
    setSelectedIds([]);
  };

  return (
    <div className="w-full h-full flex-1 min-h-[calc(100vh-64px)] flex flex-col bg-[#f3f4f6] dark:bg-[#1a1c20] text-neutral-900 dark:text-neutral-100 overflow-hidden font-sans select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 px-4 py-2.5 rounded-full bg-neutral-900/90 dark:bg-white/95 text-white dark:text-neutral-900 text-xs font-semibold shadow-2xl flex items-center gap-2 border border-white/20 animate-fade-in backdrop-blur-md">
          <MailIcon className="w-3.5 h-3.5 text-[#0078d4] dark:text-[#4cc2ff]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Mail Layout: 3 Columns (Left Folders, Middle Mail List, Right Reader) */}
      <div className="flex-1 flex overflow-hidden">
        {/* ================= COLUMN 1: LEFT SIDEBAR / FOLDERS ================= */}
        <aside className="w-64 border-r border-black/10 dark:border-white/10 bg-white/70 dark:bg-[#202328]/80 backdrop-blur-xl flex flex-col shrink-0">
          {/* Top Account Capsule */}
          <div className="p-3.5 border-b border-black/10 dark:border-white/10">
            <div className="flex items-center justify-between p-2 rounded-[8px] bg-black/[0.04] dark:bg-white/[0.05] border border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#0078d4] to-[#4cc2ff] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  {activeAccount.email[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold truncate text-neutral-900 dark:text-white">
                    {activeAccount.name}
                  </div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                    {activeAccount.email}
                  </div>
                </div>
              </div>
            </div>

            {/* New Mail Button */}
            <button
              type="button"
              onClick={() => setIsComposeOpen(true)}
              className="mt-3 w-full h-9 rounded-[8px] bg-[#0078d4] hover:bg-[#0067c0] active:bg-[#005a9e] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Soạn thư mới (New Mail)</span>
            </button>
          </div>

          {/* Navigation Folders List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5 text-xs">
            {/* Inbox */}
            <button
              type="button"
              onClick={() => {
                setActiveFolder('inbox');
                setSelectedIds([]);
              }}
              className={`w-full h-8.5 px-3 rounded-[6px] flex items-center justify-between transition-colors cursor-pointer ${
                activeFolder === 'inbox'
                  ? 'bg-[#0078d4]/15 dark:bg-[#4cc2ff]/20 text-[#0078d4] dark:text-[#4cc2ff] font-semibold'
                  : 'hover:bg-black/5 dark:hover:bg-white/5 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Inbox className="w-4 h-4 shrink-0" />
                <span>Hộp thư đến</span>
              </div>
              {counts.inboxUnread > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#0078d4] text-white text-[10px] font-bold">
                  {counts.inboxUnread}
                </span>
              )}
            </button>

            {/* Starred */}
            <button
              type="button"
              onClick={() => {
                setActiveFolder('starred');
                setSelectedIds([]);
              }}
              className={`w-full h-8.5 px-3 rounded-[6px] flex items-center justify-between transition-colors cursor-pointer ${
                activeFolder === 'starred'
                  ? 'bg-[#0078d4]/15 dark:bg-[#4cc2ff]/20 text-[#0078d4] dark:text-[#4cc2ff] font-semibold'
                  : 'hover:bg-black/5 dark:hover:bg-white/5 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Star className="w-4 h-4 shrink-0 fill-amber-400 text-amber-400" />
                <span>Có gắn dấu sao</span>
              </div>
              {counts.starred > 0 && (
                <span className="text-neutral-500 text-[11px] font-medium">{counts.starred}</span>
              )}
            </button>

            {/* Sent */}
            <button
              type="button"
              onClick={() => {
                setActiveFolder('sent');
                setSelectedIds([]);
              }}
              className={`w-full h-8.5 px-3 rounded-[6px] flex items-center justify-between transition-colors cursor-pointer ${
                activeFolder === 'sent'
                  ? 'bg-[#0078d4]/15 dark:bg-[#4cc2ff]/20 text-[#0078d4] dark:text-[#4cc2ff] font-semibold'
                  : 'hover:bg-black/5 dark:hover:bg-white/5 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Send className="w-4 h-4 shrink-0" />
                <span>Đã gửi</span>
              </div>
              {counts.sent > 0 && (
                <span className="text-neutral-500 text-[11px] font-medium">{counts.sent}</span>
              )}
            </button>

            {/* Drafts */}
            <button
              type="button"
              onClick={() => {
                setActiveFolder('drafts');
                setSelectedIds([]);
              }}
              className={`w-full h-8.5 px-3 rounded-[6px] flex items-center justify-between transition-colors cursor-pointer ${
                activeFolder === 'drafts'
                  ? 'bg-[#0078d4]/15 dark:bg-[#4cc2ff]/20 text-[#0078d4] dark:text-[#4cc2ff] font-semibold'
                  : 'hover:bg-black/5 dark:hover:bg-white/5 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 shrink-0" />
                <span>Thư nháp</span>
              </div>
              {counts.drafts > 0 && (
                <span className="text-neutral-500 text-[11px] font-medium">{counts.drafts}</span>
              )}
            </button>

            {/* Archive */}
            <button
              type="button"
              onClick={() => {
                setActiveFolder('archive');
                setSelectedIds([]);
              }}
              className={`w-full h-8.5 px-3 rounded-[6px] flex items-center justify-between transition-colors cursor-pointer ${
                activeFolder === 'archive'
                  ? 'bg-[#0078d4]/15 dark:bg-[#4cc2ff]/20 text-[#0078d4] dark:text-[#4cc2ff] font-semibold'
                  : 'hover:bg-black/5 dark:hover:bg-white/5 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Archive className="w-4 h-4 shrink-0" />
                <span>Lưu trữ</span>
              </div>
              {counts.archive > 0 && (
                <span className="text-neutral-500 text-[11px] font-medium">{counts.archive}</span>
              )}
            </button>

            {/* Trash */}
            <button
              type="button"
              onClick={() => {
                setActiveFolder('trash');
                setSelectedIds([]);
              }}
              className={`w-full h-8.5 px-3 rounded-[6px] flex items-center justify-between transition-colors cursor-pointer ${
                activeFolder === 'trash'
                  ? 'bg-[#0078d4]/15 dark:bg-[#4cc2ff]/20 text-[#0078d4] dark:text-[#4cc2ff] font-semibold'
                  : 'hover:bg-black/5 dark:hover:bg-white/5 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Trash2 className="w-4 h-4 shrink-0" />
                <span>Thùng rác</span>
              </div>
              {counts.trash > 0 && (
                <span className="text-neutral-500 text-[11px] font-medium">{counts.trash}</span>
              )}
            </button>

            {/* Spam */}
            <button
              type="button"
              onClick={() => {
                setActiveFolder('spam');
                setSelectedIds([]);
              }}
              className={`w-full h-8.5 px-3 rounded-[6px] flex items-center justify-between transition-colors cursor-pointer ${
                activeFolder === 'spam'
                  ? 'bg-[#0078d4]/15 dark:bg-[#4cc2ff]/20 text-[#0078d4] dark:text-[#4cc2ff] font-semibold'
                  : 'hover:bg-black/5 dark:hover:bg-white/5 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <AlertOctagon className="w-4 h-4 shrink-0" />
                <span>Thư rác</span>
              </div>
            </button>

            {/* Divider & Categories */}
            <div className="pt-3 pb-1 px-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Nhãn phân loại
              </span>
            </div>

            {Object.entries(CATEGORY_TAGS).map(([key, cat]) => (
              <div
                key={key}
                className="w-full h-7 px-3 rounded-[6px] flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-[#0078d4]" />
                <span className="truncate">{cat.label}</span>
              </div>
            ))}
          </div>

          {/* Bottom Sync status */}
          <div className="p-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[11px] text-neutral-500">
            <span>Đã đồng bộ</span>
            <button
              type="button"
              onClick={handleSync}
              className="p-1.5 rounded-[4px] hover:bg-black/5 dark:hover:bg-white/5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer transition-colors"
              title="Làm mới hộp thư"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#0078d4]' : ''}`} />
            </button>
          </div>
        </aside>

        {/* ================= COLUMN 2: EMAIL LIST ================= */}
        <div className="w-96 border-r border-black/10 dark:border-white/10 bg-white/50 dark:bg-[#1f2227]/70 backdrop-blur-md flex flex-col shrink-0">
          {/* List Search & Command Bar */}
          <div className="p-3 border-b border-black/10 dark:border-white/10 space-y-2">
            <div className="relative h-8 sm:h-8.5 rounded-none windows-search-box flex items-center px-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm thư, người gửi..."
                className="w-full bg-transparent text-xs outline-none border-none pr-14"
              />
              <div className="absolute right-2.5 flex items-center gap-1.5">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <FluentSearchIcon className="w-3.5 h-3.5 shrink-0 pointer-events-none" />
              </div>
            </div>

            {/* Filter Chips Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-2 py-0.5 rounded-[6px] border transition-colors cursor-pointer shrink-0 ${
                  filterType === 'all'
                    ? 'bg-[#0078d4] border-[#0078d4] text-white font-medium'
                    : 'border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:bg-black/5'
                }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setFilterType('unread')}
                className={`px-2 py-0.5 rounded-[6px] border transition-colors cursor-pointer shrink-0 ${
                  filterType === 'unread'
                    ? 'bg-[#0078d4] border-[#0078d4] text-white font-medium'
                    : 'border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:bg-black/5'
                }`}
              >
                Chưa đọc
              </button>
              <button
                type="button"
                onClick={() => setFilterType('starred')}
                className={`px-2 py-0.5 rounded-[6px] border transition-colors cursor-pointer shrink-0 ${
                  filterType === 'starred'
                    ? 'bg-[#0078d4] border-[#0078d4] text-white font-medium'
                    : 'border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:bg-black/5'
                }`}
              >
                Có cờ/sao
              </button>
              <button
                type="button"
                onClick={() => setFilterType('attachment')}
                className={`px-2 py-0.5 rounded-[6px] border transition-colors cursor-pointer shrink-0 ${
                  filterType === 'attachment'
                    ? 'bg-[#0078d4] border-[#0078d4] text-white font-medium'
                    : 'border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:bg-black/5'
                }`}
              >
                Có tệp đính kèm
              </button>
            </div>

            {/* Batch Action Toolbar when items selected */}
            {selectedIds.length > 0 && (
              <div className="pt-1 flex items-center justify-between text-xs bg-[#0078d4]/10 p-2 rounded-[6px] border border-[#0078d4]/20 animate-fade-in">
                <span className="font-semibold text-[#0078d4] dark:text-[#4cc2ff]">
                  Đã chọn {selectedIds.length} thư
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleBatchMarkRead}
                    className="px-2 py-0.5 rounded bg-white dark:bg-neutral-800 text-[11px] font-medium shadow-xs hover:bg-black/5"
                  >
                    Đã đọc
                  </button>
                  <button
                    type="button"
                    onClick={handleBatchDelete}
                    className="px-2 py-0.5 rounded bg-rose-500 text-white text-[11px] font-medium shadow-xs hover:bg-rose-600"
                  >
                    Xóa
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedIds([])}
                    className="p-1 text-neutral-500 hover:text-neutral-900"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Email Item Rows */}
          <div className="flex-1 overflow-y-auto divide-y divide-black/5 dark:divide-white/5">
            {filteredEmails.length === 0 ? (
              <div className="p-8 text-center text-neutral-400 flex flex-col items-center">
                <Inbox className="w-8 h-8 stroke-[1.25] text-neutral-300 dark:text-neutral-600 mb-2" />
                <p className="text-xs">Không có thư nào trong thư mục này</p>
              </div>
            ) : (
              filteredEmails.map((mail) => {
                const isSelected = currentEmail?.id === mail.id;
                const isChecked = selectedIds.includes(mail.id);

                return (
                  <div
                    key={mail.id}
                    onClick={() => {
                      setSelectedEmailId(mail.id);
                      if (!mail.isRead) {
                        setEmails((prev) =>
                          prev.map((m) => (m.id === mail.id ? { ...m, isRead: true } : m))
                        );
                      }
                    }}
                    className={`p-3 relative flex gap-3 cursor-pointer transition-colors group ${
                      isSelected
                        ? 'bg-[#0078d4]/10 dark:bg-[#4cc2ff]/15'
                        : !mail.isRead
                        ? 'bg-white dark:bg-[#25282f] hover:bg-black/5 dark:hover:bg-white/5'
                        : 'hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    {/* Left blue unread indicator line */}
                    {!mail.isRead && (
                      <span className="absolute left-0 top-3 bottom-3 w-[3px] bg-[#0078d4] dark:bg-[#4cc2ff] rounded-r-full" />
                    )}

                    {/* Sender Avatar / Checkbox */}
                    <div className="shrink-0 pt-0.5">
                      <div
                        onClick={(e) => toggleSelectOne(mail.id, e)}
                        className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center font-bold text-xs text-neutral-700 dark:text-neutral-300 group-hover:hidden"
                      >
                        {mail.senderName[0]}
                      </div>
                      <div
                        onClick={(e) => toggleSelectOne(mail.id, e)}
                        className={`w-8 h-8 rounded-full items-center justify-center cursor-pointer hidden group-hover:flex ${
                          isChecked
                            ? 'bg-[#0078d4] text-white !flex'
                            : 'bg-black/10 dark:bg-white/10 hover:bg-black/20 text-neutral-600 dark:text-neutral-300'
                        }`}
                      >
                        {isChecked ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Square className="w-4 h-4" />}
                      </div>
                    </div>

                    {/* Content Preview */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span
                          className={`text-xs truncate ${
                            !mail.isRead
                              ? 'font-bold text-neutral-900 dark:text-white'
                              : 'font-medium text-neutral-700 dark:text-neutral-300'
                          }`}
                        >
                          {mail.senderName}
                        </span>
                        <span className="text-[10px] text-neutral-400 shrink-0">
                          {mail.timestamp}
                        </span>
                      </div>

                      <div
                        className={`text-xs truncate mb-1 ${
                          !mail.isRead
                            ? 'font-semibold text-neutral-900 dark:text-white'
                            : 'text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        {mail.subject}
                      </div>

                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                        {mail.preview}
                      </p>

                      {/* Badges row: Category + Attachment */}
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span
                          className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${
                            CATEGORY_TAGS[mail.category]?.color || 'bg-black/5'
                          }`}
                        >
                          {CATEGORY_TAGS[mail.category]?.label || mail.category}
                        </span>

                        {mail.hasAttachment && (
                          <span className="flex items-center gap-1 text-[10px] text-neutral-400 bg-black/5 dark:bg-white/5 px-1.5 py-0.2 rounded">
                            <Paperclip className="w-2.5 h-2.5" />
                            <span>Tệp đính kèm</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right Hover Quick Actions */}
                    <div className="shrink-0 flex flex-col justify-between items-end">
                      <button
                        type="button"
                        onClick={(e) => handleToggleStar(mail.id, e)}
                        className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-neutral-400 hover:text-amber-400 cursor-pointer"
                        title={mail.isStarred ? 'Bỏ gắn sao' : 'Gắn sao thư'}
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            mail.isStarred ? 'fill-amber-400 text-amber-400' : ''
                          }`}
                        />
                      </button>

                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={(e) => handleToggleRead(mail.id, e)}
                          className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-neutral-400 hover:text-[#0078d4] cursor-pointer"
                          title={mail.isRead ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'}
                        >
                          <MailIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(mail.id, e)}
                          className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-neutral-400 hover:text-rose-500 cursor-pointer"
                          title="Xóa thư"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ================= COLUMN 3: EMAIL READER & QUICK REPLY ================= */}
        <main className="flex-1 bg-white dark:bg-[#1a1c20] flex flex-col overflow-hidden">
          {currentEmail ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Reader Top Action Bar */}
              <div className="h-12 border-b border-black/10 dark:border-white/10 px-4 flex items-center justify-between shrink-0 bg-white/80 dark:bg-[#202328]/80 backdrop-blur-md">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setComposeTo(currentEmail.senderEmail);
                      setComposeSubject(`Re: ${currentEmail.subject}`);
                      setComposeBody(`\n\n--- Vào lúc ${currentEmail.dateStr} ${currentEmail.timestamp}, ${currentEmail.senderName} đã viết:\n> ${currentEmail.body.slice(0, 200)}...`);
                      setIsComposeOpen(true);
                    }}
                    className="h-8 px-2.5 rounded-[6px] hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-200 transition-colors cursor-pointer"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    <span>Trả lời (Reply)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setComposeSubject(`Fwd: ${currentEmail.subject}`);
                      setComposeBody(`\n\n---------- Thư được chuyển tiếp ----------\nTừ: ${currentEmail.senderName} <${currentEmail.senderEmail}>\nNgày: ${currentEmail.dateStr}\nTiêu đề: ${currentEmail.subject}\n\n${currentEmail.body}`);
                      setIsComposeOpen(true);
                    }}
                    className="h-8 px-2.5 rounded-[6px] hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-200 transition-colors cursor-pointer"
                  >
                    <Forward className="w-3.5 h-3.5" />
                    <span>Chuyển tiếp (Forward)</span>
                  </button>

                  <div className="h-4 w-[1px] bg-black/10 dark:bg-white/10 mx-1" />

                  <button
                    type="button"
                    onClick={() => handleArchive(currentEmail.id)}
                    className="p-1.5 rounded-[6px] hover:bg-black/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
                    title="Lưu trữ"
                  >
                    <Archive className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(currentEmail.id)}
                    className="p-1.5 rounded-[6px] hover:bg-black/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 hover:text-rose-500 transition-colors cursor-pointer"
                    title="Xóa vào thùng rác"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {currentEmail.folder === 'trash' && (
                    <button
                      type="button"
                      onClick={() => handleRestore(currentEmail.id)}
                      className="px-2.5 py-1 rounded-[6px] bg-[#0078d4] text-white text-xs font-medium hover:bg-[#0067c0] cursor-pointer"
                    >
                      Khôi phục về Inbox
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleToggleStar(currentEmail.id)}
                    className="p-1.5 rounded-[6px] hover:bg-black/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 hover:text-amber-400 cursor-pointer"
                    title="Gắn dấu sao"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        currentEmail.isStarred ? 'fill-amber-400 text-amber-400' : ''
                      }`}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleRead(currentEmail.id)}
                    className="p-1.5 rounded-[6px] hover:bg-black/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 cursor-pointer"
                    title="Đánh dấu chưa đọc"
                  >
                    <MailIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Reader Scrollable Message Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Subject & Category Header */}
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <h1 className="text-xl font-bold text-neutral-900 dark:text-white leading-snug">
                      {currentEmail.subject}
                    </h1>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full border shrink-0 ${
                        CATEGORY_TAGS[currentEmail.category]?.color || 'bg-black/5'
                      }`}
                    >
                      {CATEGORY_TAGS[currentEmail.category]?.label || currentEmail.category}
                    </span>
                  </div>
                </div>

                {/* Sender Details Box */}
                <div className="flex items-center justify-between p-3 rounded-[10px] bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0078d4] to-[#4cc2ff] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                      {currentEmail.senderName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-neutral-900 dark:text-white">
                          {currentEmail.senderName}
                        </span>
                        <span className="text-xs text-neutral-400">
                          &lt;{currentEmail.senderEmail}&gt;
                        </span>
                      </div>
                      <div className="text-xs text-neutral-500 flex items-center gap-1.5 mt-0.5">
                        <span>tới tôi ({activeAccount.email})</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-xs text-neutral-400">
                    <div>{currentEmail.dateStr}</div>
                    <div className="text-[11px]">{currentEmail.timestamp}</div>
                  </div>
                </div>

                {/* Main Email Text Content */}
                <div className="prose dark:prose-invert max-w-none text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-line font-sans">
                  {currentEmail.body}
                </div>

                {/* Attachments Section if present */}
                {currentEmail.attachments && currentEmail.attachments.length > 0 && (
                  <div className="pt-4 border-t border-black/10 dark:border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      <Paperclip className="w-3.5 h-3.5 text-[#0078d4]" />
                      <span>{currentEmail.attachments.length} tệp đính kèm</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {currentEmail.attachments.map((att) => (
                        <div
                          key={att.id}
                          className="p-3 rounded-[8px] bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 flex items-center justify-between hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-[6px] bg-[#0078d4]/15 text-[#0078d4] dark:text-[#4cc2ff] flex items-center justify-center shrink-0 font-bold text-[11px] uppercase">
                              {att.type}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium truncate text-neutral-900 dark:text-white">
                                {att.name}
                              </p>
                              <p className="text-[10px] text-neutral-400">{att.size}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setPreviewAttachment(att)}
                              className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 transition-colors"
                              title="Xem trước"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => showToast(`Bắt đầu tải xuống ${att.name}`)}
                              className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 transition-colors"
                              title="Tải xuống"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reply Threads if any */}
                {currentEmail.replies && currentEmail.replies.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-black/10 dark:border-white/10">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                      Lịch sử trao đổi ({currentEmail.replies.length})
                    </h3>

                    {currentEmail.replies.map((rep) => (
                      <div
                        key={rep.id}
                        className="p-3.5 rounded-[10px] bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-neutral-900 dark:text-white">
                            {rep.senderName}
                          </span>
                          <span className="text-[11px] text-neutral-400">{rep.timestamp}</span>
                        </div>
                        <p className="text-xs text-neutral-800 dark:text-neutral-200 whitespace-pre-line leading-relaxed">
                          {rep.body}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Quick Reply Box */}
              <div className="p-3.5 border-t border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] text-neutral-400">Gợi ý trả lời nhanh:</span>
                  {[
                    'Cảm ơn bạn, tôi đã nhận được thông tin!',
                    'Đồng ý, tôi sẽ kiểm tra và phản hồi sớm.',
                    'Kế hoạch rất tuyệt vời!'
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setQuickReplyText(preset)}
                      className="text-[11px] px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 hover:bg-[#0078d4]/15 hover:text-[#0078d4] dark:hover:text-[#4cc2ff] border border-black/5 dark:border-white/5 transition-colors cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <div className="flex items-end gap-2">
                  <textarea
                    rows={2}
                    value={quickReplyText}
                    onChange={(e) => setQuickReplyText(e.target.value)}
                    placeholder={`Trả lời nhanh cho ${currentEmail.senderName}...`}
                    className="flex-1 p-2.5 rounded-[8px] bg-white dark:bg-[#202328] border border-black/10 dark:border-white/10 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0078d4] resize-none"
                  />
                  <button
                    type="button"
                    disabled={!quickReplyText.trim()}
                    onClick={handleSendQuickReply}
                    className="h-10 px-4 rounded-[8px] bg-[#0078d4] hover:bg-[#0067c0] disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-400">
              <MailIcon className="w-12 h-12 stroke-[1] text-neutral-300 dark:text-neutral-600 mb-3" />
              <h2 className="text-base font-semibold text-neutral-700 dark:text-neutral-300">
                Chọn một email để đọc
              </h2>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm">
                Bạn có thể duyệt qua danh sách thư hoặc sử dụng thanh tìm kiếm để nhanh chóng truy xuất nội dung.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* ================= MODAL: COMPOSE NEW EMAIL ================= */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-[#24272e] rounded-[16px] border border-black/10 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
            {/* Modal Header */}
            <div className="h-12 px-5 border-b border-black/10 dark:border-white/10 flex items-center justify-between shrink-0 bg-black/[0.02] dark:bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <MailIcon className="w-4 h-4 text-[#0078d4] dark:text-[#4cc2ff]" />
                <span className="text-sm font-bold text-neutral-900 dark:text-white">
                  Thư mới (New Message)
                </span>
              </div>
              <button
                type="button"
                onClick={handleSaveDraft}
                className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Compose Form */}
            <form onSubmit={handleSendMail} className="flex-1 flex flex-col p-5 space-y-3 overflow-y-auto">
              {/* From Address */}
              <div className="flex items-center text-xs">
                <span className="w-16 text-neutral-400 font-medium">Từ:</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  {activeAccount.name} &lt;{activeAccount.email}&gt;
                </span>
              </div>

              {/* To Address */}
              <div className="flex items-center border-b border-black/10 dark:border-white/10 pb-2 text-xs">
                <span className="w-16 text-neutral-400 font-medium">Đến:</span>
                <input
                  type="email"
                  required
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  placeholder="Nhập địa chỉ email người nhận (ví dụ: bbt@vtv.vn)..."
                  className="flex-1 bg-transparent border-none focus:outline-none text-neutral-900 dark:text-white placeholder:text-neutral-400"
                />
              </div>

              {/* Subject */}
              <div className="flex items-center border-b border-black/10 dark:border-white/10 pb-2 text-xs">
                <span className="w-16 text-neutral-400 font-medium">Chủ đề:</span>
                <input
                  type="text"
                  required
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="Tiêu đề thư..."
                  className="flex-1 bg-transparent border-none focus:outline-none text-neutral-900 dark:text-white font-medium placeholder:text-neutral-400"
                />
              </div>

              {/* Category Picker */}
              <div className="flex items-center gap-2 text-xs pt-1">
                <span className="text-neutral-400">Phân loại:</span>
                {(['work', 'personal', 'tv', 'social'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setComposeCategory(cat)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                      composeCategory === cat
                        ? CATEGORY_TAGS[cat].color
                        : 'border-black/10 dark:border-white/10 text-neutral-500'
                    }`}
                  >
                    {CATEGORY_TAGS[cat].label}
                  </button>
                ))}
              </div>

              {/* Email Body */}
              <textarea
                rows={8}
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                placeholder="Nhập nội dung thư của bạn ở đây..."
                className="w-full flex-1 p-3 rounded-[8px] bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0078d4] resize-none leading-relaxed"
              />

              {/* Simulated Attach File button */}
              {composeAttachments.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {composeAttachments.map((att, idx) => (
                    <div
                      key={idx}
                      className="px-2.5 py-1 rounded bg-[#0078d4]/10 text-[#0078d4] dark:text-[#4cc2ff] text-xs flex items-center gap-1.5 border border-[#0078d4]/20"
                    >
                      <Paperclip className="w-3 h-3" />
                      <span>{att.name}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setComposeAttachments((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="hover:text-rose-500 ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const mockAtt: EmailAttachment = {
                        id: `att-${Date.now()}`,
                        name: `Tai_Lieu_Dinh_Kem_${Math.floor(Math.random() * 100)}.pdf`,
                        size: '1.2 MB',
                        type: 'pdf'
                      };
                      setComposeAttachments((prev) => [...prev, mockAtt]);
                      showToast('Đã đính kèm tệp mẫu!');
                    }}
                    className="h-8 px-2.5 rounded-[6px] border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-xs text-neutral-600 dark:text-neutral-300 flex items-center gap-1.5 transition-colors"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>Đính kèm tệp</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="h-8 px-3 rounded-[6px] border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors"
                  >
                    Lưu nháp
                  </button>
                  <button
                    type="submit"
                    className="h-8 px-4 rounded-[6px] bg-[#0078d4] hover:bg-[#0067c0] active:bg-[#005a9e] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi thư (Send)</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: PREVIEW ATTACHMENT ================= */}
      {previewAttachment && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#24272e] rounded-[16px] border border-black/10 dark:border-white/10 shadow-2xl p-6 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-[12px] bg-[#0078d4]/15 text-[#0078d4] dark:text-[#4cc2ff] flex items-center justify-center text-xl font-bold uppercase">
              {previewAttachment.type}
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                {previewAttachment.name}
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">Dung lượng: {previewAttachment.size}</p>
            </div>
            <div className="p-4 rounded-[8px] bg-black/[0.03] dark:bg-white/[0.04] text-xs text-neutral-600 dark:text-neutral-300 w-full text-left font-mono">
              [Trình xem trước tệp trực tiếp Fluent Quick Look]
              <br />
              Tệp tài liệu an toàn đã được quét virus và sẵn sàng tải về thiết bị của bạn.
            </div>
            <div className="flex items-center gap-2 w-full pt-2">
              <button
                type="button"
                onClick={() => setPreviewAttachment(null)}
                className="flex-1 h-9 rounded-[8px] border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-xs font-medium"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast(`Đã tải xuống ${previewAttachment.name}`);
                  setPreviewAttachment(null);
                }}
                className="flex-1 h-9 rounded-[8px] bg-[#0078d4] hover:bg-[#0067c0] text-white text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải xuống</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
