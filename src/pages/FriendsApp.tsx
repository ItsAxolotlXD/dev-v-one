import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  UserPlus,
  UserCheck,
  MessageCircle,
  Tv,
  Music,
  Radio,
  Flame,
  CheckCircle2,
  Filter,
  Sparkles,
  MapPin,
  Heart,
  ExternalLink,
  X,
  ShieldCheck,
  Clock,
  ChevronDown
} from 'lucide-react';
import { FluentFriendsColorIcon } from '../components/FluentIcons';

export interface VOneUser {
  id: number;
  nickname: string;
  name: string;
  avatar: string;
  bgGradient: string;
  status: 'online' | 'watching_tv' | 'listening_music' | 'cooking' | 'socializing' | 'offline';
  activity: string;
  bio: string;
  badge: 'VIP' | 'Dev' | 'Mod' | 'Creator' | 'Member';
  location: string;
  followers: number;
  isFriend: boolean;
  channelWatching?: string;
}

// Generate exactly 100 realistic, high quality random Sparkle (Dev) users
const NICKNAMES_POOL = [
  'hoangnam.dev', 'minhthu.vone', 'anhkiet_99', 'bichngoc.design', 'tuankhoi_vtv',
  'dragon_coder', 'linhdan.cute', 'vietanh.music', 'son_huy_pro', 'tra_my_star',
  'phong_cyber', 'quocbao_pro', 'lanhuong.foodie', 'duykhang_gamer', 'yenchi_chill',
  'minhduc_tv', 'thao_vy_vlog', 'hai_dang_code', 'kim_ngan_flower', 'bao_long_speed',
  'van_anh_media', 'trong_nghia_ai', 'huong_giang_queen', 'duc_thang_tech', 'mai_anh_sun',
  'gia_huy_flow', 'khanh_linh_sky', 'quang_minh_news', 'thuy_tien_water', 'hong_phuc_joy',
  'tien_dung_goal', 'thanh_truc_bamboo', 'ngoc_huyen_gem', 'tan_phat_growth', 'le_hang_moon',
  'chi_kien_iron', 'ngoc_anh_gem', 'phuc_thinh_rise', 'xuan_mai_spring', 'dinh_trong_shield',
  'thanh_thao_green', 'cong_phuong_star', 'ha_my_melody', 'van_toan_swift', 'thu_ha_autumn',
  'tuan_anh_magic', 'phuong_thao_herb', 'van_hau_rock', 'quynh_anh_ruby', 'quang_hai_hero',
  'hoang_yen_bird', 'tan_tai_wealth', 'ngoc_mai_blossom', 'duc_chinh_sniper', 'thanh_hang_model',
  'hong_duy_pink', 'thuy_dung_pure', 'minh_vuong_king', 'thu_thao_grace', 'van_thanh_arrow',
  'my_tam_song', 'son_tung_mtp', 'den_vau_chill', 'suboi_rap', 'toc_tien_vibe',
  'truc_nhan_smile', 'hoang_thuy_linh', 'vu_cat_tuong', 'phan_manh_quynh', 'bich_phuong_fun',
  'erik_melody', 'duc_phuc_voice', 'hoa_minzy_sun', 'jack_fire', 'kicm_beat',
  'mono_vibe', 'hieuthuhai_cool', 'wren_evans_groove', 'tlinh_sweet', 'mck_flame',
  'low_g_rap', 'karik_flow', 'justatee_chill', 'rhymastic_king', 'soobin_prince',
  'touliver_beat', 'binz_poet', 'space_speaker', 'slime_miner', 'pixel_art_vn',
  'sparkle_superfan', 'edge_browser_pro', 'swift_coder', 'swift_banker', 'clock_master',
  'vlc_audiophile', 'photopea_artist', 'cookbook_chef', 'vietnam_traveler', 'saigon_wanderer'
];

const NAMES_POOL = [
  'Hoàng Nam', 'Minh Thư', 'Anh Kiệt', 'Bích Ngọc', 'Tuấn Khôi',
  'Nguyễn Long', 'Linh Đan', 'Việt Anh', 'Sơn Huy', 'Trà My',
  'Phong Vũ', 'Quốc Bảo', 'Lan Hương', 'Duy Khang', 'Yến Chi',
  'Minh Đức', 'Thảo Vy', 'Hải Đăng', 'Kim Ngân', 'Bảo Long',
  'Vân Anh', 'Trọng Nghĩa', 'Hương Giang', 'Đức Thắng', 'Mai Anh',
  'Gia Huy', 'Khánh Linh', 'Quang Minh', 'Thủy Tiên', 'Hồng Phúc',
  'Tiến Dũng', 'Thanh Trúc', 'Ngọc Huyền', 'Tấn Phát', 'Lệ Hằng',
  'Chí Kiên', 'Ngọc Ánh', 'Phúc Thịnh', 'Xuân Mai', 'Đình Trọng',
  'Thanh Thảo', 'Công Phượng', 'Hà My', 'Văn Toàn', 'Thu Hà',
  'Tuấn Anh', 'Phương Thảo', 'Văn Hậu', 'Quỳnh Anh', 'Quang Hải',
  'Hoàng Yến', 'Tấn Tài', 'Ngọc Mai', 'Đức Chinh', 'Thanh Hằng',
  'Hồng Duy', 'Thùy Dung', 'Minh Vương', 'Thu Thảo', 'Văn Thanh',
  'Mỹ Tâm', 'Sơn Tùng', 'Đen Vâu', 'Suboi', 'Tóc Tiên',
  'Trúc Nhân', 'Thùy Linh', 'Cát Tường', 'Mạnh Quỳnh', 'Bích Phương',
  'Lê Trung Thành', 'Nguyễn Đức Phúc', 'Hòa Minzy', 'Phương Tuấn', 'Khánh Bảo',
  'Nguyễn Việt Hoàng', 'Trần Minh Hiếu', 'Lê Phan', 'Nguyễn Thảo Linh', 'Nghiêm Vũ Hoàng Long',
  'Nguyễn Hoàng Long', 'Phạm Hoàng Khoa', 'Nguyễn Thanh Hưng', 'Vũ Đức Thiện', 'Nguyễn Hoàng Sơn',
  'Hoàng Touliver', 'Lê Nguyễn Trung Đan', 'Vũ Nhật Anh', 'Nguyễn Thế Sơn', 'Đỗ Thành Đạt',
  'Đặng Văn Lâm', 'Quế Ngọc Hải', 'Đỗ Duy Mạnh', 'Bùi Tiến Dũng', 'Phan Văn Đức',
  'Nguyễn Trọng Hoàng', 'Lương Xuân Trường', 'Phạm Đức Huy', 'Hà Đức Chinh', 'Nguyễn Tiến Linh'
];

const ACTIVITIES_POOL = [
  'Đang xem VTV1 HD: Thời sự 19h',
  'Đang nghe Synthwave trên VLC Media Player',
  'Vừa nấu Phở bò Hà Nội trên Cookbook',
  'Đang chia sẻ bài viết mới trên Swift Social',
  'Đang xem HTV7 HD: 2 Ngày 1 Đêm',
  'Đang đọc tin tức thời sự trên Sparkle News',
  'Đang chuyển khoản trên Swift Bank',
  'Đang chơi Craftmine Sandbox',
  'Đang thiết kế poster trên Photopea',
  'Đang đặt báo thức sớm trên Clock',
  'Đang lướt web trên Edge Browser',
  'Đang thảo luận trong kênh Discord #chung',
  'Đang xem VTV3: Hãy Chọn Giá Đúng',
  'Đang kiểm tra tiến trình trên Task Manager',
  'Đang ghi chú tài liệu trên Notes Office'
];

const LOCATIONS_POOL = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng', 'Huế', 'Nha Trang', 'Đà Lạt'];
const BADGES_POOL: ('VIP' | 'Dev' | 'Mod' | 'Creator' | 'Member')[] = ['VIP', 'Dev', 'Mod', 'Creator', 'Member'];
const GRADIENTS_POOL = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-amber-600',
  'from-purple-500 to-pink-600',
  'from-rose-500 to-red-600',
  'from-cyan-500 to-blue-600'
];

const GENERATED_USERS: VOneUser[] = Array.from({ length: 100 }, (_, index) => {
  const nickname = NICKNAMES_POOL[index] || `user_${index + 1}`;
  const name = NAMES_POOL[index] || `Người dùng ${index + 1}`;
  const statusPool: VOneUser['status'][] = ['online', 'watching_tv', 'listening_music', 'cooking', 'socializing', 'offline'];
  const status = index < 45 ? 'online' : statusPool[index % statusPool.length];
  const isFriend = index < 12;

  return {
    id: index + 1,
    nickname: `@${nickname}`,
    name,
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${nickname}`,
    bgGradient: GRADIENTS_POOL[index % GRADIENTS_POOL.length],
    status,
    activity: ACTIVITIES_POOL[index % ACTIVITIES_POOL.length],
    bio: `Xin chào! Mình là ${name}. Rất vui được kết nối cùng cộng đồng Sparkle (Dev) Việt Nam! ✨`,
    badge: index % 7 === 0 ? 'Dev' : index % 5 === 0 ? 'VIP' : index % 4 === 0 ? 'Creator' : BADGES_POOL[index % BADGES_POOL.length],
    location: LOCATIONS_POOL[index % LOCATIONS_POOL.length],
    followers: Math.floor(Math.random() * 800) + 120,
    isFriend
  };
});

interface FriendsAppProps {
  navigate?: (route: string) => void;
}

export const FriendsApp: React.FC<FriendsAppProps> = ({ navigate }) => {
  const [users, setUsers] = useState<VOneUser[]>(GENERATED_USERS);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'online' | 'watching' | 'friends'>('all');
  const [selectedUser, setSelectedUser] = useState<VOneUser | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Toggle friendship status
  const handleToggleFriend = (userId: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextState = !u.isFriend;
          showToast(nextState ? `Đã kết bạn với ${u.name} (${u.nickname})` : `Đã hủy kết bạn với ${u.name}`);
          return { ...u, isFriend: nextState };
        }
        return u;
      })
    );
  };

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        u.nickname.toLowerCase().includes(q) ||
        u.name.toLowerCase().includes(q) ||
        u.activity.toLowerCase().includes(q) ||
        u.location.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (activeFilter === 'online') return u.status === 'online';
      if (activeFilter === 'watching') return u.activity.includes('Đang xem');
      if (activeFilter === 'friends') return u.isFriend;
      return true;
    });
  }, [users, searchQuery, activeFilter]);

  // Statistics
  const totalUsers = users.length;
  const onlineCount = users.filter((u) => u.status === 'online').length;
  const watchingCount = users.filter((u) => u.activity.includes('Đang xem')).length;
  const friendCount = users.filter((u) => u.isFriend).length;

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex flex-col bg-[#f9f9f9] dark:bg-[#1a1c20] text-black dark:text-white select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 px-4 py-2.5 rounded-full bg-black/90 dark:bg-white/95 text-white dark:text-black text-xs font-semibold shadow-2xl flex items-center gap-2 border border-white/20 animate-fade-in">
          <UserCheck className="w-4 h-4 text-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="bg-white dark:bg-[#22252a] border-b border-black/10 dark:border-white/10 px-4 sm:px-6 py-5 shrink-0 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <FluentFriendsColorIcon className="w-9 h-9 shrink-0 drop-shadow-sm" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  Cộng đồng Sparkle (Dev) ({totalUsers} Người dùng)
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                  100 Nicknames
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Khám phá và kết nối cùng 100 thành viên ngẫu nhiên trên hệ thống Sparkle (Dev) Việt Nam
              </p>
            </div>
          </div>

          {/* Search Input with 8px radius */}
          <div className="relative w-full md:w-80 lg:w-96 h-10 flex items-center px-4 rounded-[8px] bg-black/5 dark:bg-white/[0.06] border border-black/10 dark:border-white/10 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all shadow-2xs">
            <Search className="w-4 h-4 text-neutral-400 mr-2.5 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo nickname (@hoangnam.dev), họ tên, thành phố..."
              className="w-full bg-transparent text-xs sm:text-sm text-neutral-900 dark:text-white placeholder-neutral-400 outline-none border-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 flex-1 flex flex-col space-y-5">
        {/* Stats & Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            {[
              { id: 'all', label: `Tất cả (${totalUsers})` },
              { id: 'online', label: `Đang Online (${onlineCount})` },
              { id: 'watching', label: `Đang xem TV (${watchingCount})` },
              { id: 'friends', label: `Bạn bè của tôi (${friendCount})` }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-[#22252a] text-neutral-700 dark:text-neutral-300 border border-black/10 dark:border-white/10 hover:bg-black/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-neutral-500 font-medium">
            Hiển thị <span className="text-emerald-600 dark:text-emerald-400 font-bold">{filteredUsers.length}</span> người dùng
          </div>
        </div>

        {/* 100 Users Grid */}
        {filteredUsers.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-16 text-center text-neutral-400 space-y-3">
            <Users className="w-12 h-12 text-neutral-300 dark:text-neutral-600" />
            <p className="text-sm font-semibold">Không tìm thấy người dùng phù hợp</p>
            <p className="text-xs">Thử tìm kiếm với từ khóa khác như @hoangnam, Hà Nội...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredUsers.map((user) => {
              return (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className="group bg-white dark:bg-[#22252a] rounded-2xl border border-black/10 dark:border-white/10 p-4 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Top User Card Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 truncate">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <div className={`w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr ${user.bgGradient}`}>
                            <div className="w-full h-full rounded-full bg-white dark:bg-[#22252a] flex items-center justify-center font-bold text-sm text-neutral-800 dark:text-neutral-200">
                              {user.name.split(' ').pop()?.slice(0, 2) || 'VN'}
                            </div>
                          </div>
                          {/* Status Dot */}
                          <div
                            className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#22252a] ${
                              user.status === 'online' ? 'bg-emerald-500' : 'bg-neutral-400'
                            }`}
                          />
                        </div>

                        {/* Name and Nickname */}
                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-sm text-neutral-900 dark:text-white truncate group-hover:text-emerald-600 transition-colors">
                              {user.name}
                            </h3>
                            {user.badge === 'Dev' ? (
                              <span className="px-1.5 py-0.2 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400 text-[9px] font-bold">
                                DEV
                              </span>
                            ) : user.badge === 'VIP' ? (
                              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[9px] font-bold">
                                VIP
                              </span>
                            ) : null}
                          </div>
                          <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 truncate">
                            {user.nickname}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Activity Indicator */}
                    <div className="mt-3 p-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] text-[11px] text-neutral-600 dark:text-neutral-300 flex items-center gap-2 truncate">
                      {user.activity.includes('Đang xem') ? (
                        <Tv className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      ) : user.activity.includes('VLC') ? (
                        <Music className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      ) : (
                        <Radio className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      )}
                      <span className="truncate">{user.activity}</span>
                    </div>

                    {/* Bio */}
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 line-clamp-2">
                      {user.bio}
                    </p>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {user.location}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (navigate) navigate('/swift');
                        }}
                        title="Nhắn tin trên Swift"
                        className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-neutral-500 hover:text-indigo-500 cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleToggleFriend(user.id, e)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                          user.isFriend
                            ? 'bg-emerald-600/15 text-emerald-600 dark:text-emerald-400'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs'
                        }`}
                      >
                        {user.isFriend ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Bạn bè</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Kết bạn</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* User Profile Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#22252a] rounded-3xl shadow-2xl border border-black/10 dark:border-white/10 p-6 text-neutral-900 dark:text-white animate-scale-in relative">
            <button
              type="button"
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Profile Avatar & Info */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className={`w-20 h-20 rounded-full p-1 bg-gradient-to-tr ${selectedUser.bgGradient} shadow-md`}>
                <div className="w-full h-full rounded-full bg-white dark:bg-[#22252a] flex items-center justify-center font-bold text-xl">
                  {selectedUser.name.split(' ').pop()?.slice(0, 2) || 'VN'}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-center gap-2">
                  <h3 className="text-lg font-bold">{selectedUser.name}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 text-[10px] font-bold">
                    {selectedUser.badge}
                  </span>
                </div>
                <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {selectedUser.nickname}
                </p>
              </div>

              <p className="text-xs text-neutral-600 dark:text-neutral-300 max-w-xs">
                {selectedUser.bio}
              </p>

              {/* Stats */}
              <div className="w-full grid grid-cols-3 gap-2 py-3 border-y border-black/10 dark:border-white/10 text-xs">
                <div>
                  <span className="text-[10px] text-neutral-400 block">Địa điểm</span>
                  <span className="font-bold">{selectedUser.location}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block">Người theo dõi</span>
                  <span className="font-bold">{selectedUser.followers}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block">Trạng thái</span>
                  <span className="font-bold capitalize text-emerald-500">{selectedUser.status}</span>
                </div>
              </div>

              {/* Currently doing */}
              <div className="w-full p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] text-xs text-left">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">
                  Đang hoạt động:
                </span>
                <p className="font-semibold text-neutral-800 dark:text-neutral-200">
                  {selectedUser.activity}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="w-full flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleToggleFriend(selectedUser.id)}
                  className={`flex-1 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    selectedUser.isFriend
                      ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-white'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {selectedUser.isFriend ? 'Đã là bạn bè' : 'Kết bạn ngay'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUser(null);
                    if (navigate) navigate('/swift');
                  }}
                  className="flex-1 py-2 rounded-full bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-600 cursor-pointer"
                >
                  Nhắn tin Swift
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
