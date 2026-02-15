export default function ReactionBadge({ emoji, count, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 transition-all hover:scale-105 ${
        isActive
          ? 'bg-primary/30 ring-1 ring-primary'
          : 'bg-bg/50'
      }`}
    >
      <span>{emoji}</span>
      <span className="text-[10px]">{count}</span>
    </button>
  );
}
