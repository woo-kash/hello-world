'use client';

interface Props {
  avatar: string;
  size?: number;
}

export function AvatarDisplay({ avatar, size = 40 }: Props) {
  if (avatar.startsWith('<svg')) {
    return (
      <div
        style={{ width: size, height: size, flexShrink: 0 }}
        dangerouslySetInnerHTML={{ __html: avatar }}
      />
    );
  }
  if (avatar.startsWith('data:')) {
    return (
      <img
        src={avatar}
        alt=""
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }
  return (
    <span style={{ fontSize: size * 0.7, lineHeight: 1, flexShrink: 0 }}>{avatar}</span>
  );
}
