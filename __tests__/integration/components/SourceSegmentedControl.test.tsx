import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/__tests__/test-utils';
import userEvent from '@testing-library/user-event';
import {
  type ProjectSource,
  SourceSegmentedControl,
} from '@/components/projects/SourceSegmentedControl';

/**
 * Proyectos filters redesign — the source facet becomes an always-visible
 * segmented control with radiogroup semantics, roving tabindex and
 * focus-follows-selection keyboard behavior.
 */
function Harness({ onChange }: { onChange: (source: ProjectSource) => void }) {
  const [value, setValue] = useState<ProjectSource>('all');
  return (
    <SourceSegmentedControl
      value={value}
      onChange={(source) => {
        setValue(source);
        onChange(source);
      }}
    />
  );
}

function renderControl(onChange = vi.fn()) {
  render(<Harness onChange={onChange} />);
  return { onChange };
}

describe('SourceSegmentedControl', () => {
  it('exposes one radiogroup with a localized aria-label and three radios', () => {
    renderControl();

    const group = screen.getByRole('radiogroup', { name: 'Filtrar por fuente' });
    expect(group).toBeInTheDocument();

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
    expect(radios.map((radio) => radio.textContent)).toEqual(['Todos', 'Curados', 'GitHub']);
  });

  it('marks only the current value as checked', () => {
    render(
      <SourceSegmentedControl value="github" onChange={() => {}} />
    );

    expect(screen.getByRole('radio', { name: 'GitHub' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    expect(screen.getByRole('radio', { name: 'Todos' })).toHaveAttribute(
      'aria-checked',
      'false'
    );
    expect(screen.getByRole('radio', { name: 'Curados' })).toHaveAttribute(
      'aria-checked',
      'false'
    );
  });

  it('implements roving tabindex: only the checked segment is tabbable', () => {
    render(<SourceSegmentedControl value="sanity" onChange={() => {}} />);

    expect(screen.getByRole('radio', { name: 'Todos' })).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('radio', { name: 'Curados' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('radio', { name: 'GitHub' })).toHaveAttribute('tabindex', '-1');
  });

  it('is single-select: activating a segment deselects the previous one', async () => {
    const user = userEvent.setup();
    const { onChange } = renderControl();

    await user.click(screen.getByRole('radio', { name: 'GitHub' }));
    expect(onChange).toHaveBeenCalledWith('github');
    expect(screen.getByRole('radio', { name: 'GitHub' })).toHaveAttribute(
      'aria-checked',
      'true'
    );

    await user.click(screen.getByRole('radio', { name: 'Curados' }));
    expect(onChange).toHaveBeenCalledWith('sanity');
    expect(screen.getByRole('radio', { name: 'Curados' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    expect(screen.getByRole('radio', { name: 'GitHub' })).toHaveAttribute(
      'aria-checked',
      'false'
    );
  });

  it('ArrowRight/ArrowDown move to the next segment with wrap and focus-follows-selection', async () => {
    const user = userEvent.setup();
    const { onChange } = renderControl();

    screen.getByRole('radio', { name: 'Todos' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'Curados' })).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith('sanity');

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('radio', { name: 'GitHub' })).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith('github');

    // Wrap: GitHub -> Todos
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'Todos' })).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith('all');
    expect(screen.getByRole('radio', { name: 'Todos' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
  });

  it('ArrowLeft/ArrowUp move to the previous segment with wrap', async () => {
    const user = userEvent.setup();
    const { onChange } = renderControl();

    screen.getByRole('radio', { name: 'Todos' }).focus();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('radio', { name: 'GitHub' })).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith('github');

    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('radio', { name: 'Curados' })).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith('sanity');
  });

  it('Home/End jump to the first/last segment', async () => {
    const user = userEvent.setup();
    const { onChange } = renderControl();

    screen.getByRole('radio', { name: 'Todos' }).focus();
    await user.keyboard('{End}');
    expect(screen.getByRole('radio', { name: 'GitHub' })).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith('github');

    await user.keyboard('{Home}');
    expect(screen.getByRole('radio', { name: 'Todos' })).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith('all');
  });

  it('keeps every segment at a 44px minimum height', () => {
    renderControl();

    for (const radio of screen.getAllByRole('radio')) {
      expect(radio.className).toContain('min-h-11');
    }
  });
});
