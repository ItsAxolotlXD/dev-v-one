import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

const SYSTEM_INSTRUCTION = `Bạn là Copilot - trợ lý trí tuệ nhân tạo (AI Assistant) chính thức của V-One (Dev) (nền tảng truyền hình trực tuyến, xem tin tức thời sự, ghi chú văn phòng và công cụ phong cách Microsoft Fluent Design).

Nguyên tắc trả lời:
- Luôn thân thiện, thông minh, trả lời ngắn gọn, mạch lạc và súc tích bằng tiếng Việt (hoặc ngôn ngữ theo người dùng).
- Am hiểu sâu sắc về hệ thống kênh truyền hình Việt Nam (VTV1-VTV9, HTV, SCTV, VTC, THVL, VOV, kênh thể thao, phim ảnh,...).
- HỖ TRỢ ACTION COMMAND /find VÀ /search: Khi người dùng nhập lệnh có dạng "/find <từ khóa>" hoặc "/search <từ khóa>", hãy đóng vai trò công cụ tìm kiếm Copilot thông minh. Định dạng câu trả lời như sau:
  🔍 **Kết quả tìm kiếm Copilot cho:** "<từ khóa>"
  • 📺 **Kênh truyền hình & Nội dung phát sóng:** Liệt kê các kênh liên quan (ví dụ VTV1, HTV7, Bóng đá,...) và mô tả ngắn.
  • 📰 **Tin tức & Sự kiện liên quan:** Tóm tắt các chủ đề thời sự, công nghệ, đời sống mới nhất xoay quanh từ khóa.
  • ⚙️ **Ứng dụng & Tính năng V-One phù hợp:** Chỉ dẫn mở nhanh ứng dụng liên quan (Clock, Direct Cut, Swift Bank, Live TV, Widgets, Task Manager, Notes).
  • 💡 **Tóm tắt nhanh:** Đưa ra giải đáp súc tích, câu trả lời trực tiếp cho câu hỏi hoặc từ khóa.
- Hướng dẫn thành thạo các tính năng của V-One (Dev):
  + Watch / Live TV: Xem trực tiếp các kênh truyền hình HD, chuyển kênh nhanh, chỉnh tỉ lệ 16:9 / 4:3.
  + Clock: Đặt báo thức với âm chuông Chime/Digital/Radar, xem giờ thế giới tại 9+ thành phố lớn, bấm giờ thể thao chính xác và hẹn giờ đếm ngược.
  + Direct Cut: Dựng phim chuyên nghiệp đa timeline, cắt ghép clip, hiệu ứng chuyển cảnh, bộ lọc màu Cinematic LUTs và xuất video.
  + Swift Bank: Ngân hàng số bảo mật chuẩn Fluent, chuyển khoản 24/7, gửi tiết kiệm sinh lời, mở thẻ ảo và quét mã QR.
  + Widgets Board: Bảng tiện ích đa năng phong cách Windows 11 với thời tiết, lịch, ảnh kỷ niệm, chứng khoán và tin tức real-time từ VnExpress.
  + Task Manager: Bảng quản lý tiến trình thời gian thực, đo CPU, RAM, Network, GPU và tắt tác vụ.
  + Articles: Đọc tin tức, tóm tắt bài viết bằng AI, đọc văn bản Text-to-Speech.
  + Lịch phát sóng (Schedule): Tra cứu lịch phát sóng truyền hình EPG chi tiết của toàn bộ hệ thống kênh VTV, HTV, SCTV, VTC,... Hỗ trợ tìm kiếm chương trình, đặt báo thức nhắc nhở và xem trực tiếp.
  + Cookbook: Cẩm nang ẩm thực và công thức nấu ăn chuẩn vị 3 miền (Bắc - Trung - Nam) & quốc tế. Tự động tính toán tỷ lệ nguyên liệu theo số người ăn, danh sách đi chợ và tích hợp đồng hồ hẹn giờ đếm ngược từng bước nấu.
  + Swift Social: Mạng xã hội All-in-One kết hợp dòng thời gian Threads/Twitter, bảng tin Facebook, ảnh 24h Stories Instagram, chat Messenger và phòng thoại/kênh cộng đồng Discord.
  + Friends: Danh sách 100 người dùng V-One ngẫu nhiên với nickname độc đáo (@hoangnam.dev, @minhthu.vone,...), hiển thị trạng thái hoạt động trực tiếp, xem TV, nghe nhạc và kết bạn.
  + VLC Media Player: Trình phát đa phương tiện chuẩn màu cam VLC và phong cách Fluent V-One. Hỗ trợ mở tệp nội bộ, luồng mạng (network stream), danh sách phát playlist, bộ chỉnh âm Equalizer 10 dải, bộ lọc hiệu ứng video, tăng cường âm lượng cực đại lên tới 200% (VLC boost), chụp ảnh khung hình snapshot và tiến từng khung hình frame step.
  + Photopea: Trình biên tập hình ảnh trực tuyến đồ họa chuyên nghiệp (hỗ trợ định dạng Photoshop PSD, AI, XD, Sketch, RAW, PDF) tương tự như tab Craftmine.
  + MSN Feed: Bảng tin đời sống, thời sự, giải trí và phong cách sống từ msn.com/vi-vn hiển thị toàn trang liền mạch.
  + Craftmine: Game khám phá sandbox 3D trên nền web.
- Trả lời thông minh mọi câu hỏi về kiến thức đời sống, khoa học, tin tức thời sự, tóm tắt nội dung hoặc giải trí.
- Sử dụng định dạng gạch đầu dòng rõ ràng, dễ nhìn.`;

// In-memory cache for VnExpress RSS
interface CachedNews {
  timestamp: number;
  data: any[];
}
let newsCache: CachedNews | null = null;
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache

// Helper to parse XML RSS from VnExpress
function parseRssXml(xmlText: string) {
  const items: any[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  let idCounter = 1;

  while ((match = itemRegex.exec(xmlText)) !== null && items.length < 30) {
    const itemXml = match[1];
    const titleMatch = /<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/.exec(itemXml);
    const linkMatch = /<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/.exec(itemXml);
    const pubDateMatch = /<pubDate>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/pubDate>/.exec(itemXml);
    const descMatch = /<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/.exec(itemXml);
    const enclosureMatch = /<enclosure[^>]*url=[\"']([^\"']+)[\"']/.exec(itemXml);

    let img = enclosureMatch ? enclosureMatch[1] : '';
    let cleanDesc = '';
    if (descMatch) {
      if (!img) {
        const imgMatch = /<img[^>]*src=[\"']([^\"']+)[\"']/.exec(descMatch[1]);
        if (imgMatch) img = imgMatch[1];
      }
      cleanDesc = descMatch[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
    }

    if (!img) {
      img = 'https://s1.vnecdn.net/vnexpress/restruct/i/v855/v2_2019/pc/graphics/logo.svg';
    }

    const title = titleMatch ? titleMatch[1].trim() : 'Tin tức VnExpress';
    const link = linkMatch ? linkMatch[1].trim() : 'https://vnexpress.net';
    const pubDate = pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString();

    items.push({
      id: `vne-${Date.now()}-${idCounter++}`,
      title,
      link,
      pubDate,
      description: cleanDesc || title,
      imageUrl: img,
      source: 'VnExpress'
    });
  }

  return items;
}

// Fallback articles if VnExpress network is down
const FALLBACK_VNEXPRESS_NEWS = [
  {
    id: 'fb-1',
    title: 'Thị trường công nghệ đón nhận làn sóng nâng cấp AI thế hệ mới',
    link: 'https://vnexpress.net',
    pubDate: 'Mon, 12 Oct 2026 15:30:00 +0700',
    description: 'Các tập đoàn công nghệ lớn liên tục tích hợp các mô hình trí tuệ nhân tạo thế hệ mới vào hệ điều hành và nền tảng dịch vụ.',
    imageUrl: 'https://vcdn1-vnexpress.vnecdn.net/2026/10/12/12-1791792565-9383-1791792583.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=dYMdNpTlc0sGu_BCVjKx0g',
    source: 'VnExpress'
  },
  {
    id: 'fb-2',
    title: 'Hạ tầng số Việt Nam bứt phá với các giải pháp truyền hình đa nền tảng',
    link: 'https://vnexpress.net',
    pubDate: 'Mon, 12 Oct 2026 14:15:00 +0700',
    description: 'Các giải pháp truyền dẫn trực tuyến chuẩn HLS độ trễ thấp mang lại trải nghiệm xem truyền hình sắc nét cho người dùng cả nước.',
    imageUrl: 'https://vcdn1-vnexpress.vnecdn.net/2026/10/12/GeminiGeneratedImageyxxcc0yxxc-5642-1454-1791795399.png?w=1200&h=0&q=100&dpr=1&fit=crop&s=cYGimVQpPzsAh1aAMvHa9A',
    source: 'VnExpress'
  },
  {
    id: 'fb-3',
    title: 'Dự báo thời tiết các khu vực trên cả nước trong tuần mới',
    link: 'https://vnexpress.net',
    pubDate: 'Mon, 12 Oct 2026 13:00:00 +0700',
    description: 'Bắc Bộ duy trì thời tiết mát mẻ dễ chịu, trong khi khu vực Nam Bộ có mưa rào rải rác về chiều tối.',
    imageUrl: 'https://vcdn1-vnexpress.vnecdn.net/2026/10/12/gemini-generated-imagehgj4c1hg-8847-3849-1791793049.png?w=1200&h=0&q=100&dpr=1&fit=crop&s=a8eEFn-MzysZwbPrIEQkXg',
    source: 'VnExpress'
  }
];

// Endpoint 1: VnExpress Real-Time News API
app.get('/api/vnexpress-news', async (_req, res) => {
  try {
    if (newsCache && Date.now() - newsCache.timestamp < CACHE_TTL_MS) {
      return res.json({ articles: newsCache.data, cached: true });
    }

    const rssResponse = await fetch('https://vnexpress.net/rss/tin-moi-nhat.rss', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
      }
    });

    if (!rssResponse.ok) {
      throw new Error(`VnExpress RSS HTTP ${rssResponse.status}`);
    }

    const xml = await rssResponse.text();
    const parsed = parseRssXml(xml);

    if (parsed.length > 0) {
      newsCache = {
        timestamp: Date.now(),
        data: parsed
      };
      return res.json({ articles: parsed, cached: false });
    }

    return res.json({ articles: FALLBACK_VNEXPRESS_NEWS, cached: false, fallback: true });
  } catch (err: any) {
    console.warn('[VnExpress RSS] Error fetching real-time feed:', err?.message);
    if (newsCache && newsCache.data.length > 0) {
      return res.json({ articles: newsCache.data, cached: true });
    }
    return res.json({ articles: FALLBACK_VNEXPRESS_NEWS, cached: false, fallback: true });
  }
});

// Endpoint 2: AI Copilot Chat & Search API
app.post('/api/copilot', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!ai) {
      return res.json({
        text: `Chào bạn! Tôi là Copilot của V-One (Dev). Bạn đang hỏi về: "${message}". Bạn có thể sử dụng thanh tìm kiếm để truy cập nhanh các kênh Live TV, mở bảng Widgets hoặc Task Manager!`
      });
    }

    // Build chat conversation context
    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const item of history.slice(-6)) {
        if (item.text && (item.role === 'user' || item.role === 'model')) {
          contents.push({
            role: item.role === 'model' ? 'model' : 'user',
            parts: [{ text: item.text }],
          });
        }
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    let responseText = '';
    try {
      // Primary attempt: gemini-3.8-flash per guidelines
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });
      responseText = response.text || '';
    } catch (primaryErr: any) {
      console.warn('[Copilot] gemini-3.8-flash busy/failed, falling back to gemini-2.5-flash:', primaryErr?.message);
      // Fallback model for high resilience
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });
      responseText = fallbackResponse.text || '';
    }

    return res.json({ text: responseText });
  } catch (error: any) {
    console.error('[Copilot Error]:', error);
    return res.status(500).json({
      error: 'Copilot đang bận, vui lòng thử lại sau giây lát.',
      details: error?.message,
    });
  }
});

// Start Express Server & Mount Vite in Development
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[V-One Dev Server] Running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
