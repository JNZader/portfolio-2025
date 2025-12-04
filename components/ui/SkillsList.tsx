import type { Skill } from '@/lib/constants/skills';
import { SkillBadge } from './SkillBadge';

interface SkillsListProps {
  title: string;
  skills: Skill[];
  className?: string;
}

export function SkillsList({ title, skills, className }: SkillsListProps) {
  return (
    <div className={className}>
      <h4 className="font-semibold text-sm mb-2">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <SkillBadge key={skill.name} name={skill.name} icon={skill.icon} color={skill.color} />
        ))}
      </div>
    </div>
  );
}
