import { render, screen } from '@testing-library/react';
import { Code2 } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import { SkillBadge } from '@/components/ui/SkillBadge';

describe('SkillBadge', () => {
  it('preserves the public API, skill name, and decorative icon semantics', () => {
    render(<SkillBadge name="React" icon={Code2} color="text-cyan-500" className="test-class" />);

    const badge = screen.getByText('React');
    expect(badge).toHaveClass('test-class');
    expect(badge).toHaveTextContent('React');
    expect(badge.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(badge.querySelector('svg')).toHaveClass('text-cyan-500');
  });

  it('uses a contrast-safe semantic theme pairing for normal and hover states', () => {
    render(<SkillBadge name="TypeScript" icon={Code2} />);

    const badge = screen.getByText('TypeScript');
    expect(badge).toHaveClass('bg-primary', 'text-primary-foreground', 'hover:bg-primary-700');
    expect(badge).not.toHaveClass('bg-primary/10', 'text-primary');
  });
});
