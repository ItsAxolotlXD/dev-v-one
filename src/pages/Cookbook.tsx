import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  Clock,
  Users,
  Flame,
  ChefHat,
  Bookmark,
  BookmarkCheck,
  Star,
  Play,
  RotateCcw,
  Check,
  Plus,
  Share2,
  SlidersHorizontal,
  X,
  Timer as TimerIcon,
  Sparkles,
  Utensils,
  Award,
  Heart
} from 'lucide-react';
import { FluentCookbookColorIcon, FluentSearchIcon } from '../components/FluentIcons';

interface Recipe {
  id: string;
  title: string;
  category: string;
  region: 'Bắc' | 'Trung' | 'Nam' | 'Quốc tế';
  time: number; // minutes
  difficulty: 'Dễ' | 'Vừa' | 'Nâng cao';
  calories: number;
  rating: number;
  image: string;
  description: string;
  baseServings: number;
  ingredients: { name: string; amount: number; unit: string }[];
  steps: { step: number; instruction: string; timerMinutes?: number }[];
  tips: string;
  author: string;
}

const INITIAL_RECIPES: Recipe[] = [
  {
    id: 'pho-bo-ha-noi',
    title: 'Phở bò Hà Nội truyền thống',
    category: 'Món nước',
    region: 'Bắc',
    time: 60,
    difficulty: 'Vừa',
    calories: 450,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop&q=80',
    description: 'Nước dùng trong vắt, ngọt thanh từ xương bò hầm cùng thảo quả, quế, hồi và hành nướng thơm nức mũi.',
    baseServings: 4,
    ingredients: [
      { name: 'Xương ống bò', amount: 1000, unit: 'g' },
      { name: 'Bánh phở tươi', amount: 500, unit: 'g' },
      { name: 'Thịt bò phi lê', amount: 300, unit: 'g' },
      { name: 'Hành tây & gừng nướng', amount: 2, unit: 'củ' },
      { name: 'Hoa hồi, quế, thảo quả', amount: 15, unit: 'g' },
      { name: 'Hành hoa, ngò gai', amount: 50, unit: 'g' }
    ],
    steps: [
      { step: 1, instruction: 'Chần xương ống bò qua nước sôi với chút muối để khử mùi hôi, sau đó rửa lại thật sạch dưới vòi nước lạnh.', timerMinutes: 5 },
      { step: 2, instruction: 'Nướng hành tây, củ gừng và rang sơ hoa hồi, quế, thảo quả cho dậy mùi thơm nồng.', timerMinutes: 8 },
      { step: 3, instruction: 'Ninh xương bò với 3 lít nước cùng túi gia vị thơm trong lửa nhỏ liu riu, hớt bọt liên tục để nước dùng trong vắt.', timerMinutes: 40 },
      { step: 4, instruction: 'Trần bánh phở qua nước sôi, xếp thịt bò thái mỏng, rắc hành lá thái nhỏ và chan nước dùng sôi sùng sục.' }
    ],
    tips: 'Để nước phở trong và ngọt sâu, tuyệt đối không đậy nắp vung khi ninh và luôn giữ lửa liu riu không sôi bùng.',
    author: 'Nghệ nhân Ẩm thực Hà Thành'
  },
  {
    id: 'thit-kho-tau',
    title: 'Thịt kho tàu trứng cút nước dừa',
    category: 'Món mặn',
    region: 'Nam',
    time: 45,
    difficulty: 'Dễ',
    calories: 520,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
    description: 'Thịt ba chỉ mềm rục óng ả màu cánh gián, trứng bùi ngậy quyện nước dừa tươi ngọt đậm đà chuẩn vị cơm mẹ nấu.',
    baseServings: 4,
    ingredients: [
      { name: 'Thịt ba rọi rút sườn', amount: 600, unit: 'g' },
      { name: 'Trứng cút (hoặc trứng vịt)', amount: 15, unit: 'quả' },
      { name: 'Nước dừa tươi', amount: 500, unit: 'ml' },
      { name: 'Nước mắm cá cơm', amount: 4, unit: 'muỗng canh' },
      { name: 'Tỏi, hành tím băm', amount: 20, unit: 'g' }
    ],
    steps: [
      { step: 1, instruction: 'Thịt cắt miếng vuông 3-4cm, ướp với hành tỏi băm, nước mắm, tiêu và đường trong 30 phút.', timerMinutes: 30 },
      { step: 2, instruction: 'Luộc chín trứng cút, bóc sạch vỏ rồi để ráo.' },
      { step: 3, instruction: 'Thắng nước màu cánh gián, cho thịt vào đảo săn đều các mặt.', timerMinutes: 5 },
      { step: 4, instruction: 'Đổ nước dừa ngập mặt thịt, kho lửa nhỏ đến khi thịt mềm, cho trứng vào kho thêm 15 phút cho thấm màu.', timerMinutes: 25 }
    ],
    tips: 'Kho bằng nước dừa xiêm sẽ cho vị ngọt thanh tự nhiên và thịt mau mềm hơn kho nước lọc thông thường.',
    author: 'Bếp Nhà Miền Tây'
  },
  {
    id: 'bun-bo-hue',
    title: 'Bún bò Huế cay nồng chuẩn vị Cố Đô',
    category: 'Món nước',
    region: 'Trung',
    time: 55,
    difficulty: 'Vừa',
    calories: 510,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80',
    description: 'Hương sả nồng nàn quyện mắm ruốc Huế đặc trưng, sợi bún to ăn kèm bắp bò hoa và chả cua thơm lừng.',
    baseServings: 4,
    ingredients: [
      { name: 'Bắp bò hoa', amount: 500, unit: 'g' },
      { name: 'Giò heo', amount: 500, unit: 'g' },
      { name: 'Mắm ruốc Huế', amount: 2, unit: 'muỗng canh' },
      { name: 'Sả cây đập dập', amount: 6, unit: 'nhánh' },
      { name: 'Bún sợi to', amount: 500, unit: 'g' },
      { name: 'Sa tế tôm dầu điều', amount: 2, unit: 'muỗng canh' }
    ],
    steps: [
      { step: 1, instruction: 'Hầm bắp bò và giò heo với sả đập dập cho mềm vừa tới.', timerMinutes: 35 },
      { step: 2, instruction: 'Hòa mắm ruốc với nước lạnh, gạn lấy nước trong rồi cho vào nồi nước dùng.', timerMinutes: 5 },
      { step: 3, instruction: 'Phi thơm sa tế dầu điều đổ vào nồi để tạo màu đỏ cam hấp dẫn.', timerMinutes: 3 },
      { step: 4, instruction: 'Trần bún, xếp thịt, chả, chan nước dùng thơm phức và ăn kèm rau chuối bào.' }
    ],
    tips: 'Mắm ruốc nhất thiết phải hòa nước lạnh và gạn lấy phần trong để nước dùng không bị gắt mùi cặn lắng.',
    author: 'Đầu Bếp Cung Đình Huế'
  },
  {
    id: 'canh-chua-ca-loc',
    title: 'Canh chua cá lóc Nam Bộ',
    category: 'Canh & Súp',
    region: 'Nam',
    time: 25,
    difficulty: 'Dễ',
    calories: 280,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&auto=format&fit=crop&q=80',
    description: 'Vị chua thanh mát từ me dầm, thơm ngọt từ cá lóc đồng và rau ngò gai, bạc hà giòn sần sật xua tan ngày oi bức.',
    baseServings: 4,
    ingredients: [
      { name: 'Cá lóc đồng làm sạch', amount: 600, unit: 'g' },
      { name: 'Me vắt', amount: 50, unit: 'g' },
      { name: 'Bạc hà, đậu bắp, cà chua', amount: 300, unit: 'g' },
      { name: 'Giá đỗ & thơm (dứa)', amount: 200, unit: 'g' },
      { name: 'Ngò gai, rau ngổ, tỏi phi', amount: 30, unit: 'g' }
    ],
    steps: [
      { step: 1, instruction: 'Cá lóc cắt khúc vừa ăn, chà xát muối chanh để khử nhớt.', timerMinutes: 5 },
      { step: 2, instruction: 'Dầm me với nước sôi lọc lấy nước cốt chua.', timerMinutes: 3 },
      { step: 3, instruction: 'Nấu sôi nước me, thả cá vào luộc chín tới, vớt bọt liên tục.', timerMinutes: 10 },
      { step: 4, instruction: 'Cho thơm, cà chua, bạc hà, đậu bắp vào nấu sôi lại, nêm nếm gia vị rồi rắc rau ngổ và tỏi phi thơm.' }
    ],
    tips: 'Bạc hà nên bóp sơ với muối hạt rồi rửa sạch để khi nấu không bị ngứa họng và giữ được độ giòn xốp.',
    author: 'Mẹ Bắp Phương Nam'
  },
  {
    id: 'dau-sot-ca-chua',
    title: 'Đậu hũ non sốt cà chua nấm đông cô (Món Chay)',
    category: 'Món chay',
    region: 'Quốc tế',
    time: 15,
    difficulty: 'Dễ',
    calories: 190,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
    description: 'Món chay thanh tịnh, sốt cà chua sánh mịn hòa quyện đậu hũ béo mềm và nấm ngọt giòn tự nhiên.',
    baseServings: 2,
    ingredients: [
      { name: 'Đậu hũ non', amount: 300, unit: 'g' },
      { name: 'Cà chua chín đỏ', amount: 3, unit: 'quả' },
      { name: 'Nấm đông cô tươi', amount: 100, unit: 'g' },
      { name: 'Hành boaro thái nhỏ', amount: 20, unit: 'g' },
      { name: 'Hạt nêm nấm chay', amount: 1.5, unit: 'muỗng cà phê' }
    ],
    steps: [
      { step: 1, instruction: 'Đậu hũ cắt quân cờ, chiên vàng sơ hai mặt hoặc để nguyên thanh tịnh.', timerMinutes: 4 },
      { step: 2, instruction: 'Xào thơm boaro, cho cà chua thái hạt lựu và nấm vào đảo nhuyễn tạo sốt.', timerMinutes: 6 },
      { step: 3, instruction: 'Thả đậu hũ vào om liu riu 5 phút cho ngấm gia vị, rắc tiêu và ngò rí lên trên.', timerMinutes: 5 }
    ],
    tips: 'Dùng đậu hũ non chiên lướt ván sẽ giữ được phần ruột mềm mướt tan trong miệng.',
    author: 'Bếp Thuần Chay An Lạc'
  },
  {
    id: 'tra-sua-tran-chau',
    title: 'Trà sữa Oolong nướng trân châu hoàng kim',
    category: 'Đồ uống',
    region: 'Quốc tế',
    time: 20,
    difficulty: 'Dễ',
    calories: 320,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1558857563-b37cf5a2a229?w=800&auto=format&fit=crop&q=80',
    description: 'Hương trà Oolong rang đậm vị hòa quyện sữa tươi thanh trùng béo ngậy và trân châu dẻo quánh ngập đường nâu.',
    baseServings: 2,
    ingredients: [
      { name: 'Trà Oolong nướng', amount: 20, unit: 'g' },
      { name: 'Sữa tươi thanh trùng', amount: 300, unit: 'ml' },
      { name: 'Sữa đặc Ông Thọ', amount: 40, unit: 'ml' },
      { name: 'Trân châu đen/hoàng kim', amount: 150, unit: 'g' },
      { name: 'Đường nâu Hàn Quốc', amount: 50, unit: 'g' }
    ],
    steps: [
      { step: 1, instruction: 'Ủ trà Oolong với 250ml nước 90°C trong 10 phút rồi lọc bỏ bã trà.', timerMinutes: 10 },
      { step: 2, instruction: 'Luộc trân châu trong 15 phút, ủ tiếp 15 phút rồi sên cùng đường nâu ấm nóng.', timerMinutes: 15 },
      { step: 3, instruction: 'Khuấy đều nước cốt trà với sữa đặc và sữa tươi, cho đá và múc trân châu đường nâu vào ly.' }
    ],
    tips: 'Trân châu sau khi luộc ủ trong nồi đậy nắp sẽ mềm dẻo từ trong ra ngoài và không bị cứng lõi.',
    author: 'Barista Sáng Tạo'
  }
];

export const Cookbook: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    try {
      const saved = localStorage.getItem('vone_cookbook_recipes');
      return saved ? JSON.parse(saved) : INITIAL_RECIPES;
    } catch {
      return INITIAL_RECIPES;
    }
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [selectedRegion, setSelectedRegion] = useState<string>('Tất cả');
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);

  // Scaled servings for active recipe
  const [servings, setServings] = useState<number>(4);
  const [favorites, setFavorites] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('vone_cookbook_favorites');
      return saved ? JSON.parse(saved) : { 'pho-bo-ha-noi': true };
    } catch {
      return {};
    }
  });

  // Checklist of ingredients
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});

  // Step countdown timer
  const [stepTimerSeconds, setStepTimerSeconds] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Save favorites to storage
  const toggleFavorite = (recipeId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFavorites((prev) => {
      const next = { ...prev, [recipeId]: !prev[recipeId] };
      try {
        localStorage.setItem('vone_cookbook_favorites', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Select recipe
  const handleOpenRecipe = (recipe: Recipe) => {
    setActiveRecipe(recipe);
    setServings(recipe.baseServings);
    setCheckedIngredients({});
    setStepTimerSeconds(null);
    setIsTimerRunning(false);
  };

  // Timer logic
  useEffect(() => {
    if (isTimerRunning && stepTimerSeconds !== null && stepTimerSeconds > 0) {
      timerIntervalRef.current = setInterval(() => {
        setStepTimerSeconds((prev) => {
          if (prev === null || prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning, stepTimerSeconds]);

  const startStepTimer = (minutes: number) => {
    setStepTimerSeconds(minutes * 60);
    setIsTimerRunning(true);
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Categories list
  const categories = ['Tất cả', 'Món mặn', 'Món nước', 'Canh & Súp', 'Món chay', 'Đồ uống', 'Yêu thích'];

  // Filter recipes
  const filteredRecipes = useMemo(() => {
    return recipes.filter((r) => {
      const matchesSearch =
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.ingredients.some((ing) => ing.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'Tất cả'
          ? true
          : selectedCategory === 'Yêu thích'
          ? Boolean(favorites[r.id])
          : r.category === selectedCategory;

      const matchesRegion = selectedRegion === 'Tất cả' || r.region === selectedRegion;

      return matchesSearch && matchesCategory && matchesRegion;
    });
  }, [recipes, searchQuery, selectedCategory, selectedRegion, favorites]);

  // Scaled ingredients multiplier
  const scaleRatio = activeRecipe ? servings / activeRecipe.baseServings : 1;

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex flex-col bg-[#f9f9f9] dark:bg-[#1a1c20] text-black dark:text-white select-none">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#22252a] border-b border-black/10 dark:border-white/10 px-4 sm:px-6 py-5 shrink-0 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <FluentCookbookColorIcon className="w-9 h-9 shrink-0 drop-shadow-sm" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  Cookbook Sparkle (Dev)
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 text-[10px] font-bold uppercase tracking-wider">
                  Ẩm thực Việt & Quốc tế
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Cẩm nang công thức nấu ăn chuẩn vị, hẹn giờ nấu theo bước & tự động cân đối khẩu phần
              </p>
            </div>
          </div>

          {/* Search Input with 5px radius */}
          <div className="relative w-full md:w-80 lg:w-96 h-10 flex items-center px-4 rounded-[5px] bg-black/5 dark:bg-white/[0.06] border border-black/10 dark:border-white/10 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all shadow-2xs">
            <FluentSearchIcon className="w-4 h-4 text-neutral-400 mr-2.5 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm Món Ăn, Nguyên Liệu, Thịt Bò, Canh Chua..."
              className="w-full bg-transparent text-xs sm:text-sm text-neutral-900 dark:text-white placeholder-neutral-400 outline-none border-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-neutral-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 flex-1 flex flex-col">
        {/* Category Filters Bar (Pills style) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs'
                      : 'bg-white dark:bg-[#22252a] text-neutral-700 dark:text-neutral-300 border border-black/10 dark:border-white/10 hover:bg-black/5'
                  }`}
                >
                  {cat === 'Yêu thích' ? `❤️ ${cat} (${Object.values(favorites).filter(Boolean).length})` : cat}
                </button>
              );
            })}
          </div>

          {/* Region Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-neutral-400 text-[11px] mr-1">Vùng miền:</span>
            {['Tất cả', 'Bắc', 'Trung', 'Nam'].map((reg) => (
              <button
                key={reg}
                type="button"
                onClick={() => setSelectedRegion(reg)}
                className={`px-2.5 py-1 rounded-full text-[11px] transition-all cursor-pointer ${
                  selectedRegion === reg
                    ? 'bg-orange-600/15 text-orange-600 dark:text-orange-400 font-bold'
                    : 'text-neutral-500 hover:text-black dark:hover:text-white'
                }`}
              >
                {reg}
              </button>
            ))}
          </div>
        </div>

        {/* Recipe Cards Grid */}
        {filteredRecipes.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-16 text-center text-neutral-400 space-y-3">
            <ChefHat className="w-12 h-12 text-neutral-300 dark:text-neutral-600" />
            <p className="text-sm font-semibold">Không tìm thấy món ăn nào phù hợp</p>
            <p className="text-xs">Thử thay đổi từ khóa tìm kiếm hoặc danh mục món ăn</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRecipes.map((recipe) => {
              const isFav = Boolean(favorites[recipe.id]);
              return (
                <div
                  key={recipe.id}
                  onClick={() => handleOpenRecipe(recipe)}
                  className="group bg-white dark:bg-[#22252a] rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col"
                >
                  {/* Recipe Image & Overlay Badges */}
                  <div className="relative aspect-video w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Bookmark Button */}
                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(recipe.id, e)}
                      title={isFav ? 'Bỏ lưu' : 'Lưu công thức'}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all cursor-pointer"
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                    </button>

                    {/* Category & Region Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                        {recipe.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-orange-600/90 text-white text-[10px] font-bold">
                        Miền {recipe.region}
                      </span>
                    </div>

                    {/* Cook time & Rating at bottom of image */}
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs font-medium">
                      <div className="flex items-center gap-1.5 drop-shadow-sm">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{recipe.time} phút</span>
                      </div>
                      <div className="flex items-center gap-1 drop-shadow-sm text-amber-300">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{recipe.rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Recipe Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white line-clamp-1 group-hover:text-orange-500 transition-colors">
                        {recipe.title}
                      </h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                        {recipe.description}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
                      <div className="flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-orange-500" />
                        <span>{recipe.calories} kcal</span>
                      </div>
                      <span className="font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Xem chi tiết →
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RECIPE DETAIL MODAL */}
      {activeRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
          <div className="w-full max-w-3xl bg-white dark:bg-[#22252a] rounded-3xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
            {/* Modal Header Image */}
            <div className="relative aspect-21/9 w-full overflow-hidden bg-neutral-900 shrink-0">
              <img
                src={activeRecipe.image}
                alt={activeRecipe.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/30" />

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setActiveRecipe(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/70 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Title & Metadata */}
              <div className="absolute bottom-4 left-5 right-5 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-orange-600 text-white text-[11px] font-bold">
                    {activeRecipe.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-medium">
                    Miền {activeRecipe.region}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  {activeRecipe.title}
                </h2>
              </div>
            </div>

            {/* Modal Body Scroll Area */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 text-neutral-800 dark:text-neutral-200">
              {/* Quick Info Grid */}
              <div className="grid grid-cols-4 gap-2 p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] text-center text-xs">
                <div>
                  <Clock className="w-4 h-4 mx-auto text-orange-500 mb-1" />
                  <span className="text-[10px] text-neutral-400 block">Thời gian</span>
                  <span className="font-bold">{activeRecipe.time} phút</span>
                </div>
                <div>
                  <Award className="w-4 h-4 mx-auto text-orange-500 mb-1" />
                  <span className="text-[10px] text-neutral-400 block">Độ khó</span>
                  <span className="font-bold">{activeRecipe.difficulty}</span>
                </div>
                <div>
                  <Flame className="w-4 h-4 mx-auto text-orange-500 mb-1" />
                  <span className="text-[10px] text-neutral-400 block">Năng lượng</span>
                  <span className="font-bold">{activeRecipe.calories} kcal</span>
                </div>
                <div>
                  <Star className="w-4 h-4 mx-auto text-amber-500 mb-1 fill-current" />
                  <span className="text-[10px] text-neutral-400 block">Đánh giá</span>
                  <span className="font-bold">{activeRecipe.rating} / 5</span>
                </div>
              </div>

              {/* Servings Scaler */}
              <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider block">
                    Khẩu phần người ăn
                  </span>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Nguyên liệu tự động nhân tỷ lệ theo số người
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {[2, 4, 6, 8].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setServings(num)}
                      className={`w-8 h-8 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        servings === num
                          ? 'bg-orange-500 text-white shadow-xs'
                          : 'bg-white dark:bg-[#333] text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                  <span className="text-xs font-medium ml-1">người</span>
                </div>
              </div>

              {/* Ingredients Checklist */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-orange-500" />
                  Nguyên liệu cần chuẩn bị ({activeRecipe.ingredients.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {activeRecipe.ingredients.map((ing, idx) => {
                    const scaledAmount = Math.round(ing.amount * scaleRatio * 10) / 10;
                    const isChecked = Boolean(checkedIngredients[ing.name]);

                    return (
                      <div
                        key={ing.name}
                        onClick={() =>
                          setCheckedIngredients((prev) => ({ ...prev, [ing.name]: !prev[ing.name] }))
                        }
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 line-through'
                            : 'bg-black/[0.02] dark:bg-white/[0.03] border-black/5 dark:border-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isChecked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-neutral-400'
                            }`}
                          >
                            {isChecked && <Check className="w-2.5 h-2.5" />}
                          </div>
                          <span className="font-medium">{ing.name}</span>
                        </div>
                        <span className="font-mono font-bold text-neutral-600 dark:text-neutral-300">
                          {scaledAmount} {ing.unit}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step-by-Step Cooking Guide with Interactive Timers */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-2">
                    <ChefHat className="w-4 h-4 text-orange-500" />
                    Các bước thực hiện
                  </h3>
                  {stepTimerSeconds !== null && (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500 text-white text-xs font-mono font-bold">
                      <TimerIcon className="w-3.5 h-3.5 animate-spin" />
                      <span>{formatTimer(stepTimerSeconds)}</span>
                      <button
                        type="button"
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                        className="underline ml-1"
                      >
                        {isTimerRunning ? 'Dừng' : 'Tiếp'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {activeRecipe.steps.map((st) => (
                    <div
                      key={st.step}
                      className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-bold">
                          Bước {st.step}
                        </span>
                        {st.timerMinutes && (
                          <button
                            type="button"
                            onClick={() => startStepTimer(st.timerMinutes!)}
                            className="px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 hover:bg-orange-500 hover:text-white text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <TimerIcon className="w-3 h-3" />
                            <span>Hẹn giờ {st.timerMinutes} phút</span>
                          </button>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed">
                        {st.instruction}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chef Tips */}
              {activeRecipe.tips && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs">
                  <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-4 h-4" />
                    Mẹo ngon từ đầu bếp:
                  </span>
                  <p className="text-neutral-700 dark:text-neutral-300">
                    {activeRecipe.tips}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-neutral-50 dark:bg-[#1f2125] border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs shrink-0">
              <span className="text-neutral-400">
                Tác giả: {activeRecipe.author}
              </span>
              <button
                type="button"
                onClick={() => setActiveRecipe(null)}
                className="px-5 py-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-xs cursor-pointer"
              >
                Hoàn tất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
