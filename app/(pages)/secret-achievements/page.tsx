'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  type Achievement,
  achievements,
  getUnlockedAchievements,
  unlockAchievement,
} from '@/lib/achievements';

interface AchievementWithUnlocked extends Achievement {
  unlocked: boolean;
}

export default function SecretAchievementsPage() {
  const [achievementsList, setAchievementsList] = useState<AchievementWithUnlocked[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Cargar achievements del localStorage
    const unlockedAchievements = getUnlockedAchievements();

    // Check night owl achievement
    const currentHour = new Date().getHours();
    const isNightTime = currentHour >= 0 && currentHour < 6;
    if (isNightTime && !unlockedAchievements.includes('night_owl')) {
      unlockAchievement('night_owl');
    }

    const allAchievements: AchievementWithUnlocked[] = achievements.map((achievement) => ({
      ...achievement,
      unlocked:
        achievement.id === 'night_owl'
          ? isNightTime || unlockedAchievements.includes('night_owl')
          : achievement.id === 'completionist'
            ? unlockedAchievements.length === achievements.length - 1
            : unlockedAchievements.includes(achievement.id),
    }));

    setAchievementsList(allAchievements);

    // Auto-unlock "first_visit"
    if (!unlockedAchievements.includes('first_visit')) {
      unlockAchievement('first_visit');
      // Reload to show updated state
      setTimeout(() => {
        const updated = getUnlockedAchievements();
        setAchievementsList(
          achievements.map((a) => ({
            ...a,
            unlocked: updated.includes(a.id),
          }))
        );
      }, 100);
    }

    // Check completionist
    if (
      unlockedAchievements.length === achievements.length - 1 &&
      !unlockedAchievements.includes('completionist')
    ) {
      setTimeout(() => unlockAchievement('completionist'), 1000);
    }
  }, []);

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  const getRarityColor = (rarity: Achievement['rarity']) => {
    const colors = {
      common: 'bg-gray-500',
      rare: 'bg-blue-500',
      epic: 'bg-purple-500',
      legendary: 'bg-yellow-500',
    };
    return colors[rarity];
  };

  const unlockedCount = achievementsList.filter((a) => a.unlocked).length;
  const totalCount = achievementsList.length;
  const completionPercentage = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">🏆 Achievements Secretos</h1>
        <p className="text-lg text-muted-foreground mb-6">
          ¡Encontraste la página secreta! Aquí están todos los achievements ocultos.
        </p>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto">
          <div className="flex justify-between text-sm mb-2">
            <span>Progreso</span>
            <span className="font-bold">
              {unlockedCount}/{totalCount} ({Math.round(completionPercentage)}%)
            </span>
          </div>
          <div className="h-4 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {achievementsList.map((achievement) => (
          <div
            key={achievement.id}
            className={`
              relative p-6 rounded-lg border-2 transition-all
              ${
                achievement.unlocked
                  ? 'bg-card border-green-500 shadow-lg'
                  : 'bg-muted/50 border-border opacity-60'
              }
            `}
          >
            {/* Rarity Badge */}
            <div
              className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full font-bold text-white ${getRarityColor(achievement.rarity)}`}
            >
              {achievement.rarity.toUpperCase()}
            </div>

            <div className="flex items-start gap-4">
              {/* Icon */}
              <div
                className={`
                text-4xl
                ${achievement.unlocked ? 'grayscale-0' : 'grayscale blur-sm'}
              `}
              >
                {achievement.secret && !achievement.unlocked ? '🔒' : achievement.icon}
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-1">
                  {achievement.secret && !achievement.unlocked ? '???' : achievement.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {achievement.secret && !achievement.unlocked
                    ? 'Achievement secreto sin desbloquear'
                    : achievement.description}
                </p>

                {achievement.unlocked && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                    <span>✓</span>
                    <span className="font-medium">Desbloqueado</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Completion Message */}
      {completionPercentage === 100 && (
        <div className="mt-12 p-8 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg text-center">
          <div className="text-6xl mb-4">👑</div>
          <h2 className="text-3xl font-bold mb-2">¡COMPLETIONIST!</h2>
          <p className="text-lg">
            ¡Felicitaciones! Desbloqueaste todos los achievements. Sos oficialmente un maestro de
            easter eggs.
          </p>
        </div>
      )}

      {/* Back Link */}
      <div className="mt-8 text-center">
        <Link href="/" className="text-primary hover:underline">
          ← Volver al portfolio
        </Link>
      </div>
    </div>
  );
}
