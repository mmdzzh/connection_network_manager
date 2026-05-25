const BASE = 'http://localhost:3001';

export function isColorAvatar(avatar: string | null): boolean {
  return !avatar || avatar.startsWith('#');
}

export function getAvatarUrl(avatar: string | null): string {
  if (!avatar) return '';
  if (avatar.startsWith('http')) return avatar;
  return BASE + avatar;
}
