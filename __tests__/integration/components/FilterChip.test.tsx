import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/__tests__/test-utils';
import userEvent from '@testing-library/user-event';
import { FilterChip } from '@/components/ui/FilterChip';

/**
 * Proyectos filters redesign — shared toggle chip: checkbox semantics, bare
 * check only when selected, de-grayed unselected state and a guaranteed
 * 44x44 minimum touch target.
 */
describe('FilterChip', () => {
  it('renders a native button with checkbox semantics', () => {
    render(
      <FilterChip selected={false} onToggle={() => {}}>
        React
      </FilterChip>
    );

    const chip = screen.getByRole('checkbox', { name: 'React' });
    expect(chip.tagName).toBe('BUTTON');
    expect(chip).toHaveAttribute('type', 'button');
    expect(chip).toHaveAttribute('aria-checked', 'false');
  });

  it('mirrors the selected prop in aria-checked', () => {
    render(
      <FilterChip selected={true} onToggle={() => {}}>
        React
      </FilterChip>
    );

    expect(screen.getByRole('checkbox', { name: 'React' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
  });

  it('shows a bare aria-hidden check icon only when selected', () => {
    const { rerender } = render(
      <FilterChip selected={false} onToggle={() => {}}>
        Go
      </FilterChip>
    );
    expect(screen.queryByTestId('filter-check')).not.toBeInTheDocument();

    rerender(
      <FilterChip selected={true} onToggle={() => {}}>
        Go
      </FilterChip>
    );
    const check = screen.getByTestId('filter-check');
    expect(check).toHaveAttribute('aria-hidden', 'true');
  });

  it('guarantees a 44px minimum touch target via min-h-11 and min-w-11', () => {
    render(
      <FilterChip selected={false} onToggle={() => {}}>
        Go
      </FilterChip>
    );

    const chip = screen.getByRole('checkbox', { name: 'Go' });
    expect(chip.className).toContain('min-h-11');
    expect(chip.className).toContain('min-w-11');
  });

  it('de-grays the unselected state (foreground tones, no muted-foreground)', () => {
    render(
      <FilterChip selected={false} onToggle={() => {}}>
        React
      </FilterChip>
    );

    const chip = screen.getByRole('checkbox', { name: 'React' });
    expect(chip.className).toContain('text-foreground/80');
    expect(chip.className).not.toContain('text-muted-foreground');
  });

  it('keeps the primary treatment when selected', () => {
    render(
      <FilterChip selected={true} onToggle={() => {}}>
        React
      </FilterChip>
    );

    const chip = screen.getByRole('checkbox', { name: 'React' });
    expect(chip.className).toContain('border-primary/50');
    expect(chip.className).toContain('bg-primary/10');
    expect(chip.className).toContain('text-primary');
  });

  it('invokes onToggle with Enter and Space (native button keyboard behavior)', async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();
    render(
      <FilterChip selected={false} onToggle={onToggle}>
        React
      </FilterChip>
    );

    const chip = screen.getByRole('checkbox', { name: 'React' });
    chip.focus();
    await user.keyboard('{Enter}');
    expect(onToggle).toHaveBeenCalledTimes(1);
    await user.keyboard(' ');
    expect(onToggle).toHaveBeenCalledTimes(2);
  });
});
