import { LONG_PRESS_DURATION } from '../constants/reactions';

export default function LongPressProgress({ active, duration = LONG_PRESS_DURATION }) {
  if (!active) return null;

  return (
    <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
      <div 
        className="absolute bottom-0 left-0 h-1 bg-primary transition-all ease-linear"
        style={{ 
          width: '100%', 
          animation: `pressProgress ${duration}ms linear forwards` 
        }} 
      />
      <style>{`
        @keyframes pressProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
