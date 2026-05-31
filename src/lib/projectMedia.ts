export type VideoPreview =
  | { kind: 'embed'; src: string }
  | { kind: 'file'; src: string };

export function hasVideoUrl(videoUrl: string | null | undefined): videoUrl is string {
  return typeof videoUrl === 'string' && videoUrl.trim() !== '';
}

export function resolveVideoPreview(videoUrl: string): VideoPreview {
  const url = videoUrl.trim();

  const youtubeMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/,
  );
  if (youtubeMatch?.[1]) {
    return {
      kind: 'embed',
      src: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
    };
  }

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch?.[1]) {
    return {
      kind: 'embed',
      src: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    };
  }

  return { kind: 'file', src: url };
}
