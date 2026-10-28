import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Folder, 
  FolderPlus,
  FileText, 
  FileCode, 
  FileSpreadsheet, 
  FileVideo, 
  Image as ImageIcon, 
  Music, 
  Archive, 
  HardDrive, 
  Monitor, 
  Download, 
  Upload, 
  Plus, 
  Trash2, 
  ChevronRight, 
  ArrowLeft, 
  ArrowRight, 
  ArrowUp, 
  RotateCw, 
  LayoutGrid, 
  List as ListIcon, 
  SlidersHorizontal, 
  Share2, 
  Info, 
  Copy, 
  Scissors, 
  ClipboardPaste, 
  Edit3, 
  ExternalLink,
  Check,
  File as FileIcon,
  X
} from 'lucide-react';
import { FluentSearchIcon } from '../components/FluentIcons';

export interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  extension?: string;
  category: 'document' | 'video' | 'audio' | 'image' | 'archive' | 'code' | 'sheet' | 'other';
  size: number; // in bytes
  updatedAt: string;
  parentId: string | null;
  content?: string;
  url?: string;
}

interface FileExplorerProps {
  navigate?: (route: string) => void;
}

const INITIAL_FILES: FileItem[] = [
  // Root / Quick folders
  { id: 'folder-docs', name: 'Documents', type: 'folder', category: 'other', size: 0, updatedAt: '12/10/2026 09:15', parentId: 'this-pc' },
  { id: 'folder-media', name: 'Media Recordings', type: 'folder', category: 'other', size: 0, updatedAt: '12/10/2026 08:30', parentId: 'this-pc' },
  { id: 'folder-playlists', name: 'Playlists M3U', type: 'folder', category: 'other', size: 0, updatedAt: '11/10/2026 18:20', parentId: 'this-pc' },
  { id: 'folder-pictures', name: 'Pictures', type: 'folder', category: 'other', size: 0, updatedAt: '10/10/2026 14:00', parentId: 'this-pc' },
  { id: 'folder-downloads', name: 'Downloads', type: 'folder', category: 'other', size: 0, updatedAt: '12/10/2026 07:45', parentId: 'this-pc' },

  // Inside Documents
  { 
    id: 'file-doc-1', 
    name: 'Ke_hoach_phat_trien_VOne_2026.docx', 
    type: 'file', 
    extension: 'docx', 
    category: 'document', 
    size: 86420, 
    updatedAt: '12/10/2026 09:12', 
    parentId: 'folder-docs',
    content: 'Tài liệu kế hoạch phát triển nền tảng truyền hình trực tuyến Sparkle (Dev) năm 2026.\n- Tích hợp chuẩn giao diện Microsoft Fluent Design.\n- Hỗ trợ xem trực tuyến chuẩn HLS độ trễ thấp.\n- Tích hợp AI Copilot và widgets đa năng.'
  },
  { 
    id: 'file-doc-2', 
    name: 'Lich_phat_song_VTV_HTV_Thang10.xlsx', 
    type: 'file', 
    extension: 'xlsx', 
    category: 'sheet', 
    size: 59392, 
    updatedAt: '11/10/2026 16:40', 
    parentId: 'folder-docs',
    content: 'Bảng tổng hợp lịch phát sóng chi tiết tháng 10 của các kênh VTV1, VTV2, VTV3, HTV7, HTV9, SCTV.'
  },
  { 
    id: 'file-doc-3', 
    name: 'Ghi_chu_thao_luan_cuoc_hop.txt', 
    type: 'file', 
    extension: 'txt', 
    category: 'document', 
    size: 4210, 
    updatedAt: '12/10/2026 08:05', 
    parentId: 'folder-docs',
    content: '1. Thêm ứng dụng File Explorer và MS Paint vào hệ sinh thái Sparkle (Dev).\n2. Cập nhật icon mic dạng outline không fill.\n3. Đảm bảo tab Widgets luôn hiển thị và hỗ trợ unlimited scrolling.'
  },

  // Inside Media Recordings
  { 
    id: 'file-media-1', 
    name: 'Thoi_su_19h_12_10_2026.mp4', 
    type: 'file', 
    extension: 'mp4', 
    category: 'video', 
    size: 362489000, 
    updatedAt: '12/10/2026 19:45', 
    parentId: 'folder-media',
    url: 'https://vcdn1-vnexpress.vnecdn.net/2026/10/12/thoi_su_sample.mp4'
  },
  { 
    id: 'file-media-2', 
    name: 'Chao_buoi_sang_VTV1_HD.mp4', 
    type: 'file', 
    extension: 'mp4', 
    category: 'video', 
    size: 215890000, 
    updatedAt: '12/10/2026 06:30', 
    parentId: 'folder-media'
  },

  // Inside Playlists M3U
  { 
    id: 'file-m3u-1', 
    name: 'vone_official_channels.m3u8', 
    type: 'file', 
    extension: 'm3u8', 
    category: 'code', 
    size: 145320, 
    updatedAt: '12/10/2026 09:00', 
    parentId: 'folder-playlists',
    content: '#EXTM3U\n#EXTINF:-1 tvg-id="VTV1" tvg-name="VTV1 HD" tvg-logo="https://example.com/vtv1.png" group-title="VTV",VTV1 HD\nhttps://example.com/vtv1/index.m3u8\n#EXTINF:-1 tvg-id="VTV3" tvg-name="VTV3 HD" group-title="VTV",VTV3 HD\nhttps://example.com/vtv3/index.m3u8'
  },
  { 
    id: 'file-m3u-2', 
    name: 'vov_radio_streams.m3u', 
    type: 'file', 
    extension: 'm3u', 
    category: 'code', 
    size: 32100, 
    updatedAt: '10/10/2026 11:20', 
    parentId: 'folder-playlists',
    content: '#EXTM3U\n#EXTINF:-1,VOV1 Tin Tức Thời Sự\nhttps://stream.vov.vn/vov1.aac\n#EXTINF:-1,VOV Giao Thông Hà Nội 91MHz\nhttps://stream.vov.vn/vovgt-hn.aac'
  },

  // Inside Pictures
  { 
    id: 'file-pic-1', 
    name: 'vone_fluent_wallpaper.png', 
    type: 'file', 
    extension: 'png', 
    category: 'image', 
    size: 1845000, 
    updatedAt: '10/10/2026 14:00', 
    parentId: 'folder-pictures',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
  },
  { 
    id: 'file-pic-2', 
    name: 'hanoi_autumn_morning.jpg', 
    type: 'file', 
    extension: 'jpg', 
    category: 'image', 
    size: 2450000, 
    updatedAt: '09/10/2026 10:15', 
    parentId: 'folder-pictures',
    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80'
  },

  // Inside Downloads
  { 
    id: 'file-dl-1', 
    name: 'Craftmine_World_Save.dat', 
    type: 'file', 
    extension: 'dat', 
    category: 'archive', 
    size: 2936000, 
    updatedAt: '08/10/2026 21:00', 
    parentId: 'folder-downloads'
  },
  { 
    id: 'file-dl-2', 
    name: 'Weather_Forecast_Feed.json', 
    type: 'file', 
    extension: 'json', 
    category: 'code', 
    size: 14200, 
    updatedAt: '12/10/2026 07:30', 
    parentId: 'folder-downloads',
    content: '{\n  "location": "Ha Noi, Vietnam",\n  "temp": 28,\n  "condition": "Nắng nhẹ",\n  "humidity": 65,\n  "uv": 6\n}'
  }
];

function formatBytes(bytes: number) {
  if (bytes === 0) return '--';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export const FileExplorer: React.FC<FileExplorerProps> = ({ navigate }) => {
  const [files, setFiles] = useState<FileItem[]>(INITIAL_FILES);
  const [currentFolderId, setCurrentFolderId] = useState<string>('this-pc');
  const [history, setHistory] = useState<string[]>(['this-pc']);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'details' | 'list'>('details');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('name');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Navigation history handler
  const navigateToFolder = (folderId: string) => {
    if (folderId === currentFolderId) return;
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(folderId);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentFolderId(folderId);
    setSelectedFileId(null);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentFolderId(history[newIndex]);
      setSelectedFileId(null);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentFolderId(history[newIndex]);
      setSelectedFileId(null);
    }
  };

  const handleUpLevel = () => {
    if (currentFolderId === 'this-pc') return;
    const currentFolder = files.find(f => f.id === currentFolderId);
    if (currentFolder && currentFolder.parentId) {
      navigateToFolder(currentFolder.parentId);
    } else {
      navigateToFolder('this-pc');
    }
  };

  // Breadcrumb path construction
  const breadcrumbItems = useMemo(() => {
    if (currentFolderId === 'this-pc') {
      return [{ id: 'this-pc', name: 'This PC' }];
    }
    const path: { id: string; name: string }[] = [];
    let curr: string | null = currentFolderId;
    while (curr && curr !== 'this-pc') {
      const found = files.find(f => f.id === curr);
      if (found) {
        path.unshift({ id: found.id, name: found.name });
        curr = found.parentId;
      } else {
        break;
      }
    }
    path.unshift({ id: 'this-pc', name: 'This PC' });
    return path;
  }, [currentFolderId, files]);

  // Filtered files in current view
  const currentFiles = useMemo(() => {
    let list = files.filter(f => f.parentId === currentFolderId);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = files.filter(f => f.name.toLowerCase().includes(q));
    }

    return list.sort((a, b) => {
      // Folders always first
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      let cmp = 0;
      if (sortBy === 'name') {
        cmp = a.name.localeCompare(b.name);
      } else if (sortBy === 'date') {
        cmp = a.updatedAt.localeCompare(b.updatedAt);
      } else if (sortBy === 'size') {
        cmp = a.size - b.size;
      } else if (sortBy === 'type') {
        cmp = (a.extension || '').localeCompare(b.extension || '');
      }
      return sortAsc ? cmp : -cmp;
    });
  }, [files, currentFolderId, searchQuery, sortBy, sortAsc]);

  const selectedFile = useMemo(() => {
    return files.find(f => f.id === selectedFileId) || null;
  }, [files, selectedFileId]);

  // "Name your folder" Modal Dialog state
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('New folder');
  const folderInputRef = useRef<HTMLInputElement>(null);

  const openCreateFolderDialog = () => {
    setNewFolderName('New folder');
    setIsNewFolderOpen(true);
    setTimeout(() => {
      folderInputRef.current?.focus();
      folderInputRef.current?.select();
    }, 60);
  };

  const handleConfirmCreateFolder = () => {
    const finalName = newFolderName.trim() || 'New folder';
    const newFolder: FileItem = {
      id: `folder-${Date.now()}`,
      name: finalName,
      type: 'folder',
      category: 'other',
      size: 0,
      updatedAt: new Date().toLocaleString('vi-VN'),
      parentId: currentFolderId
    };
    setFiles(prev => [...prev, newFolder]);
    setSelectedFileId(newFolder.id);
    setIsNewFolderOpen(false);
    showToast(`Đã tạo thư mục "${finalName}"`);
  };

  const handleCreateTextFile = () => {
    const name = prompt('Nhập tên tệp văn bản mới:', 'Ghi_chu_moi.txt');
    if (!name || !name.trim()) return;
    const finalName = name.endsWith('.txt') ? name.trim() : `${name.trim()}.txt`;
    const newFile: FileItem = {
      id: `file-${Date.now()}`,
      name: finalName,
      type: 'file',
      extension: 'txt',
      category: 'document',
      size: 120,
      updatedAt: new Date().toLocaleString('vi-VN'),
      parentId: currentFolderId,
      content: 'Nội dung tài liệu mới được tạo trong Sparkle (Dev) File Explorer.'
    };
    setFiles(prev => [...prev, newFile]);
    setSelectedFileId(newFile.id);
    showToast(`Đã tạo tệp "${finalName}"`);
  };

  const handleDeleteItem = () => {
    if (!selectedFileId) return;
    const target = files.find(f => f.id === selectedFileId);
    if (!target) return;
    if (confirm(`Bạn có chắc muốn xoá "${target.name}"?`)) {
      setFiles(prev => prev.filter(f => f.id !== selectedFileId && f.parentId !== selectedFileId));
      setSelectedFileId(null);
      showToast(`Đã xoá "${target.name}"`);
    }
  };

  const handleRenameItem = () => {
    if (!selectedFileId) return;
    const target = files.find(f => f.id === selectedFileId);
    if (!target) return;
    const newName = prompt('Đổi tên tệp / thư mục:', target.name);
    if (!newName || !newName.trim() || newName === target.name) return;
    setFiles(prev => prev.map(f => f.id === selectedFileId ? { ...f, name: newName.trim() } : f));
    showToast(`Đã đổi tên thành "${newName.trim()}"`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;
    const newItems: FileItem[] = [];

    Array.from(uploadedFiles).forEach((f: File) => {
      const ext = f.name.split('.').pop()?.toLowerCase() || '';
      let cat: FileItem['category'] = 'other';
      if (['jpg', 'jpeg', 'png', 'svg', 'webp', 'gif'].includes(ext)) cat = 'image';
      else if (['mp4', 'mkv', 'webm', 'mov'].includes(ext)) cat = 'video';
      else if (['mp3', 'wav', 'aac', 'flac'].includes(ext)) cat = 'audio';
      else if (['txt', 'docx', 'pdf', 'doc'].includes(ext)) cat = 'document';
      else if (['xlsx', 'csv', 'xls'].includes(ext)) cat = 'sheet';
      else if (['m3u', 'm3u8', 'json', 'ts', 'js'].includes(ext)) cat = 'code';

      newItems.push({
        id: `upload-${Date.now()}-${Math.random()}`,
        name: f.name,
        type: 'file',
        extension: ext,
        category: cat,
        size: f.size,
        updatedAt: new Date().toLocaleString('vi-VN'),
        parentId: currentFolderId,
        content: `Tệp tải lên từ hệ thống: ${f.name} (${formatBytes(f.size)})`
      });
    });

    setFiles(prev => [...prev, ...newItems]);
    showToast(`Đã tải lên ${newItems.length} tệp`);
    if (e.target) e.target.value = '';
  };

  const handleDownloadFile = (file: FileItem) => {
    const content = file.content || `File content of ${file.name}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Đang tải xuống "${file.name}"`);
  };

const FOLDER_WIN10_ICON_URL = 'https://winaero.com/blog/wp-content/uploads/2014/12/folder_win10.png';

  const renderFileIcon = (item: FileItem, sizeClass = 'w-5 h-5') => {
    if (item.type === 'folder') {
      return <img src={FOLDER_WIN10_ICON_URL} alt="Folder" className={`${sizeClass} object-contain shrink-0`} />;
    }
    switch (item.category) {
      case 'video':
        return <FileVideo className={`${sizeClass} text-purple-500`} />;
      case 'sheet':
        return <FileSpreadsheet className={`${sizeClass} text-emerald-500`} />;
      case 'image':
        return <ImageIcon className={`${sizeClass} text-sky-500`} />;
      case 'audio':
        return <Music className={`${sizeClass} text-pink-500`} />;
      case 'code':
        return <FileCode className={`${sizeClass} text-blue-500`} />;
      case 'archive':
        return <Archive className={`${sizeClass} text-amber-600`} />;
      case 'document':
      default:
        return <FileText className={`${sizeClass} text-[#0078d4] dark:text-[#4cc2ff]`} />;
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex flex-col bg-transparent text-[#111827] dark:text-[#f3f4f6] select-none font-sans">
      {/* Tab Title: Explore (Font Regular, shifted down slightly) */}
      <div className="px-4 sm:px-6 pt-3 pb-2">
        <h1 className="text-2xl sm:text-3xl font-normal text-white tracking-tight">
          Explore
        </h1>
      </div>

      {/* 1. Windows 11 Fluent Command Bar / Ribbon */}
      <div className="h-12 px-3 sm:px-4 border-b border-black/10 dark:border-white/10 bg-white/70 dark:bg-[#202429]/70 backdrop-blur-xl flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          {/* New Item Dropdown */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={openCreateFolderDialog}
              className="px-2.5 py-1.5 rounded-[6px] hover:bg-black/5 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/15 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-[#111827] dark:text-white"
              title="Create new folder"
            >
              <FolderPlus className="w-4 h-4 text-[#e3008c]" />
              <span className="hidden sm:inline">Create new folder</span>
            </button>
            <button
              type="button"
              onClick={handleCreateTextFile}
              className="px-2 py-1.5 rounded-[6px] hover:bg-black/5 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/15 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer text-neutral-600 dark:text-neutral-300"
              title="Tạo tệp văn bản"
            >
              <FileIcon className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Tệp mới</span>
            </button>
          </div>

          <div className="h-5 w-[1px] bg-black/10 dark:bg-white/10 mx-1" />

          {/* Edit Actions: Cut, Copy, Rename, Delete */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={handleRenameItem}
              disabled={!selectedFileId}
              className="p-1.5 rounded-[6px] hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer text-neutral-700 dark:text-neutral-300"
              title="Đổi tên (Rename)"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleDeleteItem}
              disabled={!selectedFileId}
              className="p-1.5 rounded-[6px] hover:bg-rose-500/10 text-neutral-700 hover:text-rose-600 dark:text-neutral-300 dark:hover:text-rose-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Xoá (Delete)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            {selectedFile && selectedFile.type === 'file' && (
              <button
                type="button"
                onClick={() => handleDownloadFile(selectedFile)}
                className="p-1.5 rounded-[6px] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer text-[#0078d4] dark:text-[#4cc2ff]"
                title="Tải xuống tệp này"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="h-5 w-[1px] bg-black/10 dark:bg-white/10 mx-1" />

          {/* Upload Button */}
          <label className="px-2.5 py-1.5 rounded-[6px] hover:bg-black/5 dark:hover:bg-white/10 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer text-neutral-700 dark:text-neutral-300">
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tải lên</span>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* View Options & Sort */}
        <div className="flex items-center gap-1">
          {/* Sort Selector */}
          <button
            type="button"
            onClick={() => {
              if (sortBy === 'name') setSortBy('date');
              else if (sortBy === 'date') setSortBy('size');
              else if (sortBy === 'size') setSortBy('name');
            }}
            className="px-2 py-1 rounded-[6px] hover:bg-black/5 dark:hover:bg-white/10 text-xs text-neutral-600 dark:text-neutral-300 flex items-center gap-1 transition-colors cursor-pointer"
            title={`Sắp xếp: ${sortBy === 'name' ? 'Tên' : sortBy === 'date' ? 'Ngày' : 'Dung lượng'}`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline capitalize">{sortBy}</span>
          </button>

          {/* View Mode Toggle: Grid / Details */}
          <div className="flex items-center bg-black/5 dark:bg-white/5 p-0.5 rounded-[6px] border border-black/5 dark:border-white/5">
            <button
              type="button"
              onClick={() => setViewMode('details')}
              className={`p-1 rounded-[4px] transition-colors cursor-pointer ${
                viewMode === 'details' ? 'bg-white dark:bg-[#33373d] shadow-2xs text-[#0078d4] dark:text-[#4cc2ff]' : 'text-neutral-500'
              }`}
              title="Chế độ chi tiết (Details)"
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded-[4px] transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white dark:bg-[#33373d] shadow-2xs text-[#0078d4] dark:text-[#4cc2ff]' : 'text-neutral-500'
              }`}
              title="Chế độ lưới icon (Grid)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsPreviewOpen(prev => !prev)}
            className={`p-1.5 rounded-[6px] transition-colors cursor-pointer ${
              isPreviewOpen ? 'bg-[#0078d4]/10 text-[#0078d4] dark:text-[#4cc2ff]' : 'text-neutral-500 hover:bg-black/5 dark:hover:bg-white/10'
            }`}
            title="Bảng xem trước (Preview Pane)"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Breadcrumb Navigation & Search Bar */}
      <div className="h-10 px-3 sm:px-4 border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] flex items-center gap-2 shrink-0">
        {/* Navigation Arrows */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={handleBack}
            disabled={historyIndex <= 0}
            className="p-1 rounded-[4px] hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer text-neutral-600 dark:text-neutral-300"
            title="Quay lại (Alt + Left)"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleForward}
            disabled={historyIndex >= history.length - 1}
            className="p-1 rounded-[4px] hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer text-neutral-600 dark:text-neutral-300"
            title="Tiến lên (Alt + Right)"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleUpLevel}
            disabled={currentFolderId === 'this-pc'}
            className="p-1 rounded-[4px] hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer text-neutral-600 dark:text-neutral-300"
            title="Lên thư mục cha (Alt + Up)"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => showToast('Đã làm mới danh sách tệp')}
            className="p-1 rounded-[4px] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer text-neutral-600 dark:text-neutral-300"
            title="Làm mới (F5)"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Address Bar Breadcrumbs */}
        <div className="flex-1 h-7 px-2.5 rounded-[6px] bg-white dark:bg-[#1b1f24] border border-black/10 dark:border-white/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar shadow-2xs">
          <Monitor className="w-3.5 h-3.5 text-[#0078d4] dark:text-[#4cc2ff] shrink-0" />
          {breadcrumbItems.map((item, idx) => (
            <React.Fragment key={item.id}>
              {idx > 0 && <ChevronRight className="w-3 h-3 text-neutral-400 shrink-0" />}
              <button
                type="button"
                onClick={() => navigateToFolder(item.id)}
                className={`text-xs hover:underline truncate cursor-pointer transition-colors ${
                  idx === breadcrumbItems.length - 1
                    ? 'font-semibold text-[#111827] dark:text-white'
                    : 'text-neutral-500 dark:text-neutral-400'
                }`}
              >
                {item.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Search within Current Folder */}
        <div className="group relative w-44 sm:w-64 h-7 px-2.5 rounded-none windows-search-box flex items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Tìm trong ${breadcrumbItems[breadcrumbItems.length - 1]?.name}...`}
            className="w-full bg-transparent text-xs outline-none pr-6"
          />
          <FluentSearchIcon className="w-3.5 h-3.5 shrink-0 pointer-events-none absolute right-2" />
        </div>
      </div>

      {/* 3. Main Split View (Navigation Pane + Content Area + Preview Pane) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Pane (Quick Access & Drives) */}
        <aside className="w-52 sm:w-60 border-r border-black/10 dark:border-white/10 bg-white/40 dark:bg-[#1b1f24]/40 backdrop-blur-md p-2 space-y-3 overflow-y-auto shrink-0 hidden md:block">
          <div>
            <div className="px-2 py-1 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              Quick access
            </div>
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => navigateToFolder('this-pc')}
                className={`w-full px-2 py-1.5 rounded-[6px] flex items-center gap-2 text-xs transition-colors cursor-pointer text-left ${
                  currentFolderId === 'this-pc'
                    ? 'bg-[#0078d4]/10 text-[#0078d4] dark:text-[#4cc2ff] font-semibold'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <Monitor className="w-4 h-4 text-[#0078d4]" />
                <span className="truncate">This PC</span>
              </button>
              <button
                type="button"
                onClick={() => navigateToFolder('folder-docs')}
                className={`w-full px-2 py-1.5 rounded-[6px] flex items-center gap-2 text-xs transition-colors cursor-pointer text-left ${
                  currentFolderId === 'folder-docs'
                    ? 'bg-[#0078d4]/10 text-[#0078d4] dark:text-[#4cc2ff] font-semibold'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <FileText className="w-4 h-4 text-blue-500" />
                <span className="truncate">Documents</span>
              </button>
              <button
                type="button"
                onClick={() => navigateToFolder('folder-media')}
                className={`w-full px-2 py-1.5 rounded-[6px] flex items-center gap-2 text-xs transition-colors cursor-pointer text-left ${
                  currentFolderId === 'folder-media'
                    ? 'bg-[#0078d4]/10 text-[#0078d4] dark:text-[#4cc2ff] font-semibold'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <FileVideo className="w-4 h-4 text-purple-500" />
                <span className="truncate">Media Recordings</span>
              </button>
              <button
                type="button"
                onClick={() => navigateToFolder('folder-playlists')}
                className={`w-full px-2 py-1.5 rounded-[6px] flex items-center gap-2 text-xs transition-colors cursor-pointer text-left ${
                  currentFolderId === 'folder-playlists'
                    ? 'bg-[#0078d4]/10 text-[#0078d4] dark:text-[#4cc2ff] font-semibold'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <FileCode className="w-4 h-4 text-emerald-500" />
                <span className="truncate">Playlists M3U</span>
              </button>
              <button
                type="button"
                onClick={() => navigateToFolder('folder-pictures')}
                className={`w-full px-2 py-1.5 rounded-[6px] flex items-center gap-2 text-xs transition-colors cursor-pointer text-left ${
                  currentFolderId === 'folder-pictures'
                    ? 'bg-[#0078d4]/10 text-[#0078d4] dark:text-[#4cc2ff] font-semibold'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <ImageIcon className="w-4 h-4 text-sky-500" />
                <span className="truncate">Pictures</span>
              </button>
              <button
                type="button"
                onClick={() => navigateToFolder('folder-downloads')}
                className={`w-full px-2 py-1.5 rounded-[6px] flex items-center gap-2 text-xs transition-colors cursor-pointer text-left ${
                  currentFolderId === 'folder-downloads'
                    ? 'bg-[#0078d4]/10 text-[#0078d4] dark:text-[#4cc2ff] font-semibold'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <Download className="w-4 h-4 text-amber-500" />
                <span className="truncate">Downloads</span>
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-black/5 dark:border-white/5">
            <div className="px-2 py-1 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              Drives & Storage
            </div>
            <div className="space-y-1">
              <div className="p-2 rounded-[6px] bg-black/[0.03] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <HardDrive className="w-4 h-4 text-[#0078d4]" />
                  <span>Local Disk (C:)</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                  <div className="h-full bg-[#0078d4] rounded-full" style={{ width: '42%' }} />
                </div>
                <div className="text-[10px] text-neutral-500">214 GB free of 512 GB</div>
              </div>

              <div className="p-2 rounded-[6px] bg-black/[0.03] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <HardDrive className="w-4 h-4 text-emerald-500" />
                  <span>Media Storage (D:)</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '68%' }} />
                </div>
                <div className="text-[10px] text-neutral-500">320 GB free of 1 TB</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Center File List / Grid Area */}
        <main
          className="flex-1 overflow-y-auto p-3 sm:p-4 bg-transparent"
          onClick={() => setSelectedFileId(null)}
        >
          {currentFiles.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-neutral-400 gap-2">
              <img src={FOLDER_WIN10_ICON_URL} alt="Folder" className="w-12 h-12 object-contain opacity-70" />
              <p className="text-xs">Thư mục này hiện đang trống</p>
              <button
                type="button"
                onClick={openCreateFolderDialog}
                className="mt-1 px-3 py-1.5 rounded-[6px] bg-[#e3008c] hover:bg-[#d0007f] text-white text-xs font-medium cursor-pointer transition-colors"
              >
                Create new folder
              </button>
            </div>
          ) : viewMode === 'details' ? (
            <div className="w-full text-xs">
              {/* Header row */}
              <div className="grid grid-cols-12 gap-2 pb-2 border-b border-black/10 dark:border-white/10 text-neutral-400 dark:text-neutral-500 font-semibold px-2 select-none">
                <div className="col-span-6 sm:col-span-5 flex items-center gap-1 cursor-pointer" onClick={() => { setSortBy('name'); setSortAsc(!sortAsc); }}>
                  <span>Tên</span>
                </div>
                <div className="col-span-3 sm:col-span-4 cursor-pointer" onClick={() => { setSortBy('date'); setSortAsc(!sortAsc); }}>
                  <span>Ngày sửa đổi</span>
                </div>
                <div className="col-span-3 sm:col-span-3 text-right cursor-pointer" onClick={() => { setSortBy('size'); setSortAsc(!sortAsc); }}>
                  <span>Dung lượng</span>
                </div>
              </div>

              {/* Items rows */}
              <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04] mt-1">
                {currentFiles.map((item) => {
                  const isSelected = selectedFileId === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFileId(item.id);
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        if (item.type === 'folder') {
                          navigateToFolder(item.id);
                        } else {
                          // Preview file or open with app
                          setIsPreviewOpen(true);
                        }
                      }}
                      className={`grid grid-cols-12 gap-2 items-center py-2 px-2 rounded-[6px] transition-colors cursor-pointer select-none ${
                        isSelected
                          ? 'bg-[#0078d4]/15 dark:bg-[#4cc2ff]/20 text-[#0078d4] dark:text-[#4cc2ff]'
                          : 'hover:bg-black/5 dark:hover:bg-white/5 text-[#111827] dark:text-[#f3f4f6]'
                      }`}
                    >
                      <div className="col-span-6 sm:col-span-5 flex items-center gap-2.5 min-w-0">
                        {renderFileIcon(item, 'w-4 h-4 shrink-0')}
                        <span className="truncate font-medium">{item.name}</span>
                      </div>
                      <div className="col-span-3 sm:col-span-4 text-neutral-500 truncate text-[11px]">
                        {item.updatedAt}
                      </div>
                      <div className="col-span-3 sm:col-span-3 text-right text-neutral-500 font-mono text-[11px]">
                        {item.type === 'folder' ? '--' : formatBytes(item.size)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Grid View Mode */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {currentFiles.map((item) => {
                const isSelected = selectedFileId === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFileId(item.id);
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      if (item.type === 'folder') {
                        navigateToFolder(item.id);
                      } else {
                        setIsPreviewOpen(true);
                      }
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-[8px] border transition-all cursor-pointer text-center gap-2 ${
                      isSelected
                        ? 'bg-[#0078d4]/10 dark:bg-[#4cc2ff]/15 border-[#0078d4]/40 dark:border-[#4cc2ff]/40 shadow-xs'
                        : 'bg-white/60 dark:bg-[#22252a]/60 border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/10'
                    }`}
                  >
                    <div className="w-12 h-12 flex items-center justify-center">
                      {renderFileIcon(item, 'w-10 h-10')}
                    </div>
                    <div className="w-full">
                      <div className="text-xs font-medium truncate text-[#111827] dark:text-white" title={item.name}>
                        {item.name}
                      </div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">
                        {item.type === 'folder' ? 'Folder' : formatBytes(item.size)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* Right Preview Pane */}
        {isPreviewOpen && selectedFile && (
          <aside className="w-64 sm:w-72 border-l border-black/10 dark:border-white/10 bg-white/70 dark:bg-[#1f2328]/70 backdrop-blur-xl p-4 flex flex-col justify-between shrink-0 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex flex-col items-center text-center p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
                <div className="w-16 h-16 flex items-center justify-center my-2">
                  {renderFileIcon(selectedFile, 'w-14 h-14')}
                </div>
                <h4 className="text-sm font-bold text-[#111827] dark:text-white break-all">
                  {selectedFile.name}
                </h4>
                <span className="text-[11px] text-neutral-400 uppercase mt-0.5">
                  {selectedFile.type === 'folder' ? 'File Folder' : `${selectedFile.extension?.toUpperCase()} File`}
                </span>
              </div>

              {/* Preview Content Preview (for Text / Image / Media) */}
              {selectedFile.url && selectedFile.category === 'image' && (
                <div className="rounded-lg overflow-hidden border border-black/10 dark:border-white/10 max-h-40">
                  <img
                    src={selectedFile.url}
                    alt={selectedFile.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {selectedFile.content && (
                <div className="p-2.5 rounded-lg bg-black/[0.04] dark:bg-white/[0.04] border border-black/5 dark:border-white/5 space-y-1">
                  <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                    Xem trước văn bản
                  </div>
                  <pre className="text-[11px] text-[#374151] dark:text-[#d1d5db] font-mono whitespace-pre-wrap line-clamp-6 leading-relaxed">
                    {selectedFile.content}
                  </pre>
                </div>
              )}

              {/* File Metadata Info */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-black/5 dark:border-white/5">
                  <span className="text-neutral-500">Dung lượng</span>
                  <span className="font-mono font-medium">{formatBytes(selectedFile.size)}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-black/5 dark:border-white/5">
                  <span className="text-neutral-500">Chỉnh sửa</span>
                  <span className="font-medium">{selectedFile.updatedAt}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-black/5 dark:border-white/5">
                  <span className="text-neutral-500">Vị trí</span>
                  <span className="font-medium truncate max-w-[120px]">{currentFolderId}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions for Selected File */}
            <div className="pt-4 border-t border-black/10 dark:border-white/10 flex flex-col gap-2">
              {selectedFile.type === 'file' && (
                <button
                  type="button"
                  onClick={() => handleDownloadFile(selectedFile)}
                  className="w-full py-2 rounded-[6px] bg-[#0078d4] dark:bg-[#4cc2ff] text-white dark:text-black font-semibold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải xuống tệp</span>
                </button>
              )}
              {selectedFile.category === 'code' && selectedFile.name.includes('m3u') && navigate && (
                <button
                  type="button"
                  onClick={() => navigate('/live-tv')}
                  className="w-full py-1.5 rounded-[6px] border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Mở trong Watch</span>
                </button>
              )}
              {selectedFile.category === 'document' && navigate && (
                <button
                  type="button"
                  onClick={() => navigate('/notes')}
                  className="w-full py-1.5 rounded-[6px] border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Mở trong Notes</span>
                </button>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* 4. Bottom Status Bar */}
      <footer className="h-6 px-3 border-t border-black/10 dark:border-white/10 bg-white/50 dark:bg-[#1b1f24]/50 backdrop-blur-md flex items-center justify-between text-[11px] text-neutral-500 shrink-0">
        <div>
          {currentFiles.length} mục {selectedFileId && `• 1 mục đã chọn (${selectedFile?.name})`}
        </div>
        <div className="flex items-center gap-3">
          <span>File Explorer • Sparkle (Dev)</span>
        </div>
      </footer>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-8 right-6 z-50 px-3.5 py-2 rounded-lg bg-[#111827] dark:bg-white text-white dark:text-black text-xs font-medium shadow-xl flex items-center gap-2 animate-bounce">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* "Name your folder" Modal Dialog - Microsoft Fluent UWP ContentDialog */}
      <AnimatePresence>
        {isNewFolderOpen && (
          <motion.div
            key="new-folder-dialog-container"
            id="new-folder-dialog-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-6 select-none"
          >
            {/* Backdrop */}
            <motion.div
              id="new-folder-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              onClick={() => setIsNewFolderOpen(false)}
              className="fixed inset-0 bg-black/60"
            />

            {/* Dialog Modal Box with Fluent enter/exit scale animation */}
            <motion.div
              id="new-folder-dialog"
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                transition: {
                  duration: 0.22,
                  ease: [0.1, 0.9, 0.2, 1],
                },
              }}
              exit={{
                opacity: 0,
                scale: 0.92,
                y: 8,
                transition: {
                  duration: 0.16,
                  ease: 'easeIn',
                },
              }}
              className="fluent-modal-dialog relative z-10 w-full max-w-[480px] bg-white dark:bg-black text-[#1a1a1a] dark:text-white rounded-none shadow-[0_16px_40px_rgba(0,0,0,0.65)] border border-[#e3008c] overflow-hidden"
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleConfirmCreateFolder();
                }}
              >
                <div className="px-6 pt-6 pb-3 space-y-3">
                  <div>
                    <h2
                      id="new-folder-dialog-title"
                      className="text-[20px] font-normal text-neutral-900 dark:text-white tracking-tight leading-snug"
                    >
                      Name your folder
                    </h2>
                    <p className="text-[13.5px] text-neutral-700 dark:text-neutral-300 leading-normal mt-1 font-normal">
                      Enter a name for the new folder in {currentFolderId === 'this-pc' ? 'This PC' : currentFolderId}:
                    </p>
                  </div>

                  <div className="pt-1">
                    {/* Search box design identical to TopBar search bar */}
                    <div
                      id="new-folder-search-box"
                      className="fluent-search-box windows-search-box group relative w-full h-8.5 sm:h-9 rounded-none flex items-center px-2.5 gap-1.5 transition-all cursor-text select-none"
                    >
                      <input
                        ref={folderInputRef}
                        type="text"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            e.stopPropagation();
                            setIsNewFolderOpen(false);
                          }
                        }}
                        className="w-full bg-transparent text-xs sm:text-[13px] text-[#111827] dark:text-white placeholder-[#71717a] dark:placeholder-[#a0a6b2] outline-none border-none py-1 pl-1 pr-16 no-fluent-line"
                        placeholder="Folder name"
                        maxLength={80}
                        autoFocus
                      />

                      {/* Right Action Icons: Clear button and Right Search Icon matching TopBar */}
                      <div className="absolute right-2 flex items-center gap-1 z-10">
                        {newFolderName ? (
                          <button
                            type="button"
                            onClick={() => {
                              setNewFolderName('');
                              folderInputRef.current?.focus();
                            }}
                            title="Clear"
                            className="text-[#71717a] dark:text-neutral-300 hover:text-[#111827] dark:hover:text-white p-1 transition-colors cursor-pointer rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        ) : null}

                        <button
                          type="submit"
                          title="Create folder"
                          className="p-1 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                        >
                          <FluentSearchIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Flat gray rectangular buttons - 32px height UWP */}
                <div className="fluent-modal-footer px-6 pt-4 pb-6 flex items-center justify-end gap-2">
                  <button
                    type="submit"
                    className="fluent-btn-primary min-w-[88px] h-[32px] px-4 bg-[#cccccc] dark:bg-[#383838] text-black dark:text-white hover:bg-[#d6d6d6] dark:hover:bg-[#454545] active:bg-[#b8b8b8] dark:active:bg-[#262626] rounded-none text-[13px] font-normal transition-colors cursor-pointer border-0 inline-flex items-center justify-center"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsNewFolderOpen(false)}
                    className="fluent-btn-secondary min-w-[88px] h-[32px] px-4 bg-[#cccccc] dark:bg-[#383838] text-black dark:text-white hover:bg-[#d6d6d6] dark:hover:bg-[#454545] active:bg-[#b8b8b8] dark:active:bg-[#262626] rounded-none text-[13px] font-normal transition-colors cursor-pointer border-0 inline-flex items-center justify-center"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
