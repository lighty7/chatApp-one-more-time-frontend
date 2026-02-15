import { ALLOWED_REACTIONS } from '../constants/reactions';

export default function ReactionPicker({ onSelect, position = 'left' }) {
  return (
    <div className={`absolute top-8 ${position === 'left' ? 'left-0' : 'right-0'} bg-surface rounded-lg shadow-lg p-2 flex gap-1 z-10`}>
      {ALLOWED_REACTIONS.map(emoji => (
        <button
          key={emoji}
          onClick={() => onSelect(emoji)}
          className="w-8 h-8 flex items-center justify-center text-lg hover:bg-bg/50 rounded transition-colors"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
