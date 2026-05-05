export const CONVERSION_FORMATS: Record<string, string[]> = {
  // Hujjatlar
  'pdf': ['docx', 'doc', 'xlsx', 'pptx', 'txt', 'html', 'jpg', 'png', 'odt'],
  'docx': ['pdf', 'doc', 'odt', 'txt', 'html', 'rtf'],
  'doc': ['pdf', 'docx', 'odt', 'txt', 'html', 'rtf'],
  'odt': ['pdf', 'docx', 'doc', 'txt', 'html'],
  'rtf': ['pdf', 'docx', 'txt'],
  'txt': ['pdf', 'docx', 'html'],
  'html': ['pdf', 'docx', 'txt'],

  // Elektron jadvallar
  'xlsx': ['pdf', 'xls', 'csv', 'ods', 'html'],
  'xls': ['pdf', 'xlsx', 'csv', 'ods'],
  'csv': ['xlsx', 'xls', 'pdf', 'ods'],
  'ods': ['pdf', 'xlsx', 'xls', 'csv'],

  // Prezentatsiyalar
  'pptx': ['pdf', 'ppt', 'odp', 'jpg', 'png'],
  'ppt': ['pdf', 'pptx', 'odp'],
  'odp': ['pdf', 'pptx', 'ppt'],

  // Rasmlar
  'jpg': ['png', 'webp', 'gif', 'bmp', 'tiff', 'pdf', 'svg'],
  'jpeg': ['png', 'webp', 'gif', 'bmp', 'tiff', 'pdf', 'svg'],
  'png': ['jpg', 'webp', 'gif', 'bmp', 'tiff', 'pdf', 'svg'],
  'webp': ['jpg', 'png', 'gif', 'bmp', 'tiff'],
  'gif': ['jpg', 'png', 'webp', 'mp4'],
  'bmp': ['jpg', 'png', 'webp', 'pdf'],
  'tiff': ['jpg', 'png', 'pdf'],
  'svg': ['png', 'jpg', 'pdf'],
  'heic': ['jpg', 'png', 'pdf'],

  // Audio
  'mp3': ['wav', 'ogg', 'flac', 'aac', 'm4a', 'wma'],
  'wav': ['mp3', 'ogg', 'flac', 'aac', 'm4a'],
  'ogg': ['mp3', 'wav', 'flac', 'aac'],
  'flac': ['mp3', 'wav', 'ogg', 'aac'],
  'aac': ['mp3', 'wav', 'ogg', 'flac'],
  'm4a': ['mp3', 'wav', 'aac'],
  'wma': ['mp3', 'wav', 'ogg'],

  // Video
  'mp4': ['avi', 'mov', 'mkv', 'webm', 'flv', 'wmv', 'gif'],
  'avi': ['mp4', 'mov', 'mkv', 'webm', 'flv'],
  'mov': ['mp4', 'avi', 'mkv', 'webm'],
  'mkv': ['mp4', 'avi', 'mov', 'webm'],
  'webm': ['mp4', 'avi', 'mov'],
  'flv': ['mp4', 'avi', 'mov'],
  'wmv': ['mp4', 'avi', 'mov'],

  // Arxivlar
  'zip': ['tar', '7z', 'rar'],
  'rar': ['zip', '7z', 'tar'],
  '7z': ['zip', 'tar', 'rar'],
  'tar': ['zip', '7z'],
}

export const FORMAT_CATEGORIES: Record<string, string[]> = {
  'Hujjatlar': ['pdf', 'docx', 'doc', 'odt', 'rtf', 'txt', 'html'],
  'Jadvallar': ['xlsx', 'xls', 'csv', 'ods'],
  'Prezentatsiyalar': ['pptx', 'ppt', 'odp'],
  'Rasmlar': ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'svg', 'heic'],
  'Audio': ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma'],
  'Video': ['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', 'wmv'],
  'Arxivlar': ['zip', 'rar', '7z', 'tar'],
}

export const FORMAT_ICONS: Record<string, string> = {
  'pdf': '📄',
  'docx': '📝', 'doc': '📝', 'odt': '📝',
  'xlsx': '📊', 'xls': '📊', 'csv': '📊', 'ods': '📊',
  'pptx': '📑', 'ppt': '📑', 'odp': '📑',
  'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'webp': '🖼️',
  'gif': '🎞️', 'bmp': '🖼️', 'tiff': '🖼️', 'svg': '🎨', 'heic': '🖼️',
  'mp3': '🎵', 'wav': '🎵', 'ogg': '🎵', 'flac': '🎵', 'aac': '🎵',
  'mp4': '🎬', 'avi': '🎬', 'mov': '🎬', 'mkv': '🎬', 'webm': '🎬',
  'zip': '🗜️', 'rar': '🗜️', '7z': '🗜️', 'tar': '🗜️',
}

export function getAvailableFormats(extension: string): string[] {
  const ext = extension.toLowerCase().replace('.', '')
  return CONVERSION_FORMATS[ext] || []
}

export function getFormatCategory(extension: string): string {
  const ext = extension.toLowerCase().replace('.', '')
  for (const [category, formats] of Object.entries(FORMAT_CATEGORIES)) {
    if (formats.includes(ext)) return category
  }
  return 'Boshqa'
}
