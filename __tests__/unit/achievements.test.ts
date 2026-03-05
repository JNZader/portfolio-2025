import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock localStorage before importing the module
const localStorageStore: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageStore[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageStore[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageStore[key];
  }),
};

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

import {
  achievements,
  getUnlockedAchievements,
  unlockAchievement,
} from '@/lib/achievements';

function clearStore() {
  for (const key of Object.keys(localStorageStore)) {
    delete localStorageStore[key];
  }
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
}

describe('achievements', () => {
  beforeEach(() => {
    clearStore();
    // Clean up any toasts from previous tests
    document.querySelectorAll('.achievement-toast').forEach((el) => el.remove());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('achievements list', () => {
    it('should have exactly 2 achievements', () => {
      expect(achievements).toHaveLength(2);
    });

    it('should contain konami_master and matrix_fan', () => {
      const ids = achievements.map((a) => a.id);
      expect(ids).toContain('konami_master');
      expect(ids).toContain('matrix_fan');
    });

    it('should have required fields on every achievement', () => {
      for (const achievement of achievements) {
        expect(achievement.id).toBeTruthy();
        expect(achievement.title).toBeTruthy();
        expect(achievement.description).toBeTruthy();
        expect(achievement.icon).toBeTruthy();
        expect(typeof achievement.secret).toBe('boolean');
        expect(['common', 'rare', 'epic', 'legendary']).toContain(achievement.rarity);
      }
    });
  });

  describe('getUnlockedAchievements', () => {
    it('should return empty array when no achievements unlocked', () => {
      expect(getUnlockedAchievements()).toEqual([]);
    });

    it('should return unlocked achievements from localStorage', () => {
      localStorageStore.achievements = JSON.stringify(['konami_master']);
      expect(getUnlockedAchievements()).toEqual(['konami_master']);
    });

    it('should return empty array for corrupted localStorage data', () => {
      localStorageStore.achievements = 'not-valid-json{{{';
      expect(getUnlockedAchievements()).toEqual([]);
    });

    it('should return empty array when localStorage contains non-array JSON', () => {
      localStorageStore.achievements = JSON.stringify({ foo: 'bar' });
      expect(getUnlockedAchievements()).toEqual([]);
    });

    it('should return empty array when localStorage contains a string', () => {
      localStorageStore.achievements = JSON.stringify('just a string');
      expect(getUnlockedAchievements()).toEqual([]);
    });

    it('should return empty array when localStorage contains null', () => {
      localStorageStore.achievements = 'null';
      expect(getUnlockedAchievements()).toEqual([]);
    });
  });

  describe('unlockAchievement', () => {
    it('should unlock a new achievement and persist to localStorage', () => {
      unlockAchievement('konami_master');

      const unlocked = getUnlockedAchievements();
      expect(unlocked).toContain('konami_master');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'achievements',
        JSON.stringify(['konami_master'])
      );
    });

    it('should not duplicate already unlocked achievements', () => {
      unlockAchievement('konami_master');
      unlockAchievement('konami_master');

      const unlocked = getUnlockedAchievements();
      expect(unlocked.filter((id) => id === 'konami_master')).toHaveLength(1);
    });

    it('should unlock multiple different achievements', () => {
      unlockAchievement('konami_master');
      unlockAchievement('matrix_fan');

      const unlocked = getUnlockedAchievements();
      expect(unlocked).toContain('konami_master');
      expect(unlocked).toContain('matrix_fan');
      expect(unlocked).toHaveLength(2);
    });

    it('should show a toast notification when unlocking', () => {
      const main = document.createElement('div');
      main.id = 'main-content';
      document.body.appendChild(main);

      unlockAchievement('konami_master');

      const toast = main.querySelector('.achievement-toast');
      expect(toast).toBeTruthy();
      expect(toast?.textContent).toContain('Achievement Unlocked!');
      expect(toast?.textContent).toContain('Konami Master');

      main.remove();
    });

    it('should append toast to body when main-content is missing', () => {
      unlockAchievement('matrix_fan');

      const toast = document.querySelector('.achievement-toast');
      expect(toast).toBeTruthy();
      expect(toast?.textContent).toContain('Matrix Fan');
    });

    it('should not show toast for unknown achievement IDs', () => {
      unlockAchievement('nonexistent_achievement');

      // Still stored in localStorage (the function doesn't validate IDs)
      // but no toast should appear since no matching achievement definition
      const toasts = document.querySelectorAll('.achievement-toast');
      // Only toasts from previous tests should exist (cleaned in beforeEach)
      expect(toasts).toHaveLength(0);
    });
  });
});
