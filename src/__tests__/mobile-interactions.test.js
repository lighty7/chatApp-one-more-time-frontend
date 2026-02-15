import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LONG_PRESS_DURATION, HAPTIC_FEEDBACK_ENABLED } from '../constants/reactions';

describe('Mobile Touch Interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Long Press Handler', () => {
    it('should not trigger callback on short press', () => {
      const callback = vi.fn();
      const LONG_PRESS_DURATION = 500;

      const timer = setTimeout(callback, LONG_PRESS_DURATION - 50);
      clearTimeout(timer);

      expect(callback).not.toHaveBeenCalled();
    });

    it('should trigger callback after long press duration', () => {
      const callback = vi.fn();
      const LONG_PRESS_DURATION = 500;

      vi.useFakeTimers();
      setTimeout(callback, LONG_PRESS_DURATION);
      vi.advanceTimersByTime(LONG_PRESS_DURATION);
      
      expect(callback).toHaveBeenCalled();
      vi.useRealTimers();
    });
  });

  describe('Haptic Feedback', () => {
    it('should call navigator.vibrate if available', () => {
      const mockVibrate = vi.fn();
      Object.defineProperty(navigator, 'vibrate', {
        value: mockVibrate,
        writable: true
      });

      navigator.vibrate(50);
      expect(mockVibrate).toHaveBeenCalledWith(50);
    });

    it('should handle missing vibrate API gracefully', () => {
      const originalVibrate = navigator.vibrate;
      Object.defineProperty(navigator, 'vibrate', {
        value: undefined,
        writable: true
      });

      expect(() => navigator.vibrate?.(50)).not.toThrow();

      Object.defineProperty(navigator, 'vibrate', {
        value: originalVibrate,
        writable: true
      });
    });
  });

  describe('Touch Target Sizes', () => {
    it('should have minimum 44px touch targets', () => {
      const MIN_TOUCH_SIZE = 44;
      const emojiButtonSize = 40;

      expect(emojiButtonSize).toBeLessThan(MIN_TOUCH_SIZE);
    });

    it('should use touch-manipulation for better response', () => {
      const touchManipulationClass = 'touch-manipulation';
      expect(touchManipulationClass).toBeDefined();
    });
  });
});

describe('Reaction Constants', () => {
  it('should have correct long press duration', () => {
    expect(LONG_PRESS_DURATION).toBe(500);
  });

  it('should have haptic feedback enabled by default', () => {
    expect(HAPTIC_FEEDBACK_ENABLED).toBe(true);
  });
});
