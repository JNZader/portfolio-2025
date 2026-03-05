export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  secret: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  silent?: boolean; // Don't show toast notification
}

export const achievements: Achievement[] = [
  {
    id: 'konami_master',
    title: 'Konami Master',
    description: 'Encontraste el código Konami (↑↑↓↓←→←→BA)',
    icon: '🎮',
    secret: true,
    rarity: 'epic',
  },
  {
    id: 'matrix_fan',
    title: 'Matrix Fan',
    description: 'Activaste el modo Matrix',
    icon: '💚',
    secret: true,
    rarity: 'epic',
  },
  {
    id: 'completionist',
    title: 'Completionist',
    description: 'Desbloqueaste todos los achievements',
    icon: '👑',
    secret: true,
    rarity: 'legendary',
  },
];

export function unlockAchievement(achievementId: string) {
  if (typeof globalThis === 'undefined') return;

  const unlocked = getUnlockedAchievements();
  if (!unlocked.includes(achievementId)) {
    unlocked.push(achievementId);
    localStorage.setItem('achievements', JSON.stringify(unlocked));
    showAchievementToast(achievementId);
  }
}

export function getUnlockedAchievements(): string[] {
  if (typeof globalThis === 'undefined') return [];
  return JSON.parse(localStorage.getItem('achievements') ?? '[]');
}

export function isAchievementUnlocked(achievementId: string): boolean {
  return getUnlockedAchievements().includes(achievementId);
}

export function getAchievementProgress(): {
  unlocked: number;
  total: number;
  percentage: number;
} {
  const unlocked = getUnlockedAchievements().length;
  const total = achievements.length;
  return {
    unlocked,
    total,
    percentage: Math.round((unlocked / total) * 100),
  };
}

function showAchievementToast(achievementId: string) {
  const achievement = achievements.find((a) => a.id === achievementId);
  if (!achievement || achievement.silent) return;

  // Create toast container using DOM API to prevent XSS
  const toast = document.createElement('div');
  toast.className = 'achievement-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');

  // Create inner container with styles
  const innerContainer = document.createElement('div');
  innerContainer.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    z-index: 9999;
    font-weight: bold;
    animation: slideInUp 0.5s ease-out;
    max-width: 300px;
  `;

  // Create flex container
  const flexContainer = document.createElement('div');
  flexContainer.style.cssText = 'display: flex; align-items: center; gap: 12px;';

  // Create icon element (safe - icons are hardcoded emojis)
  const iconDiv = document.createElement('div');
  iconDiv.style.fontSize = '32px';
  iconDiv.textContent = achievement.icon;

  // Create text container
  const textContainer = document.createElement('div');

  // Create header text
  const headerDiv = document.createElement('div');
  headerDiv.style.cssText = 'font-size: 14px; font-weight: bold;';
  headerDiv.textContent = '🏆 Achievement Unlocked!';

  // Create title text (sanitized via textContent)
  const titleDiv = document.createElement('div');
  titleDiv.style.cssText = 'font-size: 12px; font-weight: normal; margin-top: 4px; opacity: 0.9;';
  titleDiv.textContent = achievement.title;

  // Assemble the DOM tree
  textContainer.appendChild(headerDiv);
  textContainer.appendChild(titleDiv);
  flexContainer.appendChild(iconDiv);
  flexContainer.appendChild(textContainer);
  innerContainer.appendChild(flexContainer);
  toast.appendChild(innerContainer);

  // Añadir al main landmark en lugar de al body directamente
  const mainElement = document.getElementById('main-content');
  if (mainElement) {
    mainElement.appendChild(toast);
  } else {
    // Fallback si no se encuentra el elemento main
    document.body.appendChild(toast);
  }

  setTimeout(() => {
    innerContainer.style.animation = 'fadeOut 0.3s ease-in';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
