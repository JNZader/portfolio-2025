'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { type Achievement, achievements, getUnlockedAchievements } from '@/lib/achievements';

interface AchievementWithUnlocked extends Achievement {
  unlocked: boolean;
}

export default function SecretAchievementsPage() {
  const [achievementsList, setAchievementsList] = useState<AchievementWithUnlocked[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const unlockedAchievements = getUnlockedAchievements();

    setAchievementsList(
      achievements.map((achievement) => ({
        ...achievement,
        unlocked: unlockedAchievements.includes(achievement.id),
      }))
    );
  }, []);

  if (!mounted) {
    return null;
  }

  const unlockedCount = achievementsList.filter((a) => a.unlocked).length;
  const totalCount = achievementsList.length;

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">🏆 Achievements Secretos</h1>
        <p className="text-lg text-muted-foreground mb-2">¡Encontraste la página secreta!</p>
        <p className="text-sm text-muted-foreground">
          {unlockedCount}/{totalCount} desbloqueados
        </p>
      </div>

      <div className="space-y-4">
        {achievementsList.map((achievement) => (
          <div
            key={achievement.id}
            className={`flex items-center gap-4 p-5 rounded-lg border-2 transition-all ${
              achievement.unlocked
                ? 'bg-card border-green-500/50 shadow-md'
                : 'bg-muted/30 border-border opacity-50'
            }`}
          >
            <div className={`text-4xl ${achievement.unlocked ? '' : 'grayscale blur-sm'}`}>
              {achievement.unlocked ? achievement.icon : '🔒'}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold">{achievement.unlocked ? achievement.title : '???'}</h3>
              <p className="text-sm text-muted-foreground">
                {achievement.unlocked
                  ? achievement.description
                  : 'Achievement secreto sin desbloquear'}
              </p>
            </div>

            {achievement.unlocked && (
              <span className="text-green-500 text-sm font-medium shrink-0">✓</span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link href="/" className="text-primary hover:underline text-sm">
          ← Volver al portfolio
        </Link>
      </div>
    </div>
  );
}
