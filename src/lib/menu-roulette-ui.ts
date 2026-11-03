// WHY 2026-11-03 (impeccable batch 3): MenuRoulette chrome was hardcoded Korean on
// en/ja/zh/fr/es pages. Menu item names are still Korean data (menu-data.ts); a
// per-country menu list is a separate job.
import type { CountryType } from './menu-data';

type Ui = {
  cuisine: string; situation: string; surprise: string; battle: string; picking: string;
  battleTitle: string; battleBody: string; cancel: string; resultTitle: string; resultBody: string;
  fav: string; unfav: string; share: string; search: string; searchBody: string; searchPh: string;
  google: string; favorites: string; favDelete: string; history: string; reset: string; noHistory: string;
  copied: string;
  countries: Record<CountryType, string>;
  tags: Record<string, string>;
};

export const MENU_UI: Record<string, Ui> = {
  ko: {
    cuisine: '음식 종류', situation: '상황 · 계절', surprise: '깜짝 메뉴 (전체)', battle: '메뉴 배틀 ⚔️', picking: '메뉴를 고르는 중...',
    battleTitle: '⚔️ 메뉴 배틀', battleBody: '먹고 싶은 메뉴를 선택하세요!', cancel: '취소', resultTitle: '오늘의 메뉴 결정!', resultBody: '맛있게 드세요 😊',
    fav: '즐겨찾기', unfav: '즐겨찾기 해제', share: '공유', search: '맛집 검색', searchBody: '메뉴 이름으로 웹 검색을 열어요. 위치는 보내지 않아요.', searchPh: '메뉴명 입력...',
    google: '구글 검색', favorites: '즐겨찾기', favDelete: '즐겨찾기 삭제', history: '최근 기록', reset: '초기화', noHistory: '아직 기록이 없어요. 메뉴를 골라보세요!',
    copied: '클립보드에 복사했어요!',
    countries: { all: '🌍 전체', korea: '🇰🇷 한식', pizza: '🍕 피자/치킨/양식', china: '🇨🇳 중식', japan: '🇯🇵 일식', asia: '🌏 아시안', mexico: '🇲🇽 스페인/멕시코', italy: '🇮🇹 이탈리아', france: '🇫🇷 프랑스' },
    tags: { all: '전체', '야식': '🌙 야식', '해장': '🍲 해장', '여름': '☀️ 여름', '겨울': '❄️ 겨울', '다이어트': '🥗 다이어트', '혼밥': '🧑 혼밥', '회식': '🍻 회식' },
  },
  en: {
    cuisine: 'Cuisine', situation: 'Mood · season', surprise: 'Surprise me (all)', battle: 'Menu battle ⚔️', picking: 'Picking a menu...',
    battleTitle: '⚔️ Menu battle', battleBody: 'Pick the one you want to eat.', cancel: 'Cancel', resultTitle: "Today's pick", resultBody: 'Enjoy your meal 😊',
    fav: 'Save', unfav: 'Remove from saved', share: 'Share', search: 'Find a place', searchBody: 'Opens a web search for the dish name. Your location is not sent.', searchPh: 'Dish name...',
    google: 'Google search', favorites: 'Saved', favDelete: 'Remove saved item', history: 'Recent picks', reset: 'Clear', noHistory: 'No picks yet. Try one!',
    copied: 'Copied to clipboard.',
    countries: { all: '🌍 All', korea: '🇰🇷 Korean', pizza: '🍕 Pizza/chicken/Western', china: '🇨🇳 Chinese', japan: '🇯🇵 Japanese', asia: '🌏 Asian', mexico: '🇲🇽 Spanish/Mexican', italy: '🇮🇹 Italian', france: '🇫🇷 French' },
    tags: { all: 'All', '야식': '🌙 Late night', '해장': '🍲 Hangover', '여름': '☀️ Summer', '겨울': '❄️ Winter', '다이어트': '🥗 Light', '혼밥': '🧑 Solo', '회식': '🍻 Group' },
  },
  ja: {
    cuisine: '料理のジャンル', situation: 'シーン・季節', surprise: 'おまかせ（全部）', battle: 'メニュー対決 ⚔️', picking: 'メニューを選んでいます...',
    battleTitle: '⚔️ メニュー対決', battleBody: '食べたい方を選んでください。', cancel: 'キャンセル', resultTitle: '今日のメニュー', resultBody: 'どうぞ召し上がれ 😊',
    fav: 'お気に入り', unfav: 'お気に入り解除', share: '共有', search: 'お店を探す', searchBody: '料理名でウェブ検索を開きます。位置情報は送りません。', searchPh: '料理名を入力...',
    google: 'Google 検索', favorites: 'お気に入り', favDelete: 'お気に入りを削除', history: '最近の記録', reset: 'リセット', noHistory: 'まだ記録がありません。選んでみましょう。',
    copied: 'クリップボードにコピーしました。',
    countries: { all: '🌍 すべて', korea: '🇰🇷 韓国料理', pizza: '🍕 ピザ・チキン・洋食', china: '🇨🇳 中華', japan: '🇯🇵 和食', asia: '🌏 アジア', mexico: '🇲🇽 スペイン・メキシコ', italy: '🇮🇹 イタリアン', france: '🇫🇷 フレンチ' },
    tags: { all: 'すべて', '야식': '🌙 夜食', '해장': '🍲 二日酔い', '여름': '☀️ 夏', '겨울': '❄️ 冬', '다이어트': '🥗 ダイエット', '혼밥': '🧑 ひとりご飯', '회식': '🍻 飲み会' },
  },
  zh: {
    cuisine: '菜系', situation: '场景・季节', surprise: '随便来一个（全部）', battle: '菜单对决 ⚔️', picking: '正在挑选...',
    battleTitle: '⚔️ 菜单对决', battleBody: '选出你想吃的。', cancel: '取消', resultTitle: '今天吃这个', resultBody: '祝你用餐愉快 😊',
    fav: '收藏', unfav: '取消收藏', share: '分享', search: '找餐厅', searchBody: '用菜名打开网页搜索，不发送你的位置。', searchPh: '输入菜名...',
    google: 'Google 搜索', favorites: '收藏', favDelete: '删除收藏', history: '最近记录', reset: '清空', noHistory: '还没有记录，先选一个吧。',
    copied: '已复制到剪贴板。',
    countries: { all: '🌍 全部', korea: '🇰🇷 韩餐', pizza: '🍕 披萨・炸鸡・西餐', china: '🇨🇳 中餐', japan: '🇯🇵 日料', asia: '🌏 亚洲菜', mexico: '🇲🇽 西班牙・墨西哥', italy: '🇮🇹 意大利菜', france: '🇫🇷 法餐' },
    tags: { all: '全部', '야식': '🌙 夜宵', '해장': '🍲 解酒', '여름': '☀️ 夏天', '겨울': '❄️ 冬天', '다이어트': '🥗 轻食', '혼밥': '🧑 一人食', '회식': '🍻 聚餐' },
  },
  fr: {
    cuisine: 'Cuisine', situation: 'Moment · saison', surprise: 'Surprise (tout)', battle: 'Duel de plats ⚔️', picking: 'On choisit un plat...',
    battleTitle: '⚔️ Duel de plats', battleBody: 'Choisissez celui qui vous tente.', cancel: 'Annuler', resultTitle: 'Le plat du jour', resultBody: 'Bon appétit 😊',
    fav: 'Favori', unfav: 'Retirer des favoris', share: 'Partager', search: 'Trouver un restaurant', searchBody: 'Ouvre une recherche web avec le nom du plat. Votre position n’est pas envoyée.', searchPh: 'Nom du plat...',
    google: 'Recherche Google', favorites: 'Favoris', favDelete: 'Retirer le favori', history: 'Historique', reset: 'Effacer', noHistory: 'Pas encore d’historique. Lancez un tirage !',
    copied: 'Copié dans le presse-papiers.',
    countries: { all: '🌍 Tout', korea: '🇰🇷 Coréen', pizza: '🍕 Pizza/poulet/occidental', china: '🇨🇳 Chinois', japan: '🇯🇵 Japonais', asia: '🌏 Asiatique', mexico: '🇲🇽 Espagnol/mexicain', italy: '🇮🇹 Italien', france: '🇫🇷 Français' },
    tags: { all: 'Tout', '야식': '🌙 Tard le soir', '해장': '🍲 Lendemain de fête', '여름': '☀️ Été', '겨울': '❄️ Hiver', '다이어트': '🥗 Léger', '혼밥': '🧑 En solo', '회식': '🍻 En groupe' },
  },
  es: {
    cuisine: 'Cocina', situation: 'Momento · estación', surprise: 'Sorpréndeme (todo)', battle: 'Duelo de platos ⚔️', picking: 'Eligiendo un plato...',
    battleTitle: '⚔️ Duelo de platos', battleBody: 'Elige el que te apetezca.', cancel: 'Cancelar', resultTitle: 'El plato de hoy', resultBody: '¡Buen provecho! 😊',
    fav: 'Favorito', unfav: 'Quitar de favoritos', share: 'Compartir', search: 'Buscar restaurante', searchBody: 'Abre una búsqueda web con el nombre del plato. No se envía tu ubicación.', searchPh: 'Nombre del plato...',
    google: 'Búsqueda en Google', favorites: 'Favoritos', favDelete: 'Quitar favorito', history: 'Historial', reset: 'Borrar', noHistory: 'Aún no hay historial. ¡Prueba uno!',
    copied: 'Copiado al portapapeles.',
    countries: { all: '🌍 Todo', korea: '🇰🇷 Coreana', pizza: '🍕 Pizza/pollo/occidental', china: '🇨🇳 China', japan: '🇯🇵 Japonesa', asia: '🌏 Asiática', mexico: '🇲🇽 Española/mexicana', italy: '🇮🇹 Italiana', france: '🇫🇷 Francesa' },
    tags: { all: 'Todo', '야식': '🌙 Noche', '해장': '🍲 Resaca', '여름': '☀️ Verano', '겨울': '❄️ Invierno', '다이어트': '🥗 Ligero', '혼밥': '🧑 Solo', '회식': '🍻 En grupo' },
  },
};
