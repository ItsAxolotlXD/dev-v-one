import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  QrCode, 
  PiggyBank, 
  Receipt, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Search, 
  Plus, 
  ArrowRight, 
  RefreshCw, 
  SlidersHorizontal, 
  Lock, 
  Unlock, 
  Smartphone, 
  Tv, 
  Zap, 
  Droplet, 
  Wifi, 
  Download, 
  Share2, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Clock, 
  Calendar,
  X,
  Sparkles,
  ChevronRight,
  Filter,
  DollarSign
} from 'lucide-react';
import { FluentSwiftBankIcon, FluentSwiftBankColorIcon } from '../components/FluentIcons';

interface BankAccount {
  accountNumber: string;
  accountName: string;
  balance: number;
  availableBalance: number;
  currency: string;
  swiftPoints: number;
  tier: string;
}

interface Transaction {
  id: string;
  type: 'transfer_out' | 'transfer_in' | 'bill_pay' | 'savings_deposit' | 'cashback';
  amount: number;
  senderName: string;
  receiverName: string;
  receiverBank: string;
  receiverAccount: string;
  message: string;
  timestamp: string;
  category: 'Chuyển tiền' | 'Nhận tiền' | 'Truyền hình' | 'Mua sắm' | 'Lương' | 'Tiết kiệm';
  status: 'Thành công' | 'Đang xử lý';
}

interface SavingsBook {
  id: string;
  name: string;
  principal: number;
  rate: number; // %/year
  termMonths: number;
  startDate: string;
  endDate: string;
  accumulatedInterest: number;
}

const VIETNAM_BANKS = [
  { code: 'SWIFT', name: 'Swift Bank', fullName: 'Ngân hàng Số Swift Bank', bin: '970499', color: '#0284c7' },
  { code: 'VCB', name: 'Vietcombank', fullName: 'Ngoại thương Việt Nam', bin: '970436', color: '#15803d' },
  { code: 'MB', name: 'MB Bank', fullName: 'Quân đội', bin: '970422', color: '#1d4ed8' },
  { code: 'TCB', name: 'Techcombank', fullName: 'Kỹ thương Việt Nam', bin: '970407', color: '#dc2626' },
  { code: 'BIDV', name: 'BIDV', fullName: 'Đầu tư và Phát triển VN', bin: '970418', color: '#047857' },
  { code: 'CTG', name: 'VietinBank', fullName: 'Công thương Việt Nam', bin: '970415', color: '#0369a1' },
  { code: 'ACB', name: 'ACB', fullName: 'Á Châu', bin: '970416', color: '#2563eb' },
  { code: 'TPB', name: 'TPBank', fullName: 'Tiên Phong', bin: '970423', color: '#7c3aed' },
  { code: 'VPB', name: 'VPBank', fullName: 'Việt Nam Thịnh Vượng', bin: '970432', color: '#16a34a' },
];

const INITIAL_ACCOUNT: BankAccount = {
  accountNumber: '8888 6868 9999',
  accountName: 'NGUYỄN VĂN AN',
  balance: 148500000,
  availableBalance: 148500000,
  currency: 'VND',
  swiftPoints: 6450,
  tier: 'Diamond Priority'
};

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'FT261012998801',
    type: 'transfer_in',
    amount: 35000000,
    senderName: 'CÔNG TY CP TRUYỀN HÌNH SPARKLE (DEV)',
    receiverName: 'NGUYỄN VĂN AN',
    receiverBank: 'Swift Bank',
    receiverAccount: '8888 6868 9999',
    message: 'Thanh toán tiền lương và phụ cấp kỹ thuật T10/2026',
    timestamp: '12/10/2026 09:30',
    category: 'Lương',
    status: 'Thành công'
  },
  {
    id: 'FT261012998802',
    type: 'bill_pay',
    amount: 249000,
    senderName: 'NGUYỄN VĂN AN',
    receiverName: 'SPARKLE (DEV) OTT PLATFORM',
    receiverBank: 'Swift Bank',
    receiverAccount: '1900 8888',
    message: 'Gia hạn gói cước Sparkle (Dev) VIP 4K Truyền hình 6 tháng',
    timestamp: '11/10/2026 20:15',
    category: 'Truyền hình',
    status: 'Thành công'
  },
  {
    id: 'FT261012998803',
    type: 'transfer_out',
    amount: 1500000,
    senderName: 'NGUYỄN VĂN AN',
    receiverName: 'TRẦN THỊ HƯƠNG',
    receiverBank: 'Vietcombank',
    receiverAccount: '0011002233445',
    message: 'Chuyen tien mua thiet bi quay phim studio',
    timestamp: '10/10/2026 14:40',
    category: 'Chuyển tiền',
    status: 'Thành công'
  },
  {
    id: 'FT261012998804',
    type: 'transfer_in',
    amount: 5200000,
    senderName: 'LÊ VĂN MINH',
    receiverName: 'NGUYỄN VĂN AN',
    receiverBank: 'Swift Bank',
    receiverAccount: '8888 6868 9999',
    message: 'Thanh toan tien thu am long tieng VTV',
    timestamp: '09/10/2026 11:10',
    category: 'Nhận tiền',
    status: 'Thành công'
  },
  {
    id: 'FT261012998805',
    type: 'bill_pay',
    amount: 850000,
    senderName: 'NGUYỄN VĂN AN',
    receiverName: 'EVN HÀ NỘI',
    receiverBank: 'Swift Bank',
    receiverAccount: 'EVN2026',
    message: 'Thanh toan tien dien sinh hoat thang 9',
    timestamp: '08/10/2026 16:22',
    category: 'Mua sắm',
    status: 'Thành công'
  }
];

const INITIAL_SAVINGS: SavingsBook[] = [
  {
    id: 'SAV-01',
    name: 'Tích lũy Nâng cấp Máy quay 8K',
    principal: 50000000,
    rate: 6.5,
    termMonths: 12,
    startDate: '01/06/2026',
    endDate: '01/06/2027',
    accumulatedInterest: 1190000
  },
  {
    id: 'SAV-02',
    name: 'Quỹ Dự phòng Khẩn cấp Studio',
    principal: 20000000,
    rate: 5.8,
    termMonths: 6,
    startDate: '15/08/2026',
    endDate: '15/02/2027',
    accumulatedInterest: 193000
  }
];

interface SwiftBankProps {
  navigate?: (route: string) => void;
}

export const SwiftBank: React.FC<SwiftBankProps> = ({ navigate }) => {
  // Main State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transfer' | 'qr' | 'savings' | 'bills' | 'cards' | 'history'>('dashboard');
  const [account, setAccount] = useState<BankAccount>(() => {
    try {
      const saved = localStorage.getItem('swift_bank_account');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_ACCOUNT;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('swift_bank_transactions');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_TRANSACTIONS;
  });

  const [savingsList, setSavingsList] = useState<SavingsBook[]>(() => {
    try {
      const saved = localStorage.getItem('swift_bank_savings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_SAVINGS;
  });

  // Privacy: Hide / Show balance
  const [isBalanceHidden, setIsBalanceHidden] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Transfer Form State
  const [transferMode, setTransferMode] = useState<'internal' | 'interbank'>('internal');
  const [selectedBank, setSelectedBank] = useState<string>('SWIFT');
  const [targetAccount, setTargetAccount] = useState<string>('');
  const [targetName, setTargetName] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [transferMessage, setTransferMessage] = useState<string>('NGUYEN VAN AN CHUYEN TIEN');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>('');
  const [generatedOtp, setGeneratedOtp] = useState<string>('886622');
  const [lastReceipt, setLastReceipt] = useState<Transaction | null>(null);

  // QR Payment State
  const [qrAmount, setQrAmount] = useState<string>('');
  const [qrMessage, setQrMessage] = useState<string>('THANH TOAN CHO NGUYEN VAN AN');
  const [isQrScannerOpen, setIsQrScannerOpen] = useState<boolean>(false);

  // Digital Card Security & Freeze
  const [isCardFrozen, setIsCardFrozen] = useState<boolean>(false);
  const [isCardFlipped, setIsCardFlipped] = useState<boolean>(false);
  const [showCvv, setShowCvv] = useState<boolean>(false);

  // New Savings Book Form
  const [newSavingsName, setNewSavingsName] = useState<string>('Tiết kiệm mục tiêu mới');
  const [newSavingsAmount, setNewSavingsAmount] = useState<string>('10000000');
  const [newSavingsTerm, setNewSavingsTerm] = useState<number>(6);

  // History Filter
  const [historyFilter, setHistoryFilter] = useState<'all' | 'in' | 'out'>('all');
  const [historySearch, setHistorySearch] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Persist State to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('swift_bank_account', JSON.stringify(account));
      localStorage.setItem('swift_bank_transactions', JSON.stringify(transactions));
      localStorage.setItem('swift_bank_savings', JSON.stringify(savingsList));
    } catch {}
  }, [account, transactions, savingsList]);

  // Format currency in Vietnamese Dong
  const formatVND = (amt: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amt);
  };

  // Auto-resolve beneficiary name when target account changes
  useEffect(() => {
    if (targetAccount.length >= 6) {
      if (selectedBank === 'SWIFT') {
        if (targetAccount.includes('1900') || targetAccount.includes('sparkle') || targetAccount.includes('vone')) {
          setTargetName('CÔNG TY CP TRUYỀN HÌNH SPARKLE (DEV)');
        } else {
          setTargetName('TRẦN VĂN HOÀNG (SWIFT BANK)');
        }
      } else {
        const bankObj = VIETNAM_BANKS.find((b) => b.code === selectedBank);
        setTargetName(`NGUYỄN THỊ BÍCH NGỌC (${bankObj?.name || 'NAPAS 247'})`);
      }
    } else {
      setTargetName('');
    }
  }, [targetAccount, selectedBank]);

  // Handle Transfer Confirmation
  const handleInitiateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(transferAmount.replace(/\D/g, ''), 10);
    if (!numAmount || numAmount <= 0) {
      showToast('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    if (numAmount > account.balance) {
      showToast('Số dư khả dụng không đủ để thực hiện giao dịch');
      return;
    }

    if (!targetAccount.trim()) {
      showToast('Vui lòng nhập số tài khoản người nhận');
      return;
    }

    // Generate random 6-digit Smart OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpCode('');
    setIsVerifyingOtp(true);
  };

  // Complete Transfer with OTP
  const handleVerifyOtpAndSend = () => {
    const numAmount = parseInt(transferAmount.replace(/\D/g, ''), 10);
    const bankObj = VIETNAM_BANKS.find((b) => b.code === selectedBank);

    const newTx: Transaction = {
      id: `FT${Date.now().toString().slice(-8)}${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'transfer_out',
      amount: numAmount,
      senderName: account.accountName,
      receiverName: targetName || 'NGƯỜI THỤ HƯỞNG',
      receiverBank: bankObj?.name || 'Swift Bank',
      receiverAccount: targetAccount,
      message: transferMessage || 'CHUYEN TIEN 247',
      timestamp: new Date().toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }),
      category: 'Chuyển tiền',
      status: 'Thành công'
    };

    // Deduct balance & add transaction
    setAccount((prev) => ({
      ...prev,
      balance: prev.balance - numAmount,
      availableBalance: prev.availableBalance - numAmount,
      swiftPoints: prev.swiftPoints + Math.floor(numAmount / 100000)
    }));

    setTransactions((prev) => [newTx, ...prev]);
    setIsVerifyingOtp(false);
    setLastReceipt(newTx);
    setTransferAmount('');
    setTargetAccount('');
    showToast(`Chuyển ${formatVND(numAmount)} thành công!`);
  };

  // Bill Pay quick action (e.g. Sparkle (Dev) subscription or phone top-up)
  const handlePayBill = (billName: string, amount: number) => {
    if (amount > account.balance) {
      showToast('Số dư tài khoản không đủ');
      return;
    }

    const newTx: Transaction = {
      id: `BILL${Date.now().toString().slice(-8)}`,
      type: 'bill_pay',
      amount,
      senderName: account.accountName,
      receiverName: billName,
      receiverBank: 'Swift Bank Partner',
      receiverAccount: '1900 8888',
      message: `Thanh toan hoa don ${billName}`,
      timestamp: new Date().toLocaleString('vi-VN'),
      category: 'Truyền hình',
      status: 'Thành công'
    };

    setAccount((prev) => ({
      ...prev,
      balance: prev.balance - amount,
      availableBalance: prev.availableBalance - amount,
      swiftPoints: prev.swiftPoints + 50
    }));

    setTransactions((prev) => [newTx, ...prev]);
    setLastReceipt(newTx);
    showToast(`Đã thanh toán gói ${billName} thành công!`);
  };

  // Open New Savings Book
  const handleCreateSavings = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(newSavingsAmount.replace(/\D/g, ''), 10);
    if (!amount || amount < 1000000) {
      showToast('Số tiền gửi tiết kiệm tối thiểu là 1.000.000 ₫');
      return;
    }

    if (amount > account.balance) {
      showToast('Số dư tài khoản không đủ để mở sổ tiết kiệm');
      return;
    }

    const rateMap: Record<number, number> = { 1: 4.2, 3: 4.8, 6: 5.8, 12: 6.5 };
    const rate = rateMap[newSavingsTerm] || 5.8;

    const newBook: SavingsBook = {
      id: `SAV-${Date.now().toString().slice(-4)}`,
      name: newSavingsName || 'Sổ tiết kiệm điện tử',
      principal: amount,
      rate,
      termMonths: newSavingsTerm,
      startDate: new Date().toLocaleDateString('vi-VN'),
      endDate: new Date(Date.now() + newSavingsTerm * 30 * 24 * 3600 * 1000).toLocaleDateString('vi-VN'),
      accumulatedInterest: 0
    };

    setAccount((prev) => ({
      ...prev,
      balance: prev.balance - amount,
      availableBalance: prev.availableBalance - amount
    }));

    setSavingsList((prev) => [newBook, ...prev]);
    showToast(`Mở sổ tiết kiệm ${formatVND(amount)} kỳ hạn ${newSavingsTerm} tháng thành công!`);
  };

  // Filtered transactions for History tab
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch = 
        t.receiverName.toLowerCase().includes(historySearch.toLowerCase()) ||
        t.senderName.toLowerCase().includes(historySearch.toLowerCase()) ||
        t.message.toLowerCase().includes(historySearch.toLowerCase()) ||
        t.id.toLowerCase().includes(historySearch.toLowerCase());

      if (!matchSearch) return false;

      if (historyFilter === 'in') return t.type === 'transfer_in' || t.type === 'cashback';
      if (historyFilter === 'out') return t.type === 'transfer_out' || t.type === 'bill_pay' || t.type === 'savings_deposit';
      return true;
    });
  }, [transactions, historySearch, historyFilter]);

  return (
    <div className="min-h-[calc(100vh-64px)] w-full bg-[#0a0d14] text-[#F3F4F6] select-none font-sans pb-16">
      {/* 1. TOP BRANDING BANNER & QUICK STATS */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] border-b border-white/10 px-4 sm:px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-amber-400 p-0.5 shadow-lg shadow-sky-500/20">
              <div className="w-full h-full bg-[#0b1120] rounded-[10px] flex items-center justify-center text-white">
                <FluentSwiftBankIcon className="w-7 h-7 text-sky-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Swift Bank
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  NAPAS 247 • LIVE
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Hệ thống ngân hàng số bảo mật cao cấp dành riêng cho hệ sinh thái Sparkle (Dev)
              </p>
            </div>
          </div>

          {/* User Account Quick Info Box */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-lg p-3 min-w-[200px]">
              <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
                <span>Số dư khả dụng</span>
                <button
                  type="button"
                  onClick={() => setIsBalanceHidden(!isBalanceHidden)}
                  className="hover:text-white transition-colors"
                >
                  {isBalanceHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono tracking-tight">
                {isBalanceHidden ? '•••••••• ₫' : formatVND(account.balance)}
              </div>
              <div className="text-[11px] text-neutral-400 font-mono mt-0.5 flex items-center justify-between">
                <span>STK: {account.accountNumber}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(account.accountNumber.replace(/\s/g, ''));
                    showToast('Đã sao chép số tài khoản');
                  }}
                  className="text-sky-400 hover:text-sky-300"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="hidden sm:block bg-white/5 border border-white/10 backdrop-blur-md rounded-lg p-3 min-w-[140px]">
              <div className="text-neutral-400 text-xs mb-1">SwiftPoints</div>
              <div className="text-base font-bold text-amber-400 font-mono flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                {account.swiftPoints.toLocaleString('vi-VN')} pts
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5">Hạng: {account.tier}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION BAR */}
      <div className="bg-[#111827] border-b border-white/10 sticky top-0 z-30 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 no-scrollbar text-xs font-semibold">
          {[
            { id: 'dashboard', label: 'Tổng quan', icon: Building2 },
            { id: 'transfer', label: 'Chuyển tiền 24/7', icon: ArrowUpRight },
            { id: 'qr', label: 'Quét & Nhận VietQR', icon: QrCode },
            { id: 'savings', label: 'Tiết kiệm tích lũy', icon: PiggyBank },
            { id: 'bills', label: 'Thanh toán & Gói cước', icon: Tv },
            { id: 'cards', label: 'Thẻ thanh toán số', icon: CreditCard },
            { id: 'history', label: 'Lịch sử giao dịch', icon: Receipt },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. MAIN CONTENT BODY */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">
        {/* ==================== TAB 1: DASHBOARD ==================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Virtual Credit / Debit Card (Interactive 3D Look) */}
              <div className="lg:col-span-1">
                <div
                  onClick={() => setIsCardFlipped(!isCardFlipped)}
                  className={`relative w-full aspect-[1.586] rounded-2xl p-5 shadow-2xl cursor-pointer transition-all duration-500 overflow-hidden select-none border border-white/20 ${
                    isCardFrozen
                      ? 'bg-gradient-to-tr from-slate-800 to-slate-900 opacity-70'
                      : 'bg-gradient-to-tr from-[#0f172a] via-[#1e1b4b] to-[#312e81]'
                  }`}
                >
                  {/* Card Background holographic pattern */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(56,189,248,0.25),transparent_60%)] pointer-events-none" />
                  <div className="absolute right-0 bottom-0 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

                  {!isCardFlipped ? (
                    <div className="relative h-full flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FluentSwiftBankIcon className="w-6 h-6 text-sky-400" />
                          <span className="font-extrabold text-sm tracking-wider text-white">SWIFT BANK</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
                          {isCardFrozen ? 'ĐÃ KHÓA' : 'PLATINUM VIP'}
                        </span>
                      </div>

                      {/* Chip & Contactless */}
                      <div className="flex items-center gap-3 my-auto">
                        <div className="w-10 h-7 rounded bg-gradient-to-br from-amber-300 to-yellow-600 border border-yellow-200/50 flex flex-col justify-around p-1 shadow-inner">
                          <div className="h-[1px] bg-black/40" />
                          <div className="h-[1px] bg-black/40" />
                        </div>
                        <Wifi className="w-4 h-4 text-white/70 rotate-90" />
                      </div>

                      <div>
                        <div className="font-mono text-base sm:text-lg tracking-[0.18em] text-white/90 drop-shadow">
                          4868 •••• •••• 9999
                        </div>
                        <div className="flex items-center justify-between mt-2 text-[10px] text-neutral-300 uppercase tracking-wider font-mono">
                          <div>
                            <div className="text-[8px] text-neutral-400">CHỦ THẺ</div>
                            <div className="font-bold text-white">{account.accountName}</div>
                          </div>
                          <div>
                            <div className="text-[8px] text-neutral-400">HẾT HẠN</div>
                            <div className="font-bold text-white">10/30</div>
                          </div>
                          <div className="font-black text-sm italic tracking-tighter text-sky-400">
                            VISA
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Card Back
                    <div className="relative h-full flex flex-col justify-between">
                      <div className="w-full h-8 bg-black -mx-5 -mt-2" />
                      <div className="space-y-1">
                        <div className="text-[9px] text-neutral-400">CVV BẢO MẬT:</div>
                        <div className="bg-white/10 px-3 py-1 rounded font-mono text-xs flex items-center justify-between text-white">
                          <span>{showCvv ? '888' : '•••'}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowCvv(!showCvv);
                            }}
                            className="text-[10px] text-sky-400 hover:underline"
                          >
                            {showCvv ? 'Ẩn' : 'Hiện CVV'}
                          </button>
                        </div>
                      </div>
                      <div className="text-[8px] text-neutral-400 leading-tight">
                        Thẻ phát hành bởi Swift Bank Việt Nam. Mọi giao dịch được bảo vệ theo chuẩn quốc tế 3D-Secure 2.0.
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3 text-xs">
                  <span className="text-neutral-400">Nhấp vào thẻ để lật mặt sau</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCardFrozen(!isCardFrozen);
                      showToast(isCardFrozen ? 'Đã mở khóa thẻ thanh toán' : 'Đã khóa thẻ thanh toán tức thì');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded border font-medium transition-colors ${
                      isCardFrozen ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-white/5 text-neutral-300 border-white/10 hover:text-white'
                    }`}
                  >
                    {isCardFrozen ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    <span>{isCardFrozen ? 'Mở khóa thẻ' : 'Khóa thẻ tạm thời'}</span>
                  </button>
                </div>
              </div>

              {/* Quick Actions & Finance Summary */}
              <div className="lg:col-span-2 space-y-4">
                {/* 4 Feature Buttons Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('transfer')}
                    className="p-4 rounded-xl bg-gradient-to-b from-[#1e293b] to-[#0f172a] border border-white/10 hover:border-sky-500/50 hover:shadow-lg transition-all text-left group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                    <div className="font-bold text-sm text-white">Chuyển tiền</div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">Napas 247 tức thì 0đ</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('qr')}
                    className="p-4 rounded-xl bg-gradient-to-b from-[#1e293b] to-[#0f172a] border border-white/10 hover:border-indigo-500/50 hover:shadow-lg transition-all text-left group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div className="font-bold text-sm text-white">Quét VietQR</div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">Thanh toán không chạm</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('savings')}
                    className="p-4 rounded-xl bg-gradient-to-b from-[#1e293b] to-[#0f172a] border border-white/10 hover:border-amber-500/50 hover:shadow-lg transition-all text-left group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <PiggyBank className="w-5 h-5" />
                    </div>
                    <div className="font-bold text-sm text-white">Gửi tiết kiệm</div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">Lãi suất tới 6.5%/năm</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('bills')}
                    className="p-4 rounded-xl bg-gradient-to-b from-[#1e293b] to-[#0f172a] border border-white/10 hover:border-emerald-500/50 hover:shadow-lg transition-all text-left group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Tv className="w-5 h-5" />
                    </div>
                    <div className="font-bold text-sm text-white">Gói cước Sparkle (Dev)</div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">Hoàn tiền 5% hóa đơn</div>
                  </button>
                </div>

                {/* Monthly Flow Widget */}
                <div className="p-4 rounded-xl bg-[#131926] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-neutral-400">Tổng thu nhập tháng 10</div>
                      <div className="text-base font-bold text-emerald-400 font-mono">+40,200,000 ₫</div>
                    </div>
                  </div>

                  <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-neutral-400">Tổng chi tiêu tháng 10</div>
                      <div className="text-base font-bold text-rose-400 font-mono">-2,599,000 ₫</div>
                    </div>
                  </div>

                  <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />

                  <button
                    type="button"
                    onClick={() => setActiveTab('history')}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-sky-400 flex items-center gap-1.5 transition-colors"
                  >
                    <span>Xem báo cáo</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Foreign Exchange Rates Table */}
                <div className="p-4 rounded-xl bg-[#131926] border border-white/10">
                  <div className="flex items-center justify-between mb-3 text-xs font-bold text-neutral-300">
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-amber-400" />
                      Tỷ giá ngoại tệ & Vàng SJC thời gian thực
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">Cập nhật: Hôm nay</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {[
                      { pair: 'USD/VND', buy: '25,120', sell: '25,480' },
                      { pair: 'EUR/VND', buy: '27,350', sell: '28,100' },
                      { pair: 'JPY/VND', buy: '168.5', sell: '174.2' },
                      { pair: 'SJC 9999 (1L)', buy: '83,500,000', sell: '85,500,000' },
                    ].map((fx) => (
                      <div key={fx.pair} className="bg-black/20 p-2 rounded border border-white/5">
                        <div className="font-bold text-white text-[11px]">{fx.pair}</div>
                        <div className="text-[10px] text-neutral-400 flex justify-between mt-1 font-mono">
                          <span>M: {fx.buy}</span>
                          <span className="text-emerald-400">B: {fx.sell}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Transactions List */}
            <div className="bg-[#111827] border border-white/10 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-400" />
                  <h3 className="font-bold text-sm text-white">Giao dịch gần đây</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className="text-xs text-sky-400 hover:underline font-medium"
                >
                  Xem tất cả ({transactions.length})
                </button>
              </div>

              <div className="divide-y divide-white/5">
                {transactions.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                          tx.type === 'transfer_in' || tx.type === 'cashback'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-rose-500/15 text-rose-400'
                        }`}
                      >
                        {tx.type === 'transfer_in' || tx.type === 'cashback' ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white">
                          {tx.type === 'transfer_in' ? tx.senderName : tx.receiverName}
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-0.5 truncate max-w-xs sm:max-w-md">
                          {tx.message}
                        </div>
                        <div className="text-[10px] text-neutral-500 mt-0.5">{tx.timestamp}</div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div
                        className={`font-mono text-sm font-bold ${
                          tx.type === 'transfer_in' || tx.type === 'cashback'
                            ? 'text-emerald-400'
                            : 'text-white'
                        }`}
                      >
                        {tx.type === 'transfer_in' || tx.type === 'cashback' ? '+' : '-'}
                        {formatVND(tx.amount)}
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-neutral-400">
                        {tx.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: TRANSFER 24/7 ==================== */}
        {activeTab === 'transfer' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-sky-400" />
                Chuyển Tiền 24/7 Tức Thì
              </h2>
              <p className="text-xs text-neutral-400 mb-6">
                Miễn phí mọi giao dịch chuyển nội bộ Swift Bank và liên ngân hàng Napas 247.
              </p>

              {/* Mode Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setTransferMode('internal');
                    setSelectedBank('SWIFT');
                  }}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    transferMode === 'internal'
                      ? 'bg-sky-600 text-white shadow-md'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Nội bộ Swift Bank
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTransferMode('interbank');
                    setSelectedBank('VCB');
                  }}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    transferMode === 'interbank'
                      ? 'bg-sky-600 text-white shadow-md'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Liên ngân hàng Napas 247
                </button>
              </div>

              <form onSubmit={handleInitiateTransfer} className="space-y-4">
                {/* Bank Select (if interbank) */}
                {transferMode === 'interbank' && (
                  <div>
                    <label className="text-xs font-medium text-neutral-300 block mb-1.5">
                      Chọn ngân hàng thụ hưởng:
                    </label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white font-medium outline-none focus:border-sky-500"
                    >
                      {VIETNAM_BANKS.map((b) => (
                        <option key={b.code} value={b.code}>
                          {b.name} - {b.fullName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Target Account */}
                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1.5">
                    Số tài khoản / Số thẻ nhận:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: 0011002233445 hoặc 8888 6868 9999"
                    value={targetAccount}
                    onChange={(e) => setTargetAccount(e.target.value)}
                    className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white font-mono outline-none focus:border-sky-500"
                  />
                  {targetName && (
                    <div className="mt-1.5 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Người nhận: {targetName}</span>
                    </div>
                  )}
                </div>

                {/* Amount */}
                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1.5">
                    Số tiền chuyển (VND):
                  </label>
                  <input
                    type="number"
                    required
                    min={10000}
                    placeholder="Tối thiểu 10.000 ₫"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-emerald-400 font-mono font-bold outline-none focus:border-sky-500"
                  />

                  {/* Quick amount chips */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[50000, 200000, 500000, 2000000, 5000000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setTransferAmount(amt.toString())}
                        className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-[11px] text-neutral-300 font-mono"
                      >
                        +{amt.toLocaleString('vi-VN')}đ
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transfer Message */}
                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1.5">
                    Nội dung chuyển tiền:
                  </label>
                  <input
                    type="text"
                    value={transferMessage}
                    onChange={(e) => setTransferMessage(e.target.value.toUpperCase())}
                    className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-sky-500 uppercase"
                  />
                </div>

                {/* Fee & Source */}
                <div className="p-3 rounded-xl bg-black/20 border border-white/5 space-y-1 text-xs text-neutral-400">
                  <div className="flex justify-between">
                    <span>Nguồn tiền:</span>
                    <span className="font-mono text-white">Tài khoản chính ({account.accountNumber})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí giao dịch:</span>
                    <span className="text-emerald-400 font-bold">0 ₫ (Miễn phí trọn đời)</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:opacity-90 font-bold text-sm text-white shadow-lg shadow-sky-500/20 active:scale-98 transition-all cursor-pointer mt-4"
                >
                  Tiếp Tục Xác Nhận
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: VIETQR ==================== */}
        {activeTab === 'qr' && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 text-center shadow-xl">
              <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3">
                <QrCode className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-white">Mã VietQR Nhận Tiền Của Bạn</h2>
              <p className="text-xs text-neutral-400 mt-1">
                Người gửi có thể dùng bất kỳ ứng dụng ngân hàng nào quét mã này để chuyển tiền 24/7 tức thì.
              </p>

              {/* Dynamic QR Code Card Display */}
              <div className="my-6 p-5 rounded-2xl bg-white text-slate-900 inline-block shadow-2xl border-4 border-sky-500/40">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="font-black text-xs text-sky-700">VIETQR • NAPAS 247</span>
                  <span className="font-bold text-xs text-indigo-800">SWIFT BANK</span>
                </div>

                {/* Simulated High-Res VietQR Code */}
                <div className="my-4 w-52 h-52 bg-slate-100 rounded-xl border border-slate-300 p-2 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="grid grid-cols-6 grid-rows-6 gap-1.5 w-full h-full p-2">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-xs ${
                          (i % 2 === 0 && i % 3 === 0) || i === 0 || i === 5 || i === 30 || i === 35
                            ? 'bg-slate-900'
                            : (i * 7) % 3 === 0
                            ? 'bg-slate-800'
                            : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs shadow-md border-2 border-white">
                      SWIFT
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-0.5">
                  <div className="text-xs font-black uppercase text-slate-800">{account.accountName}</div>
                  <div className="text-xs font-mono font-bold text-sky-700">{account.accountNumber}</div>
                  {qrAmount && (
                    <div className="text-sm font-black text-emerald-600 font-mono pt-1">
                      {formatVND(parseInt(qrAmount.replace(/\D/g, '') || '0', 10))}
                    </div>
                  )}
                </div>
              </div>

              {/* Customize QR Form */}
              <div className="space-y-3 max-w-sm mx-auto text-left">
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Cài sẵn số tiền nhận (Tùy chọn):</label>
                  <input
                    type="number"
                    placeholder="Để trống để người gửi tự nhập"
                    value={qrAmount}
                    onChange={(e) => setQrAmount(e.target.value)}
                    className="w-full bg-[#1e293b] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Nội dung chuyển khoản mặc định:</label>
                  <input
                    type="text"
                    value={qrMessage}
                    onChange={(e) => setQrMessage(e.target.value)}
                    className="w-full bg-[#1e293b] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-sky-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`https://vietqr.me/swiftbank/${account.accountNumber}`);
                      showToast('Đã sao chép liên kết thanh toán VietQR');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-colors"
                  >
                    Sao Chép Link
                  </button>
                  <button
                    type="button"
                    onClick={() => showToast('Đã lưu ảnh mã VietQR về thư viện ảnh')}
                    className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white transition-colors shadow-md"
                  >
                    Tải Ảnh QR
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 4: SAVINGS ==================== */}
        {activeTab === 'savings' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Open Savings Book Form */}
              <div className="lg:col-span-1 bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-2">
                  <PiggyBank className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-base text-white">Mở Sổ Tiết Kiệm Online</h3>
                </div>
                <p className="text-xs text-neutral-400 mb-5">
                  Nhận lãi suất hấp dẫn tới 6.5%/năm, an toàn tuyệt đối với bảo hiểm tiền gửi.
                </p>

                <form onSubmit={handleCreateSavings} className="space-y-4">
                  <div>
                    <label className="text-xs text-neutral-300 block mb-1">Tên mục tiêu tích lũy:</label>
                    <input
                      type="text"
                      required
                      value={newSavingsName}
                      onChange={(e) => setNewSavingsName(e.target.value)}
                      className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-neutral-300 block mb-1">Số tiền gửi (VND):</label>
                    <input
                      type="number"
                      required
                      min={1000000}
                      step={1000000}
                      value={newSavingsAmount}
                      onChange={(e) => setNewSavingsAmount(e.target.value)}
                      className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3 py-2 text-sm font-bold text-amber-400 font-mono outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-neutral-300 block mb-1.5">Kỳ hạn gửi:</label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { term: 1, rate: 4.2 },
                        { term: 3, rate: 4.8 },
                        { term: 6, rate: 5.8 },
                        { term: 12, rate: 6.5 },
                      ].map((item) => (
                        <button
                          key={item.term}
                          type="button"
                          onClick={() => setNewSavingsTerm(item.term)}
                          className={`p-2 rounded-lg border text-left transition-all ${
                            newSavingsTerm === item.term
                              ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                              : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                          }`}
                        >
                          <div>{item.term} Tháng</div>
                          <div className="text-[10px] text-amber-400 font-mono">{item.rate}% / năm</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:opacity-90 font-bold text-xs text-black shadow-lg shadow-amber-500/20 transition-all cursor-pointer mt-2"
                  >
                    Xác Nhận Mở Sổ Tiết Kiệm
                  </button>
                </form>
              </div>

              {/* Active Savings Books */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <span>Sổ Tiết Kiệm Đang Hoạt Động</span>
                  <span className="text-xs text-neutral-400">({savingsList.length})</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savingsList.map((book) => (
                    <div
                      key={book.id}
                      className="p-5 rounded-2xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-white/10 space-y-3 relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                            {book.id}
                          </span>
                          <h4 className="font-bold text-sm text-white mt-1.5">{book.name}</h4>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-extrabold text-amber-400 font-mono">
                            {book.rate}%
                          </span>
                          <div className="text-[9px] text-neutral-400">/ năm</div>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-neutral-300 pt-2 border-t border-white/5">
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Tiền gốc:</span>
                          <span className="font-bold font-mono text-white">{formatVND(book.principal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Lãi tạm tính:</span>
                          <span className="font-bold font-mono text-emerald-400">+{formatVND(book.accumulatedInterest)}</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-neutral-400">
                          <span>Kỳ hạn:</span>
                          <span>{book.termMonths} tháng ({book.startDate} - {book.endDate})</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setAccount((prev) => ({
                            ...prev,
                            balance: prev.balance + book.principal + book.accumulatedInterest,
                            availableBalance: prev.availableBalance + book.principal + book.accumulatedInterest
                          }));
                          setSavingsList((prev) => prev.filter((b) => b.id !== book.id));
                          showToast(`Đã tất toán sổ "${book.name}". Tiền gốc và lãi đã được hoàn lại.`);
                        }}
                        className="w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-rose-400 transition-colors"
                      >
                        Tất Toán Sổ Trước Hạn
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 5: BILLS & PACKAGES ==================== */}
        {activeTab === 'bills' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Thanh Toán Dịch Vụ & Gói Cước Truyền Hình</h2>
              <p className="text-xs text-neutral-400">
                Thanh toán nhanh chóng bằng số dư Swift Bank với chiết khấu và hoàn tiền độc quyền.
              </p>
            </div>

            {/* Sparkle (Dev) Subscriptions */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <Tv className="w-4 h-4" />
                Gói Cước Nền Tảng Sparkle (Dev) & Đối Tác Bản Quyền
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'vone-1m', title: 'Sparkle (Dev) VIP 4K (1 Tháng)', price: 49000, desc: 'Xem truyền hình 4K HDR không quảng cáo, mở toàn bộ kênh thể thao.' },
                  { id: 'vone-6m', title: 'Sparkle (Dev) Family (6 Tháng)', price: 249000, desc: 'Chia sẻ 4 thiết bị đồng thời, xem lại 7 ngày, lưu trữ bản tin.' },
                  { id: 'vone-life', title: 'Sparkle (Dev) Trọn Đời (Lifetime)', price: 599000, desc: 'Đặc quyền trọn đời, biểu tượng VIP vàng, tải video lưu trữ không giới hạn.' },
                ].map((pack) => (
                  <div key={pack.id} className="p-5 rounded-2xl bg-[#111827] border border-white/10 flex flex-col justify-between hover:border-sky-500/50 transition-colors">
                    <div>
                      <h4 className="font-bold text-sm text-white">{pack.title}</h4>
                      <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{pack.desc}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                      <div className="font-mono text-base font-black text-emerald-400">{formatVND(pack.price)}</div>
                      <button
                        type="button"
                        onClick={() => handlePayBill(pack.title, pack.price)}
                        className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white transition-colors"
                      >
                        Thanh toán
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Telecom Top-up & Utilities */}
            <div className="space-y-3 pt-4">
              <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-4 h-4" />
                Nạp Tiền Điện Thoại & Hóa Đơn Sinh Hoạt
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { name: 'Nạp Viettel 50.000 ₫', price: 48500, discount: '-3%' },
                  { name: 'Nạp VinaPhone 100.000 ₫', price: 97000, discount: '-3%' },
                  { name: 'Nạp MobiFone 200.000 ₫', price: 194000, discount: '-3%' },
                  { name: 'Nạp Data 4G Tốc độ cao', price: 50000, discount: 'Siêu tốc' },
                ].map((topup) => (
                  <div key={topup.name} className="p-3.5 rounded-xl bg-[#131926] border border-white/5 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1 rounded">{topup.discount}</span>
                      </div>
                      <div className="text-xs font-bold text-white">{topup.name}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePayBill(topup.name, topup.price)}
                      className="mt-3 w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-sky-400 transition-colors"
                    >
                      Nạp ngay ({formatVND(topup.price)})
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 6: CARDS ==================== */}
        {activeTab === 'cards' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-lg font-bold text-white mb-2">Quản Lý Thẻ Thanh Toán Số</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card Security settings */}
              <div className="p-5 rounded-2xl bg-[#111827] border border-white/10 space-y-4">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Bảo Mật & Khóa Thẻ Tức Thì
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <div>
                      <div className="font-semibold text-white">Khóa thẻ tạm thời</div>
                      <div className="text-[11px] text-neutral-400">Ngăn chặn mọi giao dịch chi tiêu</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isCardFrozen}
                      onChange={(e) => {
                        setIsCardFrozen(e.target.checked);
                        showToast(e.target.checked ? 'Đã khóa thẻ' : 'Đã mở khóa thẻ');
                      }}
                      className="w-5 h-5 accent-sky-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <div>
                      <div className="font-semibold text-white">Thanh toán trực tuyến quốc tế</div>
                      <div className="text-[11px] text-neutral-400">Cho phép mua sắm trên các trang web</div>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-sky-500" />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <div>
                      <div className="font-semibold text-white">Rút tiền tại ATM & Contactless</div>
                      <div className="text-[11px] text-neutral-400">Chạm thẻ thanh toán tại máy POS</div>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-sky-500" />
                  </div>
                </div>
              </div>

              {/* Card limits */}
              <div className="p-5 rounded-2xl bg-[#111827] border border-white/10 space-y-4">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-sky-400" />
                  Hạn Mức Chi Tiêu Thẻ
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between text-neutral-300 mb-1">
                      <span>Hạn mức thanh toán/ngày:</span>
                      <span className="font-mono font-bold text-white">100.000.000 ₫</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="w-[15%] h-full bg-sky-500 rounded-full" />
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-1">Đã dùng: 2.599.000 ₫ / 100.000.000 ₫</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => showToast('Đã gửi yêu cầu đổi mã PIN thẻ qua SMS OTP')}
                    className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-sky-400 transition-colors mt-4"
                  >
                    Đổi Mã PIN Thẻ Điện Tử
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 7: HISTORY ==================== */}
        {activeTab === 'history' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Lịch Sử Biến Động Số Dư</h2>
                <p className="text-xs text-neutral-400">Chi tiết tất cả các giao dịch vào và ra của tài khoản</p>
              </div>

              {/* Search & Filter */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-[#1e293b] border border-white/10 rounded-[5px] px-3 py-1.5 text-xs text-white">
                  <Search className="w-3.5 h-3.5 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Tìm Theo Tên, Nội Dung, Mã..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="bg-transparent border-none outline-none w-36 sm:w-48 text-xs"
                  />
                </div>

                <div className="flex rounded-xl bg-white/5 p-1 border border-white/10 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setHistoryFilter('all')}
                    className={`px-2.5 py-1 rounded-lg ${historyFilter === 'all' ? 'bg-sky-600 text-white' : 'text-neutral-400'}`}
                  >
                    Tất cả
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistoryFilter('in')}
                    className={`px-2.5 py-1 rounded-lg ${historyFilter === 'in' ? 'bg-emerald-600 text-white' : 'text-neutral-400'}`}
                  >
                    Tiền vào
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistoryFilter('out')}
                    className={`px-2.5 py-1 rounded-lg ${historyFilter === 'out' ? 'bg-rose-600 text-white' : 'text-neutral-400'}`}
                  >
                    Tiền ra
                  </button>
                </div>
              </div>
            </div>

            {/* List */}
            <div className="bg-[#111827] border border-white/10 rounded-2xl p-5 divide-y divide-white/5 shadow-xl">
              {filteredTransactions.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 text-xs">
                  Không tìm thấy giao dịch nào phù hợp với bộ lọc
                </div>
              ) : (
                filteredTransactions.map((tx) => (
                  <div key={tx.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          tx.type === 'transfer_in' || tx.type === 'cashback'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-rose-500/15 text-rose-400'
                        }`}
                      >
                        {tx.type === 'transfer_in' || tx.type === 'cashback' ? (
                          <ArrowDownLeft className="w-5 h-5" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white">
                          {tx.type === 'transfer_in' ? tx.senderName : tx.receiverName}
                        </div>
                        <div className="text-[11px] text-neutral-300 mt-0.5">{tx.message}</div>
                        <div className="text-[10px] text-neutral-500 mt-0.5 font-mono">
                          Mã GD: {tx.id} • {tx.timestamp}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div
                        className={`font-mono text-sm font-bold ${
                          tx.type === 'transfer_in' || tx.type === 'cashback'
                            ? 'text-emerald-400'
                            : 'text-white'
                        }`}
                      >
                        {tx.type === 'transfer_in' || tx.type === 'cashback' ? '+' : '-'}
                        {formatVND(tx.amount)}
                      </div>
                      <span className="text-[10px] text-emerald-400 font-semibold">{tx.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. SMART OTP VERIFICATION MODAL */}
      {isVerifyingOtp && (
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#161d2d] border border-white/20 rounded-2xl shadow-2xl p-6 text-white space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base">Xác Thực Smart OTP</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Giao dịch chuyển tiền số tiền <strong className="text-emerald-400">{formatVND(parseInt(transferAmount || '0', 10))}</strong>
              </p>
            </div>

            {/* Simulated Smart OTP Box */}
            <div className="bg-black/30 border border-white/10 rounded-xl p-3 text-center">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-1">Mã Smart OTP an toàn tự sinh:</span>
              <span className="text-2xl font-black font-mono tracking-[0.25em] text-amber-400">{generatedOtp}</span>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-neutral-300 block text-center">
                Nhập 6 số Smart OTP để hoàn tất:
              </label>
              <input
                type="text"
                maxLength={6}
                autoFocus
                placeholder="Nhập 6 số"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full text-center bg-[#1e293b] border border-white/15 rounded-xl py-2.5 text-lg font-mono font-bold tracking-widest text-white outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsVerifyingOtp(false)}
                className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-neutral-400"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleVerifyOtpAndSend}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-xs font-bold text-white shadow-md cursor-pointer"
              >
                Xác Nhận Chuyển
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. TRANSACTION RECEIPT MODAL */}
      {lastReceipt && (
        <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white text-slate-900 rounded-3xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200 border-4 border-emerald-500/30">
            {/* Header Success Check */}
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-black text-lg text-emerald-700">CHUYỂN TIỀN THÀNH CÔNG</h3>
              <div className="text-2xl font-black text-slate-900 font-mono mt-1">
                {formatVND(lastReceipt.amount)}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">{lastReceipt.timestamp}</span>
            </div>

            {/* Receipt Details */}
            <div className="bg-slate-50 rounded-2xl p-4 space-y-2 text-xs border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Người nhận:</span>
                <span className="font-bold text-slate-800 text-right">{lastReceipt.receiverName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ngân hàng:</span>
                <span className="font-semibold text-slate-800">{lastReceipt.receiverBank}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tài khoản nhận:</span>
                <span className="font-mono font-bold text-slate-800">{lastReceipt.receiverAccount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nội dung:</span>
                <span className="font-medium text-slate-700 text-right max-w-[180px] truncate">{lastReceipt.message}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="text-slate-500">Mã giao dịch:</span>
                <span className="font-mono font-bold text-sky-700">{lastReceipt.id}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setLastReceipt(null);
                  setActiveTab('dashboard');
                }}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 font-bold text-xs text-white transition-colors"
              >
                Hoàn Tất & Về Trang Chủ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[99999] bg-[#1e293b] text-white border border-sky-500/40 px-5 py-2.5 rounded-full shadow-2xl text-xs font-semibold flex items-center gap-2 pointer-events-none animate-in fade-in slide-in-from-bottom-2">
          <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
export default SwiftBank;
