import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Repeat2,
  Share2,
  Send,
  Image as ImageIcon,
  Smile,
  Hash,
  Sparkles,
  TrendingUp,
  Users,
  Compass,
  MessageSquare,
  Volume2,
  Mic,
  MoreHorizontal,
  Bookmark,
  CheckCircle2,
  Plus,
  X,
  Search,
  Radio,
  Bell
} from 'lucide-react';
import { FluentSwiftSocialColorIcon } from '../components/FluentIcons';

interface Post {
  id: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
    verified?: boolean;
    role?: string;
  };
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: { id: string; user: string; text: string; time: string }[];
  retweets: number;
  tags: string[];
  userReaction?: 'like' | 'love' | 'haha' | null;
}

interface Story {
  id: string;
  name: string;
  avatar: string;
  storyImage: string;
  hasUnseen: boolean;
}

const INITIAL_STORIES: Story[] = [
  {
    id: 'story-1',
    name: 'Bạn',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    storyImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    hasUnseen: false
  },
  {
    id: 'story-2',
    name: 'Minh Thư',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    storyImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
    hasUnseen: true
  },
  {
    id: 'story-3',
    name: 'Hoàng Nam',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    storyImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80',
    hasUnseen: true
  },
  {
    id: 'story-4',
    name: 'Linh Đan',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    storyImage: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop&q=80',
    hasUnseen: true
  },
  {
    id: 'story-5',
    name: 'Tuấn Khôi',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    storyImage: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop&q=80',
    hasUnseen: true
  }
];

const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    author: {
      name: 'Sparkle Dev Studio',
      handle: '@sparkle.official',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      verified: true,
      role: 'Official'
    },
    content: 'Chào mừng bản cập nhật lớn của Sparkle (Dev)! Nền tảng mạng xã hội Swift chính thức ra mắt, kết hợp trọn vẹn nhịp sống nhanh của Threads/Twitter, bảng tin phong phú của Facebook/Instagram và kênh trò chuyện cộng đồng Discord! 🚀🔥',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    timestamp: '10 phút trước',
    likes: 142,
    retweets: 38,
    tags: ['#SparkleDev', '#SwiftSocial', '#Update'],
    comments: [
      { id: 'c1', user: 'Hoàng Nam', text: 'Giao diện mượt quá ad ơi, thiết kế Mica nhìn rất đã!', time: '8m' },
      { id: 'c2', user: 'Minh Thư', text: 'Thích nhất là có cả kênh Discord tích hợp luôn 😍', time: '5m' }
    ]
  },
  {
    id: 'post-2',
    author: {
      name: 'Linh Đan',
      handle: '@linhdan.photo',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
      verified: true,
      role: 'Creator'
    },
    content: 'Vừa chỉnh xong bộ ảnh chiều hoàng hôn hồ Tây bằng tab Photopea ngay trên Sparkle (Dev). Công nhận mượt mà không kém gì Photoshop trên máy tính luôn! Mọi người thấy màu này ổn không?',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    timestamp: '35 phút trước',
    likes: 89,
    retweets: 12,
    tags: ['#Photopea', '#HaNoi', '#Photography'],
    comments: [
      { id: 'c3', user: 'Tuấn Khôi', text: 'Tone màu ấm đẹp xuất sắc chị ơi!', time: '20m' }
    ]
  },
  {
    id: 'post-3',
    author: {
      name: 'Bếp Nhà Miền Tây',
      handle: '@chef.mientay',
      avatar: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=150&auto=format&fit=crop&q=80'
    },
    content: 'Ai vừa ghé tab Cookbook xem công thức Thịt kho tàu trứng cút nước dừa chưa nào? Tối nay làm ngay một nồi đãi cả nhà nhé, bảo đảm hao cơm cực kỳ 🍲🍚',
    timestamp: '1 giờ trước',
    likes: 64,
    retweets: 9,
    tags: ['#Cookbook', '#MonNgonMoiNgay'],
    comments: []
  }
];

export const SwiftSocial: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'feed' | 'messages' | 'discord' | 'explore'>('feed');
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [newPostText, setNewPostText] = useState<string>('');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  // Messenger State
  const [activeChatUser, setActiveChatUser] = useState<string>('Minh Thư');
  const [messages, setMessages] = useState<Record<string, { sender: string; text: string; time: string }[]>>({
    'Minh Thư': [
      { sender: 'Minh Thư', text: 'Chào bạn! Bạn đã thử tính năng bấm giờ trên Cookbook chưa?', time: '14:20' },
      { sender: 'me', text: 'Mình vừa xem rồi, tiện lợi lắm, có cả nhân tỷ lệ khẩu phần nữa!', time: '14:22' }
    ],
    'Hoàng Nam': [
      { sender: 'Hoàng Nam', text: 'Tối nay 19h nhớ vào tab Watch xem Thời sự VTV1 nha.', time: '13:05' }
    ],
    'Tuấn Khôi': [
      { sender: 'Tuấn Khôi', text: 'Kênh Discord #cong-nghe đang bàn về AI kìa!', time: '11:45' }
    ]
  });
  const [chatInput, setChatInput] = useState<string>('');

  // Discord State
  const [activeChannel, setActiveChannel] = useState<string>('#chung');
  const [channelMessages, setChannelMessages] = useState<Record<string, { user: string; text: string; time: string; avatar: string }[]>>({
    '#chung': [
      { user: 'Sơn Huy', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80', text: 'Chào cả nhà Swift Community!', time: '10:00' },
      { user: 'Anh Kiệt', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80', text: 'Sparkle (Dev) hôm nay update nhiều tab xịn quá', time: '10:02' }
    ],
    '#thao-luan-tv': [
      { user: 'Bích Ngọc', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', text: 'Hôm nay VTV3 có phim mới hay lắm', time: '09:30' }
    ],
    '#am-thuc-cookbook': [
      { user: 'Thanh Hà', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80', text: 'Đang nấu phở theo công thức của app nè!', time: '11:15' }
    ]
  });
  const [discordInput, setDiscordInput] = useState<string>('');

  // Comment input per post
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Handle Post submission
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const newPost: Post = {
      id: `post-${Date.now()}`,
      author: {
        name: 'Người dùng Sparkle (Dev)',
        handle: '@sparkle.user',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: 'Member'
      },
      content: newPostText.trim(),
      timestamp: 'Vừa xong',
      likes: 1,
      retweets: 0,
      tags: ['#Swift'],
      comments: []
    };

    setPosts([newPost, ...posts]);
    setNewPostText('');
  };

  // Toggle reaction
  const handleToggleReaction = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isLiked = p.userReaction === 'love';
          return {
            ...p,
            userReaction: isLiked ? null : 'love',
            likes: isLiked ? p.likes - 1 : p.likes + 1
          };
        }
        return p;
      })
    );
  };

  // Add Comment
  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [
              ...p.comments,
              { id: `c-${Date.now()}`, user: 'Bạn', text, time: 'Vừa xong' }
            ]
          };
        }
        return p;
      })
    );

    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  // Send Direct Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const msg = { sender: 'me', text: chatInput.trim(), time: 'Vừa xong' };
    setMessages((prev) => ({
      ...prev,
      [activeChatUser]: [...(prev[activeChatUser] || []), msg]
    }));
    setChatInput('');
  };

  // Send Discord Message
  const handleSendDiscord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!discordInput.trim()) return;

    const msg = {
      user: 'Bạn',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      text: discordInput.trim(),
      time: 'Vừa xong'
    };
    setChannelMessages((prev) => ({
      ...prev,
      [activeChannel]: [...(prev[activeChannel] || []), msg]
    }));
    setDiscordInput('');
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex flex-col bg-[#f9f9f9] dark:bg-[#1a1c20] text-black dark:text-white select-none">
      {/* Top Banner Navigation */}
      <div className="bg-white dark:bg-[#22252a] border-b border-black/10 dark:border-white/10 px-4 sm:px-6 py-3.5 shrink-0 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FluentSwiftSocialColorIcon className="w-8 h-8 shrink-0 drop-shadow-sm" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  Swift Social
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white text-[10px] font-bold uppercase tracking-wider">
                  All-in-One
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 hidden sm:block">
                Hội tụ nhịp sống Threads, bảng tin Facebook, hình ảnh Instagram, chat Messenger & máy chủ Discord
              </p>
            </div>
          </div>

          {/* Nav Tabs (Pills) */}
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/[0.06] p-1 rounded-full border border-black/10 dark:border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('feed')}
              className={`px-3 sm:px-4 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
                activeTab === 'feed'
                  ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              Bảng tin
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('messages')}
              className={`px-3 sm:px-4 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
                activeTab === 'messages'
                  ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              Tin nhắn
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('discord')}
              className={`px-3 sm:px-4 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
                activeTab === 'discord'
                  ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              Kênh Discord
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl w-full mx-auto p-3 sm:p-5 flex-1 flex flex-col md:flex-row gap-5">
        {/* VIEW 1: MAIN FEED TIMELINE (Threads / Facebook / Instagram style) */}
        {activeTab === 'feed' && (
          <>
            {/* Center Timeline Feed */}
            <div className="flex-1 space-y-4 max-w-2xl mx-auto w-full">
              {/* Instagram Style 24h Stories Carousel */}
              <div className="p-3.5 bg-white dark:bg-[#22252a] rounded-2xl border border-black/10 dark:border-white/10 shadow-xs overflow-x-auto flex items-center gap-3.5">
                {INITIAL_STORIES.map((story) => (
                  <button
                    key={story.id}
                    type="button"
                    onClick={() => setSelectedStory(story)}
                    className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
                  >
                    <div
                      className={`w-14 h-14 rounded-full p-0.5 ${
                        story.hasUnseen
                          ? 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 animate-pulse'
                          : 'bg-neutral-300 dark:bg-neutral-700'
                      }`}
                    >
                      <img
                        src={story.avatar}
                        alt={story.name}
                        className="w-full h-full rounded-full object-cover border-2 border-white dark:border-[#22252a] group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <span className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300 truncate w-14 text-center">
                      {story.name}
                    </span>
                  </button>
                ))}
              </div>

              {/* Post Composer Box (Facebook / Twitter style with pill inputs) */}
              <form
                onSubmit={handleCreatePost}
                className="p-4 bg-white dark:bg-[#22252a] rounded-2xl border border-black/10 dark:border-white/10 shadow-xs space-y-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                    alt="Me"
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                  {/* Pill Input */}
                  <div className="flex-1 h-10 px-4 rounded-full bg-black/5 dark:bg-white/[0.06] border border-black/10 dark:border-white/10 flex items-center focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
                    <input
                      type="text"
                      value={newPostText}
                      onChange={(e) => setNewPostText(e.target.value)}
                      placeholder="Bạn đang nghĩ gì thế? Chia sẻ lên Swift..."
                      className="w-full bg-transparent text-xs sm:text-sm text-neutral-900 dark:text-white placeholder-neutral-400 outline-none border-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5 text-xs text-neutral-500 dark:text-neutral-400">
                  <div className="flex items-center gap-3">
                    <button type="button" className="flex items-center gap-1.5 hover:text-indigo-500 cursor-pointer">
                      <ImageIcon className="w-4 h-4 text-emerald-500" />
                      <span className="hidden sm:inline">Ảnh / Video</span>
                    </button>
                    <button type="button" className="flex items-center gap-1.5 hover:text-indigo-500 cursor-pointer">
                      <Hash className="w-4 h-4 text-sky-500" />
                      <span className="hidden sm:inline">Hashtag</span>
                    </button>
                    <button type="button" className="flex items-center gap-1.5 hover:text-indigo-500 cursor-pointer">
                      <Smile className="w-4 h-4 text-amber-500" />
                      <span className="hidden sm:inline">Cảm xúc</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={!newPostText.trim()}
                    className="px-5 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 disabled:opacity-40 text-white font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Đăng tin
                  </button>
                </div>
              </form>

              {/* Posts Timeline */}
              <div className="space-y-4">
                {posts.map((post) => {
                  const isReacted = post.userReaction === 'love';
                  return (
                    <div
                      key={post.id}
                      className="p-4 sm:p-5 bg-white dark:bg-[#22252a] rounded-2xl border border-black/10 dark:border-white/10 shadow-xs space-y-3.5"
                    >
                      {/* Author Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={post.author.avatar}
                            alt={post.author.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white">
                                {post.author.name}
                              </span>
                              {post.author.verified && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 fill-sky-500 text-white" />
                              )}
                              {post.author.role && (
                                <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 text-[9px] font-bold">
                                  {post.author.role}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                              <span>{post.author.handle}</span>
                              <span>•</span>
                              <span>{post.timestamp}</span>
                            </div>
                          </div>
                        </div>

                        <button type="button" className="text-neutral-400 hover:text-black dark:hover:text-white">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Content */}
                      <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-wrap">
                        {post.content}
                      </p>

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Attached Image */}
                      {post.image && (
                        <div className="rounded-xl overflow-hidden border border-black/5 dark:border-white/5">
                          <img
                            src={post.image}
                            alt="Post attachment"
                            className="w-full max-h-[420px] object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}

                      {/* Reaction and Stats Bar */}
                      <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5 text-xs text-neutral-500 dark:text-neutral-400">
                        {/* Like Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleReaction(post.id)}
                          className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                            isReacted ? 'text-rose-500 font-bold' : 'hover:text-rose-500'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isReacted ? 'fill-rose-500 text-rose-500' : ''}`} />
                          <span>{post.likes}</span>
                        </button>

                        {/* Comments count */}
                        <div className="flex items-center gap-1.5">
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.comments.length}</span>
                        </div>

                        {/* Repost / Retweet */}
                        <div className="flex items-center gap-1.5 hover:text-emerald-500 cursor-pointer">
                          <Repeat2 className="w-4 h-4" />
                          <span>{post.retweets}</span>
                        </div>

                        {/* Share */}
                        <button type="button" className="hover:text-indigo-500 cursor-pointer">
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Comments List */}
                      {post.comments.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/5">
                          {post.comments.map((cm) => (
                            <div key={cm.id} className="p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] text-xs">
                              <span className="font-bold text-neutral-900 dark:text-white mr-1.5">{cm.user}:</span>
                              <span>{cm.text}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add comment pill input */}
                      <div className="flex items-center gap-2 pt-1">
                        <div className="flex-1 h-8 px-3 rounded-full bg-black/5 dark:bg-white/[0.06] border border-black/10 dark:border-white/10 flex items-center">
                          <input
                            type="text"
                            value={commentInputs[post.id] || ''}
                            onChange={(e) =>
                              setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddComment(post.id);
                            }}
                            placeholder="Viết bình luận..."
                            className="w-full bg-transparent text-xs text-neutral-900 dark:text-white placeholder-neutral-400 outline-none border-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddComment(post.id)}
                          className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0 hover:bg-indigo-600 transition-colors cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Sidebar: Trending Topics (#hashtags) */}
            <div className="hidden lg:block w-72 shrink-0 space-y-4">
              <div className="p-4 bg-white dark:bg-[#22252a] rounded-2xl border border-black/10 dark:border-white/10 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  <span>Xu hướng hôm nay</span>
                </div>
                <div className="space-y-2 text-xs">
                  {[
                    { tag: '#VOneDev', posts: '1.2k bài viết' },
                    { tag: '#Cookbook', posts: '850 bài viết' },
                    { tag: '#SwiftSocial', posts: '620 bài viết' },
                    { tag: '#VTV1_ThoiSu', posts: '430 bài viết' },
                    { tag: '#Photopea_Design', posts: '290 bài viết' }
                  ].map((trend) => (
                    <div
                      key={trend.tag}
                      className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <p className="font-bold text-indigo-600 dark:text-indigo-400">{trend.tag}</p>
                      <p className="text-[10px] text-neutral-400">{trend.posts}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* VIEW 2: MESSENGER (Direct Chat) */}
        {activeTab === 'messages' && (
          <div className="flex-1 max-w-4xl mx-auto w-full h-[600px] bg-white dark:bg-[#22252a] rounded-2xl border border-black/10 dark:border-white/10 shadow-sm flex overflow-hidden">
            {/* Conversation list */}
            <div className="w-72 border-r border-black/10 dark:border-white/10 flex flex-col shrink-0">
              <div className="p-3 border-b border-black/10 dark:border-white/10">
                <h3 className="text-sm font-bold">Tin nhắn Swift</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {Object.keys(messages).map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setActiveChatUser(name)}
                    className={`w-full p-2.5 rounded-xl flex items-center gap-3 text-left transition-colors cursor-pointer ${
                      activeChatUser === name
                        ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold'
                        : 'hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {name.slice(0, 2)}
                    </div>
                    <div className="truncate">
                      <p className="text-xs truncate">{name}</p>
                      <p className="text-[10px] text-neutral-400 truncate">
                        {messages[name][messages[name].length - 1]?.text || 'Bắt đầu cuộc trò chuyện'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Box */}
            <div className="flex-1 flex flex-col justify-between">
              {/* Header */}
              <div className="p-3 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
                <span className="text-xs font-bold">{activeChatUser}</span>
                <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Đang hoạt động
                </span>
              </div>

              {/* Messages viewport */}
              <div className="flex-1 p-4 overflow-y-auto space-y-2.5">
                {(messages[activeChatUser] || []).map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-2xl text-xs ${
                        msg.sender === 'me'
                          ? 'bg-gradient-to-r from-indigo-500 to-pink-500 text-white rounded-br-none'
                          : 'bg-black/5 dark:bg-white/10 text-neutral-900 dark:text-white rounded-bl-none'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span className="text-[9px] opacity-70 block text-right mt-1">{msg.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input Pill */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-black/10 dark:border-white/10 flex items-center gap-2">
                <div className="flex-1 h-9 px-4 rounded-full bg-black/5 dark:bg-white/[0.06] border border-black/10 dark:border-white/10 flex items-center">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={`Gửi tin nhắn cho ${activeChatUser}...`}
                    className="w-full bg-transparent text-xs text-neutral-900 dark:text-white outline-none border-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-9 h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0 hover:bg-indigo-600 transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* VIEW 3: DISCORD CHANNELS */}
        {activeTab === 'discord' && (
          <div className="flex-1 max-w-4xl mx-auto w-full h-[600px] bg-white dark:bg-[#22252a] rounded-2xl border border-black/10 dark:border-white/10 shadow-sm flex overflow-hidden">
            {/* Channels Sidebar */}
            <div className="w-64 bg-black/[0.02] dark:bg-white/[0.02] border-r border-black/10 dark:border-white/10 p-3 space-y-4 shrink-0">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  KÊNH VĂN BẢN
                </span>
                <div className="mt-2 space-y-1">
                  {['#chung', '#thao-luan-tv', '#am-thuc-cookbook'].map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setActiveChannel(ch)}
                      className={`w-full px-3 py-1.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
                        activeChannel === ch
                          ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'text-neutral-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      <Hash className="w-3.5 h-3.5" />
                      <span>{ch.replace('#', '')}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  PHÒNG THOẠI (VOICE)
                </span>
                <div className="mt-2 space-y-1">
                  <div className="px-3 py-1.5 rounded-xl text-xs flex items-center justify-between text-neutral-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Phòng Chém Gió 1</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-500 font-bold">4 Live</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Channel Messages */}
            <div className="flex-1 flex flex-col justify-between">
              {/* Header */}
              <div className="p-3 border-b border-black/10 dark:border-white/10 flex items-center gap-2">
                <Hash className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold">{activeChannel}</span>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {(channelMessages[activeChannel] || []).map((cm, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs">
                    <img src={cm.avatar} alt={cm.user} className="w-8 h-8 rounded-full object-cover shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-900 dark:text-white">{cm.user}</span>
                        <span className="text-[10px] text-neutral-400">{cm.time}</span>
                      </div>
                      <p className="text-neutral-800 dark:text-neutral-200 mt-0.5">{cm.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Discord Input Pill */}
              <form onSubmit={handleSendDiscord} className="p-3 border-t border-black/10 dark:border-white/10 flex items-center gap-2">
                <div className="flex-1 h-9 px-4 rounded-full bg-black/5 dark:bg-white/[0.06] border border-black/10 dark:border-white/10 flex items-center">
                  <input
                    type="text"
                    value={discordInput}
                    onChange={(e) => setDiscordInput(e.target.value)}
                    placeholder={`Gửi tin nhắn vào ${activeChannel}...`}
                    className="w-full bg-transparent text-xs text-neutral-900 dark:text-white outline-none border-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-9 h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0 hover:bg-indigo-600 transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Story Fullscreen Preview Modal */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="relative w-full max-w-sm aspect-9/16 bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between p-4 animate-scale-in">
            <img
              src={selectedStory.storyImage}
              alt={selectedStory.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <img src={selectedStory.avatar} alt={selectedStory.name} className="w-8 h-8 rounded-full border border-white" />
                <span className="text-xs font-bold">{selectedStory.name}</span>
                <span className="text-[10px] opacity-70">2h trước</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStory(null)}
                className="w-7 h-7 rounded-full bg-black/40 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Footer */}
            <div className="relative z-10 flex items-center gap-2">
              <div className="flex-1 h-9 px-4 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center">
                <input
                  type="text"
                  placeholder="Gửi tin nhắn..."
                  className="w-full bg-transparent text-xs placeholder-white/70 outline-none border-none text-white"
                />
              </div>
              <button type="button" className="w-9 h-9 rounded-full bg-pink-500 text-white flex items-center justify-center">
                <Heart className="w-4 h-4 fill-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
