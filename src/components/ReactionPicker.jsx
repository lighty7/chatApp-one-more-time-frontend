import { ALLOWED_REACTIONS } from '../constants/reactions';

export default function ReactionPicker({ onSelect, position = 'left' }) {
  return (
    <div className={`absolute top-8 ${position === 'left' ? 'left-0' : 'right-0'} bg-surface rounded-lg shadow-lg p-2 flex gap-1 z-10`}>
      {ALLOWED_REACTIONS.map(emoji => (
        <button
          key={emoji}
          onClick={() => onSelect(emoji)}
          onTouchEnd={(e) => {
            e.preventDefault();
            onSelect(emoji);
          }}
          className="w-10 h-10 flex items-center justify-center text-xl hover:bg-bg/50 active:bg-primary/20 rounded transition-colors touch-manipulation"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
