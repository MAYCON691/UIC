export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const initials =
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join('') || '?';
  return (
    <div style={{ width: size, height: size }} className="avatar">
      {initials}
    </div>
  );
}
