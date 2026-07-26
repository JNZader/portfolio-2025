import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@/__tests__/test-utils';
import userEvent from '@testing-library/user-event';
import { TechDropdown } from '@/components/projects/TechDropdown';

/**
 * Proyectos filters redesign — the overflow dropdown is a Radix popover with
 * a typeahead filter input and a multiselect listbox. The focused input owns
 * the combobox semantics (role/expanded/controls/activedescendant); arrows
 * move the active option while focus stays in the input; Enter always
 * toggles, Space toggles only with an empty query; toggling never closes;
 * Escape closes and returns focus to the trigger.
 */
const REMAINING = ['Astro', 'Python', 'Rust'];

function renderDropdown(
  selectedTechs: string[] = [],
  onToggleTech = vi.fn(),
  remainingTechs: string[] = REMAINING
) {
  render(
    <TechDropdown
      remainingTechs={remainingTechs}
      selectedTechs={selectedTechs}
      onToggleTech={onToggleTech}
    />
  );
  return { onToggleTech };
}

function getTrigger() {
  return screen.getByRole('button', { name: '+3 más: Mostrar 3 tecnologías más' });
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

  it('includes the visible "+N más" text in the accessible name (Label-in-Name)', () => {
    renderDropdown();

    const trigger = getTrigger();
    const visibleText = trigger.textContent?.trim() ?? '';
    expect(visibleText).toContain('+3 más');
    // The accessible name must contain the visible label text.
    expect(trigger.getAttribute('aria-label')).toContain('+3 más');
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

  it('puts the combobox semantics on the focused input, not the listbox', async () => {
    renderDropdown();
    await openDropdown();

    const input = screen.getByRole('combobox', { name: 'Filtrar tecnologías…' });
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(input).toHaveAttribute('aria-controls', 'tech-dropdown-listbox');
    expect(input).toHaveAttribute('aria-activedescendant', 'tech-option-astro');

    const listbox = screen.getByRole('listbox');
    expect(listbox).not.toHaveAttribute('aria-activedescendant');
  });

  it('moves aria-activedescendant on the input with arrows while focus stays in it', async () => {
    renderDropdown();
    const user = await openDropdown();

    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('aria-activedescendant', 'tech-option-astro');

    await user.keyboard('{ArrowDown}');
    expect(input).toHaveAttribute('aria-activedescendant', 'tech-option-python');
    expect(input).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(input).toHaveAttribute('aria-activedescendant', 'tech-option-rust');

    // Wraps at the end
    await user.keyboard('{ArrowDown}');
    expect(input).toHaveAttribute('aria-activedescendant', 'tech-option-astro');

    await user.keyboard('{ArrowUp}');
    expect(input).toHaveAttribute('aria-activedescendant', 'tech-option-rust');
    expect(input).toHaveFocus();
  });

  it('generates valid slugified option ids for techs with spaces and special chars', async () => {
    renderDropdown([], vi.fn(), ['Next.js', 'Tailwind CSS', 'C++']);
    await openDropdown();

    const next = screen.getByRole('option', { name: 'Next.js' });
    const tailwind = screen.getByRole('option', { name: 'Tailwind CSS' });
    const cpp = screen.getByRole('option', { name: 'C++' });

    expect(next).toHaveAttribute('id', 'tech-option-next-js');
    expect(tailwind).toHaveAttribute('id', 'tech-option-tailwind-css');
    // Every id is a valid, whitespace-free HTML id fragment
    for (const option of screen.getAllByRole('option')) {
      expect(option.id).toMatch(/^tech-option-[a-z0-9-]+$/);
    }
    expect(cpp.id).toBeTruthy();
  });

  it('toggles the active option with Enter without closing the dropdown', async () => {
    const { onToggleTech } = renderDropdown();
    const user = await openDropdown();

    await user.keyboard('{Enter}');
    expect(onToggleTech).toHaveBeenCalledWith('Astro');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(getTrigger()).toHaveAttribute('aria-expanded', 'true');
  });

  it('toggles the active option with Space only when the query is empty', async () => {
    const { onToggleTech } = renderDropdown();
    const user = await openDropdown();

    await user.keyboard('{ArrowDown}');
    await user.keyboard(' ');
    expect(onToggleTech).toHaveBeenCalledWith('Python');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('types a literal space into the filter instead of toggling once a query exists', async () => {
    const { onToggleTech } = renderDropdown([], vi.fn(), ['Tailwind CSS', 'Rust']);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: '+2 más: Mostrar 2 tecnologías más' }));
    const input = screen.getByRole('combobox');

    await user.type(input, 'Tailwind CSS');

    expect(input).toHaveValue('Tailwind CSS');
    expect(onToggleTech).not.toHaveBeenCalled();
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent('Tailwind CSS');
  });

  it('still toggles with Enter even while a query is typed', async () => {
    const { onToggleTech } = renderDropdown();
    const user = await openDropdown();

    await user.type(screen.getByRole('combobox'), 'py');
    await user.keyboard('{Enter}');

    expect(onToggleTech).toHaveBeenCalledWith('Python');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('scrolls the active option into view on arrow navigation', async () => {
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    try {
      renderDropdown();
      const user = await openDropdown();

      await user.keyboard('{ArrowDown}');

      expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' });
    } finally {
      // jsdom does not implement scrollIntoView — restore the gap.
      delete (Element.prototype as { scrollIntoView?: unknown }).scrollIntoView;
    }
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
