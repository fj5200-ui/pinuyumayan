import 'dotenv/config';
import { createDb, users, tribes, articles, vocabulary, events, media, discussions, discussionReplies, culturalSites, eventRegistrations } from './index.js';
import bcrypt from 'bcryptjs';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not set');

  const db = createDb(connectionString);
  console.log('🌱 Seeding database...');

  // ── Tribes (卑南八社) ──
  const tribesData = [
    { name: '南王部落', traditionalName: 'Puyuma', region: '臺東市南王里', description: '南王部落（Puyuma）為卑南族最具代表性的部落之一，位於臺東市區北方，是卑南族文化保存最完整的部落。部落以其豐富的祭儀文化和傳統組織聞名，特別是猴祭和大獵祭等年度祭典，吸引眾多遊客前來觀禮。', history: '南王部落歷史悠久，為卑南族傳統八社之首，在荷蘭和清朝時期就已有詳細的文獻記載。日治時期經歷重大社會變遷，但部落仍堅持保存傳統文化。', latitude: 22.7828, longitude: 121.1081, population: 3500 },
    { name: '知本部落', traditionalName: 'Katipul', region: '臺東市知本里', description: '知本部落（Katipul）位於臺東市南方，緊鄰著名的知本溫泉區，是卑南族最大的部落之一。部落保有豐富的祭儀傳統和獨特的巫師文化。', history: '知本部落自古即為卑南族重要聚落，與南王部落並列為卑南族兩大勢力。日治時期曾歷經數次遷移，最終定居於現址。', latitude: 22.7019, longitude: 121.0408, population: 2800 },
    { name: '建和部落', traditionalName: 'Kasavakan', region: '臺東市建和里', description: '建和部落（Kasavakan）位於臺東市郊區，保有獨特的文化特色。部落的刺繡工藝和傳統樂舞在卑南族各社中獨樹一幟。', history: '建和部落源自知本部落的分支，約在清朝時期開始形成獨立的聚落。部落以其精美的刺繡工藝著稱，至今仍有族人傳承此一技藝。', latitude: 22.7325, longitude: 121.0781, population: 1800 },
    { name: '利嘉部落', traditionalName: 'Likavung', region: '臺東市利嘉里', description: '利嘉部落（Likavung）坐落於利嘉溪畔的寧靜部落，以農業和傳統生活方式為主，保有淳樸的部落風貌。', history: '利嘉部落位於臺東市北方利嘉溪流域，為卑南族傳統八社之一，歷史上以農業發展聞名。', latitude: 22.7946, longitude: 121.0781, population: 1200 },
    { name: '初鹿部落', traditionalName: 'Mulivelivek', region: '臺東縣卑南鄉初鹿村', description: '初鹿部落（Mulivelivek）是卑南族位置最北的部落，座落在初鹿牧場附近的山丘上，擁有優美的自然環境和豐富的農業文化。', history: '初鹿部落位於卑南鄉北部丘陵地帶，為卑南族最北端的聚落，與阿美族、布農族有密切的族群互動。', latitude: 22.8264, longitude: 121.0531, population: 950 },
    { name: '龍過脈部落', traditionalName: 'Alripay', region: '臺東縣卑南鄉溫泉村', description: '龍過脈部落（Alripay）隱身在臺東縱谷的小型部落，以保存古老的巫師信仰和傳統醫療知識著稱。', history: '龍過脈部落為卑南族八社中較小的聚落，但保存了許多珍貴的傳統信仰和口述歷史。', latitude: 22.7156, longitude: 121.0275, population: 600 },
    { name: '下賓朗部落', traditionalName: 'Pinaski', region: '臺東市賓朗里', description: '下賓朗部落（Pinaski）位於臺東市北郊，介於南王與初鹿之間，以傳統的年齡階級制度和歌謠傳統聞名。', history: '下賓朗部落歷史悠久，地處南王與初鹿之間的要道，歷史上扮演著族群交流的重要角色。', latitude: 22.8089, longitude: 121.0906, population: 800 },
    { name: '寶桑部落', traditionalName: 'Papulu', region: '臺東市寶桑里', description: '寶桑部落（Papulu）位於臺東市區，是卑南族最都市化的部落之一。儘管受到現代化影響，部落仍努力保存傳統文化和語言。', history: '寶桑部落位於現今臺東市中心地帶，清朝時期即有漢人與卑南族互動的記載，是最早接觸外來文化的部落之一。', latitude: 22.7558, longitude: 121.1425, population: 1500 },
  ];

  console.log('  → 插入部落資料...');
  for (const t of tribesData) {
    await db.insert(tribes).values(t).onConflictDoNothing();
  }

  // ── Users ──
  console.log('  → 插入使用者資料...');
  const adminPw = await bcrypt.hash('admin123', 12);
  const editorPw = await bcrypt.hash('editor123', 12);
  const userPw = await bcrypt.hash('user123', 12);

  await db.insert(users).values([
    { email: 'admin@pinuyumayan.tw', password: adminPw, name: '系統管理員', role: 'admin', bio: '平台管理者' },
    { email: 'editor@pinuyumayan.tw', password: editorPw, name: '文化編輯', role: 'editor', bio: '部落文化記錄者', tribeId: 1 },
    { email: 'user@pinuyumayan.tw', password: userPw, name: '訪客用戶', role: 'user', bio: '喜愛原住民文化的學習者', tribeId: 2 },
  ]).onConflictDoNothing();

  // ── Articles ──
  console.log('  → 插入文章資料...');
  const articlesData = [
    { title: '卑南族年祭（Mangayaw）的文化意義', slug: 'mangayaw-cultural-significance', content: '## 年祭的起源\n\n大獵祭（Mangayaw）是卑南族最重要的年度祭典之一，通常在每年12月舉行。這個祭典不僅是狩獵技能的展現，更是卑南族男子成年禮的重要環節。\n\n## 祭典的社會功能\n\n大獵祭在卑南族社會中扮演著多重角色：\n\n1. **年齡階級的晉升** — 青年通過大獵祭完成成年儀式\n2. **社會凝聚力** — 全部落共同參與，強化族群認同\n3. **文化傳承** — 長輩藉此機會傳授狩獵知識與禁忌\n4. **精神淨化** — 透過祭儀向祖靈祈求部落平安\n\n## 現代的傳承\n\n隨著現代化的衝擊，大獵祭的形式雖有所調整，但其核心精神——勇氣、團結與對自然的敬畏——始終未變。', excerpt: '探索卑南族最重要的年度祭典——大獵祭（Mangayaw）的文化意義、社會功能與現代傳承。', category: '文化', tags: '["年祭","Mangayaw","祭典","文化傳承"]', published: true, views: 342, authorId: 1 },
    { title: '卑南族傳統刺繡工藝之美', slug: 'puyuma-embroidery-art', content: '## 刺繡的文化意涵\n\n卑南族的刺繡工藝不僅是裝飾藝術，更是族群身份認同的重要象徵。每一針每一線都蘊含著對祖先的敬意和對土地的深情。\n\n## 傳統圖紋的意義\n\n- **菱形紋（眼睛紋）** — 象徵祖先的守護與關注\n- **蛇紋** — 代表百步蛇的力量與保護\n- **人形紋** — 表達對祖靈的崇敬\n- **太陽紋** — 象徵光明與生命的力量\n\n## 技藝傳承\n\n目前仍有族人致力於傳統刺繡技藝的傳承，透過工作坊和文化課程，讓新一代認識這項珍貴的文化遺產。', excerpt: '深入了解卑南族傳統刺繡工藝的文化意涵、圖紋象徵與技藝傳承。', category: '工藝', tags: '["刺繡","工藝","傳統","圖紋"]', published: true, views: 189, authorId: 2 },
    { title: '卑南語日常問候語教學', slug: 'puyuma-daily-greetings', content: '## 基本問候\n\n學習卑南語的第一步，就從日常問候開始！\n\n**maituud** — 你好\n這是卑南語中最常用的問候語，適用於各種場合。\n\n**uninan** — 謝謝\n表達感謝之意，是人際互動中不可或缺的詞語。\n\n## 時間問候\n\n- **maituud da maresep** — 早安（早上好）\n- **maituud da matrengtrengan** — 午安\n- **maituud da masepan** — 晚安\n\n## 實用對話\n\n學會了基本問候，試著用卑南語打招呼吧！每一次使用族語，都是對文化傳承最好的支持。', excerpt: '從日常問候開始學習卑南語，包含基本問候、時間問候和實用對話。', category: '語言', tags: '["族語","問候","教學","日常用語"]', published: true, views: 567, authorId: 1 },
    { title: '卑南族巫師（Tamarakaw）信仰', slug: 'tamarakaw-shaman-culture', content: '## 巫師的角色\n\n在卑南族的傳統社會中，巫師（Tamarakaw）扮演著極其重要的角色。他們不僅是祭儀的主持者，更是溝通人間與靈界的中介者。\n\n## 巫師的養成\n\n成為巫師並非自願選擇，而是經由靈的召喚。被選中者通常會經歷一段「靈病」期，在資深巫師的引導下完成修練。\n\n## 巫術與醫療\n\n卑南族巫師擅長以傳統方式進行祈福、驅邪和治療，這些知識代代相傳，是部落的無形文化資產。', excerpt: '了解卑南族傳統巫師（Tamarakaw）的社會角色、養成過程與巫術醫療文化。', category: '信仰', tags: '["巫師","Tamarakaw","信仰","傳統醫療"]', published: true, views: 234, authorId: 2 },
    { title: '陸森寶與卑南族音樂傳統', slug: 'senai-music-tradition', content: '## 音樂的社會功能\n\n卑南族的音樂不僅是藝術表現，更是社會生活的重要組成部分。從祭典歌謠到日常工作歌，音樂貫穿了族人生活的每個面向。\n\n## 陸森寶的貢獻\n\n陸森寶（Baliwakes）是卑南族最偉大的音樂家之一，創作了許多膾炙人口的歌曲，將卑南族音樂推向更廣闊的舞台。\n\n## 著名歌謠\n\n- **美麗的稻穗** — 最廣為人知的卑南族歌曲\n- **蘭嶼之歌** — 描述對海洋的嚮往\n- **懷念年祭** — 對傳統祭典的思念', excerpt: '探索卑南族豐富的音樂傳統，從陸森寶的創作到傳統祭典歌謠。', category: '音樂', tags: '["音樂","陸森寶","歌謠","Baliwakes"]', published: true, views: 156, authorId: 1 },
    { title: '卑南族的年齡階級制度', slug: 'age-grade-system', content: '## 制度概述\n\n年齡階級制度是卑南族社會組織的核心，男子從少年時期開始，通過不同的年齡階級，承擔不同的社會責任。\n\n## 階級劃分\n\n1. **Takuban** — 少年會所階段，學習基本技能\n2. **Miyabetan** — 青年階段，承擔部落勞動\n3. **Malataw** — 成年階段，參與部落決策\n4. **Karumaaan** — 長老階段，指導後輩\n\n## 現代意義\n\n雖然現代社會已不完全遵循傳統的年齡階級制度，但其精神——尊重長幼秩序和社會責任的承擔——仍然影響著卑南族社會。', excerpt: '了解卑南族獨特的年齡階級制度及其在現代社會中的意義。', category: '歷史', tags: '["年齡階級","社會制度","Takuban","傳統"]', published: true, views: 128, authorId: 2 },
  ];

  for (const a of articlesData) {
    await db.insert(articles).values(a).onConflictDoNothing();
  }

  // ── Vocabulary ──
  console.log('  → 插入詞彙資料...');
  const vocabData = [
    { puyumaWord: 'maituud', chineseMeaning: '你好', englishMeaning: 'Hello', pronunciation: 'mai-tu-ud', category: '問候' as const, exampleSentence: 'Maituud! Manay kamu?', exampleChinese: '你好！你叫什麼名字？' },
    { puyumaWord: 'uninan', chineseMeaning: '謝謝', englishMeaning: 'Thank you', pronunciation: 'u-ni-nan', category: '問候' as const, exampleSentence: 'Uninan na pakaliyus.', exampleChinese: '非常感謝。' },
    { puyumaWord: 'ina', chineseMeaning: '媽媽', englishMeaning: 'Mother', pronunciation: 'i-na', category: '親屬' as const, exampleSentence: 'Ku ina i papulu.', exampleChinese: '我的媽媽在寶桑。' },
    { puyumaWord: 'ama', chineseMeaning: '爸爸', englishMeaning: 'Father', pronunciation: 'a-ma', category: '親屬' as const, exampleSentence: 'Ku ama i uma.', exampleChinese: '我爸爸在田裡。' },
    { puyumaWord: 'dawa', chineseMeaning: '水', englishMeaning: 'Water', pronunciation: 'da-wa', category: '自然' as const, exampleSentence: 'Merima ku dawa.', exampleChinese: '我要喝水。' },
    { puyumaWord: 'puyuma', chineseMeaning: '卑南/集合', englishMeaning: 'Puyuma / Gather', pronunciation: 'pu-yu-ma', category: '文化' as const, exampleSentence: 'Puyuma da ta!', exampleChinese: '大家集合！' },
    { puyumaWord: 'bulabulay', chineseMeaning: '美麗', englishMeaning: 'Beautiful', pronunciation: 'bu-la-bu-lay', category: '日常' as const, exampleSentence: 'Bulabulay na ruma.', exampleChinese: '房子很美麗。' },
    { puyumaWord: 'vali', chineseMeaning: '風', englishMeaning: 'Wind', pronunciation: 'va-li', category: '自然' as const, exampleSentence: 'Maredek a vali.', exampleChinese: '風很大。' },
    { puyumaWord: 'uma', chineseMeaning: '田地', englishMeaning: 'Field', pronunciation: 'u-ma', category: '自然' as const, exampleSentence: 'Mua ku i uma.', exampleChinese: '我要去田裡。' },
    { puyumaWord: 'suwan', chineseMeaning: '一', englishMeaning: 'One', pronunciation: 'su-wan', category: '數字' as const },
    { puyumaWord: 'druwa', chineseMeaning: '二', englishMeaning: 'Two', pronunciation: 'dru-wa', category: '數字' as const },
    { puyumaWord: 'turu', chineseMeaning: '三', englishMeaning: 'Three', pronunciation: 'tu-ru', category: '數字' as const },
    { puyumaWord: 'patrau', chineseMeaning: '頭目', englishMeaning: 'Chief', pronunciation: 'pa-trau', category: '文化' as const },
    { puyumaWord: 'palakuwan', chineseMeaning: '會所', englishMeaning: 'Meeting house', pronunciation: 'pa-la-ku-wan', category: '文化' as const },
    { puyumaWord: 'kawas', chineseMeaning: '靈/神', englishMeaning: 'Spirit', pronunciation: 'ka-was', category: '文化' as const },
  ];

  for (const v of vocabData) {
    await db.insert(vocabulary).values(v).onConflictDoNothing();
  }

  // ── Events ──
  console.log('  → 插入活動資料...');
  await db.insert(events).values([
    { title: '2026 年大獵祭（Mangayaw）', description: '南王部落一年一度的大獵祭，卑南族男子成年禮的重要祭典。歡迎族人與訪客一同參與這場莊嚴的文化盛事。', type: '祭典', location: '臺東市南王部落', startDate: '2026-12-25', endDate: '2026-12-31', tribeId: 1 },
    { title: '卑南族音樂節', description: '以卑南族傳統音樂為主題的文化活動，邀請各部落歌手與樂團演出，展現卑南族音樂的多元與活力。', type: '活動', location: '臺東市文化處藝文中心', startDate: '2026-08-15', endDate: '2026-08-16', tribeId: 1 },
    { title: '傳統刺繡工作坊', description: '由部落資深繡娘親自指導，學習卑南族傳統刺繡技法。提供材料與工具，適合初學者。', type: '工作坊', location: '建和部落文化館', startDate: '2026-06-20', endDate: '2026-06-20', tribeId: 3 },
    { title: '族語繪本故事營', description: '結合卑南語教學與繪本創作，讓孩子在趣味活動中學習族語。', type: '工作坊', location: '知本部落活動中心', startDate: '2026-07-10', endDate: '2026-07-12', tribeId: 2 },
    { title: '部落文化攝影展', description: '收錄近年來卑南族各部落的珍貴影像，從祭典到日常生活，記錄文化的美好瞬間。', type: '展覽', location: '臺東美術館', startDate: '2026-09-01', endDate: '2026-10-31' },
    { title: '猴祭文化體驗', description: '知本部落猴祭期間的文化體驗活動，了解卑南族少年成年禮的傳統。', type: '祭典', location: '臺東市知本部落', startDate: '2026-12-20', endDate: '2026-12-24', tribeId: 2 },
  ]).onConflictDoNothing();

  // ── Media ──
  console.log('  → 插入媒體資料...');
  await db.insert(media).values([
    { title: '大獵祭勇士出發', description: '南王部落大獵祭，青年勇士準備出發的莊嚴時刻', type: 'photo', uploadedBy: 1 },
    { title: '傳統刺繡圖紋', description: '卑南族傳統菱形紋刺繡作品特寫', type: 'photo', uploadedBy: 2 },
    { title: '部落歌謠演唱', description: '族人在聚會中演唱傳統歌謠的珍貴錄音', type: 'audio', uploadedBy: 1 },
    { title: '知本溫泉部落風光', description: '從知本部落眺望知本溪谷的壯麗景色', type: 'photo', uploadedBy: 2 },
    { title: '族語教學紀錄', description: '部落族語教室的日常教學紀錄影片', type: 'video', uploadedBy: 1 },
  ]).onConflictDoNothing();

  // ── Discussions ──
  console.log('  → 插入討論資料...');
  await db.insert(discussions).values([
    { board: 'general', title: '歡迎來到 Pinuyumayan 社群！', content: '這是一個讓所有關心卑南族文化的朋友交流的空間。', authorId: 1, authorName: '系統管理員', likes: 8 },
    { board: 'language', title: '族語日常問候用語整理', content: '常用的卑南語問候語：uninan (謝謝)、marekumare (你好)', authorId: 2, authorName: '文化編輯', likes: 12 },
    { board: 'culture', title: '2026年大獵祭準備工作開始', content: '今年的大獵祭將在12月舉行，歡迎族人分享準備過程。', authorId: 2, authorName: '文化編輯', likes: 15 },
    { board: 'events', title: '南王部落春季文化體驗營', content: '4月底將舉辦兩天的文化體驗營，內容包含族語教學和傳統工藝。', authorId: 1, authorName: '系統管理員', likes: 6 },
  ]).onConflictDoNothing();

  // Add a reply to the first discussion
  const [firstDisc] = await db.select({ id: discussions.id }).from(discussions).limit(1);
  if (firstDisc) {
    await db.insert(discussionReplies).values({
      discussionId: firstDisc.id, content: '感謝建立這個平台！', authorId: 3, authorName: '訪客用戶',
    }).onConflictDoNothing();
  }

  // ── Cultural Sites ──
  console.log('  → 插入文化景點資料...');
  await db.insert(culturalSites).values([
    { name: '南王 Palakuwan (青年會所)', type: '集會所', description: '南王部落傳統青年會所 palakuwan，是卑南族年齡階級制度的核心場所，青年在此接受訓練與文化薰陶。', latitude: 22.7835, longitude: 121.1085, tribeId: 1, tribeName: '南王部落', tags: '["會所","年齡階級","青年訓練"]' },
    { name: '知本 Muveneng (祭祀場)', type: '祭祀場', description: '知本部落傳統祭祀場域，族人在此舉行重要的祭儀活動，是部落精神生活的中心。', latitude: 22.7025, longitude: 121.0412, tribeId: 2, tribeName: '知本部落', tags: '["祭祀","祭儀","巫師"]' },
    { name: '建和刺繡工藝坊', type: '工藝', description: '建和部落的傳統刺繡工藝坊，保存並傳承卑南族獨特的刺繡技藝，遊客可預約體驗。', latitude: 22.7330, longitude: 121.0785, tribeId: 3, tribeName: '建和部落', tags: '["刺繡","工藝","體驗"]' },
    { name: '卑南遺址公園', type: '遺址', description: '國家一級古蹟，距今約3000年前的史前文化遺址，出土大量石棺和精美玉器，是認識臺灣史前文化的重要場域。', latitude: 22.7900, longitude: 121.1200, tribeName: '臺東市', tags: '["遺址","史前","玉器","石棺"]' },
    { name: '利嘉傳統獵場', type: '獵場', description: '利嘉部落傳統的狩獵場域，至今仍在大獵祭期間使用，見證了卑南族人與山林共存的智慧。', latitude: 22.7950, longitude: 121.0650, tribeId: 4, tribeName: '利嘉部落', tags: '["獵場","狩獵","大獵祭"]' },
    { name: '初鹿文化區', type: '文化區', description: '初鹿部落週邊的文化生活圈，包含傳統家屋遺址和農業文化景觀。', latitude: 22.8270, longitude: 121.0535, tribeId: 5, tribeName: '初鹿部落', tags: '["文化區","家屋","農業"]' },
    { name: '南王 Mangayaw 祭典場', type: '祭典場', description: '南王部落舉行大獵祭（Mangayaw）的傳統場域，每年12月底在此進行為期一週的祭典活動。', latitude: 22.7840, longitude: 121.1075, tribeId: 1, tribeName: '南王部落', tags: '["大獵祭","Mangayaw","祭典"]' },
    { name: '知本猴祭場', type: '祭典場', description: '知本部落舉行猴祭的場所，猴祭是卑南族少年成年禮的重要祭典，意義深遠。', latitude: 22.7015, longitude: 121.0400, tribeId: 2, tribeName: '知本部落', tags: '["猴祭","成年禮","少年"]' },
  ]).onConflictDoNothing();

  console.log('✅ Seed completed!');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
