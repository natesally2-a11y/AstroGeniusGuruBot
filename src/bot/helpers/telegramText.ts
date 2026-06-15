const TELEGRAM_MAX_LENGTH = 4096;

/** Normalize AI Markdown to Telegram legacy Markdown (*bold*, _italic_) */
export function sanitizeForTelegram(text: string): string {
  let s = text;

  // Headers -> bold line
  s = s.replace(/^#{1,6}\s+(.+)$/gm, '*$1*');

  // **bold** -> *bold*
  s = s.replace(/\*\*(.+?)\*\*/g, '*$1*');

  // __italic__ -> _italic_
  s = s.replace(/__(.+?)__/g, '_$1_');

  // Remove unsupported blocks
  s = s.replace(/```[\s\S]*?```/g, (m) => m.replace(/```/g, ''));
  s = s.replace(/`/g, "'");

  // Fix unclosed asterisks (common AI mistake)
  const stars = (s.match(/\*/g) || []).length;
  if (stars % 2 !== 0) {
    s = s.replace(/\*([^*\n]*)$/, '_$1_');
  }

  // Escape chars that break Telegram Markdown outside formatting
  s = s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  return s.trim();
}

export function splitTelegramMessage(text: string, maxLen = TELEGRAM_MAX_LENGTH): string[] {
  if (text.length <= maxLen) return [text];

  const parts: string[] = [];
  let remaining = text;

  while (remaining.length > maxLen) {
    let cut = remaining.lastIndexOf('\n\n', maxLen);
    if (cut < maxLen * 0.5) cut = remaining.lastIndexOf('\n', maxLen);
    if (cut < maxLen * 0.3) cut = maxLen;

    parts.push(remaining.slice(0, cut).trim());
    remaining = remaining.slice(cut).trim();
  }

  if (remaining) parts.push(remaining);
  return parts;
}

export function prepareTelegramText(text: string): string[] {
  return splitTelegramMessage(sanitizeForTelegram(text));
}
