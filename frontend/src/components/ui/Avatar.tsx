const COLORS = [
  'bg-violet-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-indigo-500',
  'bg-pink-500',
] as const;

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getColor(name: string): string {
  const idx = name.charCodeAt(0) % COLORS.length;
  return COLORS[idx] ?? 'bg-violet-500';
}

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-11 h-11 text-base' };

export function Avatar({ name, size = 'md' }: AvatarProps) {
  return (
    <div
      className={`${sizeMap[size]} ${getColor(name)} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}
    >
      {getInitials(name)}
    </div>
  );
}
