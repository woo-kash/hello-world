'use client';

interface LogicBlock {
  type: 'if' | 'else' | 'loop' | 'action' | 'condition';
  label: string;
  children?: LogicBlock[];
}

const TYPE_STYLES: Record<string, string> = {
  if:        'bg-red-500/20 border-red-400/50 text-red-200',
  else:      'bg-orange-500/20 border-orange-400/50 text-orange-200',
  loop:      'bg-teal-500/20 border-teal-400/50 text-teal-200',
  action:    'bg-blue-500/20 border-blue-400/50 text-blue-200',
  condition: 'bg-green-500/20 border-green-400/50 text-green-200',
};

const TYPE_ICONS: Record<string, string> = {
  if: '❓', else: '↔️', loop: '🔁', action: '▶️', condition: '🔍',
};

function Block({ block, depth = 0 }: { block: LogicBlock; depth?: number }) {
  const styles = TYPE_STYLES[block.type] ?? TYPE_STYLES.action;
  const icon = TYPE_ICONS[block.type] ?? '▶️';

  return (
    <div style={{ marginLeft: depth * 16 }}>
      <div className={`flex items-center gap-2 border rounded-xl px-3 py-2 mb-1.5 text-sm ${styles}`}>
        <span className="text-base">{icon}</span>
        <span className="font-medium capitalize">{block.type}</span>
        <span className="text-white/60">—</span>
        <span>{block.label}</span>
      </div>
      {block.children?.map((child, i) => (
        <Block key={i} block={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function LogicBlockTree({ blocks }: { blocks: LogicBlock[] }) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="space-y-0.5">
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  );
}
