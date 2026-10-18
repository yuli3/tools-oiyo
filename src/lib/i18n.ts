// 2026-10-19: only the migrated file utilities expose six locales; KR calculators keep their scope.
export const locales = ['ko', 'en', 'ja', 'zh', 'fr', 'es'] as const;
export type Locale = typeof locales[number];
export const utilityLabels: Record<Locale, [string, string, string]> = {
  ko: ['이미지 변환·압축', 'PDF 합치기·나누기', 'QR 코드 생성'],
  en: ['Image converter', 'Merge and split PDF', 'QR code generator'],
  ja: ['画像変換・圧縮', 'PDF結合・分割', 'QRコード作成'],
  zh: ['图片转换与压缩', 'PDF合并与拆分', '二维码生成'],
  fr: ['Convertir des images', 'Fusionner et diviser un PDF', 'Créer un code QR'],
  es: ['Convertir imágenes', 'Unir y dividir PDF', 'Crear códigos QR'],
};
export const utilitySlugs = ['image-converter', 'pdf-merge-split', 'qr-code-generator'] as const;
export const shellCopy: Record<Locale, { all: string; related: string; language: string; license: string; note: string }> = {
  ko: { all: '도구 전체', related: '파일 도구', language: '언어', license: '라이선스', note: '파일 처리는 브라우저 안에서 해요. 방문 통계와 광고는 사용해요.' },
  en: { all: 'All tools', related: 'File tools', language: 'Language', license: 'License', note: 'Files are processed in your browser. This site uses analytics and advertising.' },
  ja: { all: 'すべてのツール', related: 'ファイルツール', language: '言語', license: 'ライセンス', note: 'ファイルはブラウザー内で処理します。アクセス解析と広告を使用しています。' },
  zh: { all: '所有工具', related: '文件工具', language: '语言', license: '许可', note: '文件在浏览器内处理。本站使用访问统计和广告。' },
  fr: { all: 'Tous les outils', related: 'Outils de fichiers', language: 'Langue', license: 'Licence', note: 'Les fichiers sont traités dans votre navigateur. Ce site utilise des statistiques de visite et de la publicité.' },
  es: { all: 'Todas las herramientas', related: 'Herramientas de archivos', language: 'Idioma', license: 'Licencia', note: 'Los archivos se procesan en tu navegador. Este sitio usa estadísticas de visitas y publicidad.' },
};
