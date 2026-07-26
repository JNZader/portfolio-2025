import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@/__tests__/test-utils';
import userEvent from '@testing-library/user-event';
import { TechDropdown } from '@/components/projects/TechDropdown';

/**
 * Proyectos filters redesign — the overflow dropdown is a Radix popover with
 * a typeahead filter input and a multiselect listbox. Focus stays in the
 * input while arrows move aria-activedescendant; toggling never closes;
 * Escape closes and returns focus to the trigger.
 */
const REMAINING = ['Astro', 'Python', 'Rust'];

function renderDropdown(selectedTechs: string[] = [], onToggleTech = vi.fn()) {
  render(
    <TechDropdown
      remainingTechs={REMAINING}
      selectedTechs={selectedTechs}
      onToggleTech={onToggleTech}
    />
  );
  return { onToggleTech };
}

function getTrigger() {
  return screen.getByRole('button', { name: 'Mostrar 3 tecnologías más' });
}

async function openDropdown() {
  const user = userEvent.setup();
  await user.click(getTrigger());
  return user;
}

describe('TechDropdown', () => {
  it('renders a closed trigger with listbox affordance and localized count', () => {
    renderDropdown();

    const trigger = getTrigger();
    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger.textContent).toContain('+3 más');
  });

  it('opens on click, flips aria-expanded and moves focus to the filter input', async () => {
    renderDropdown();
    await openDropdown();

    expect(getTrigger()).toHaveAttribute('aria-expanded', 'true');
    const input = screen.getByPlaceholderText('Filtrar tecnologías…');
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute('aria-label', 'Filtrar tecnologías…');
  });

  it('opens with the keyboard (Enter on the trigger)', async () => {
    renderDropdown();
    const user = userEvent.setup();

    getTrigger().focus();
    await user.keyboard('{Enter}');

    expect(getTrigger()).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByPlaceholderText('Filtrar tecnologías…')).toHaveFocus();
  });

  it('lists the remaining techs as a multiselect listbox', async () => {
    renderDropdown(['Rust']);
    await openDropdown();

    const listbox = screen.getByRole('listbox');
    expect(listbox).toHaveAttribute('aria-multiselectable', 'true');

    const options = within(listbox).getAllByRole('option');
    expect(options.map((option) => option.textContent)).toEqual(REMAINING);
    expect(within(listbox).getByRole('option', { name: /Rust/ })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(within(listbox).getByRole('option', { name: /Astro/ })).toHaveAttribute(
      'aria-selected',
      'false'
    );
  });

  it('typeahead filters options case-insensitively', async () => {
    renderDropdown();
    const user = await openDropdown();

    await user.type(screen.getByPlaceholderText('Filtrar tecnologías…'), 'pY');

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent('Python');
  });

  it('shows the localized no-results message when nothing matches', async () => {
    renderDropdown();
    const user = await openDropdown();

    await user.type(screen.getByPlaceholderText('Filtrar tecnologías…'), 'zzz');

    expect(screen.getByText('Ninguna tecnología coincide')).toBeInTheDocument();
    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });

  it('moves aria-activedescendant with arrows while focus stays in the input', async () => {
    renderDropdown();
    const user = await openDropdown();

    const input = screen.getByPlaceholderText('Filtrar tecnologías…');
    const listbox = screen.getByRole('listbox');
    expect(listbox).toHaveAttribute('aria-activedescendant', 'tech-option-Astro');

    await user.keyboard('{ArrowDown}');
    expect(listbox).toHaveAttribute('aria-activedescendant', 'tech-option-Python');
    expect(input).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(listbox).toHaveAttribute('aria-activedescendant', 'tech-option-Rust');

    // Wraps at the end
    await user.keyboard('{ArrowDown}');
    expect(listbox).toHaveAttribute('aria-activedescendant', 'tech-option-Astro');

    await user.keyboard('{ArrowUp}');
    expect(listbox).toHaveAttribute('aria-activedescendant', 'tech-option-Rust');
    expect(input).toHaveFocus();
  });

  it('toggles the active option with Enter without closing the dropdown', async () => {
    const { onToggleTech } = renderDropdown();
    const user = await openDropdown();

    await user.keyboard('{Enter}');
    expect(onToggleTech).toHaveBeenCalledWith('Astro');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(getTrigger()).toHaveAttribute('aria-expanded', 'true');
  });

  it('toggles the active option with Space without closing the dropdown', async () => {
    const { onToggleTech } = renderDropdown();
    const user = await openDropdown();

    await user.keyboard('{ArrowDown}');
    await user.keyboard(' ');
    expect(onToggleTech).toHaveBeenCalledWith('Python');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('Escape closes the dropdown and returns focus to the trigger', async () => {
    renderDropdown();
    const user = await openDropdown();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(getTrigger()).toHaveAttribute('aria-expanded', 'false');
    expect(getTrigger()).toHaveFocus();
  });

  it('clears the typeahead query when the dropdown is closed and reopened', async () => {
    renderDropdown();
    const user = await openDropdown();

    await user.type(screen.getByPlaceholderText('Filtrar tecnologías…'), 'py');
    await user.keyboard('{Escape}');

    await user.click(getTrigger());
    const input = screen.getByPlaceholderText('Filtrar tecnologías…');
    expect(input).toHaveValue('');
    expect(screen.getAllByRole('option')).toHaveLength(REMAINING.length);
  });
});
