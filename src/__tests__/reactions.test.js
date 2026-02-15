import { describe, it, expect } from 'vitest';
import { ALLOWED_REACTIONS, REACTION_COLORS, MAX_REACTIONS_PER_MESSAGE } from '../constants/reactions';

describe('Reactions Constants', () => {
  it('should have predefined emojis', () => {
    expect(ALLOWED_REACTIONS).toContain('👍');
    expect(ALLOWED_REACTIONS).toContain('❤️');
    expect(ALLOWED_REACTIONS).toContain('😂');
  });

  it('should have correct number of emojis', () => {
    expect(ALLOWED_REACTIONS.length).toBe(8);
  });

  it('should have reaction colors for each emoji', () => {
    ALLOWED_REACTIONS.forEach(emoji => {
      expect(REACTION_COLORS[emoji]).toBeDefined();
    });
  });

  it('should have max reactions limit', () => {
    expect(MAX_REACTIONS_PER_MESSAGE).toBeGreaterThan(0);
  });
});
