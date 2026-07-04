import { describe, expect, it } from 'vitest';
import {
  findTypoSuggestion,
  getEditDistance,
  parseEmail,
  quickValidateEmail,
} from '@/lib/validations/email-validator-shared';

describe('getEditDistance (Levenshtein)', () => {
  it('is 0 for identical strings', () => {
    expect(getEditDistance('gmail.com', 'gmail.com')).toBe(0);
  });

  it('counts single-character edits', () => {
    expect(getEditDistance('gmail.com', 'gmial.com')).toBe(2); // transposición = 2 ediciones
    expect(getEditDistance('gmail.com', 'gmail.co')).toBe(1);
  });
});

describe('findTypoSuggestion', () => {
  it('suggests gmail.com for common typos', () => {
    expect(findTypoSuggestion('gmial.com')).toBe('gmail.com');
    expect(findTypoSuggestion('gmal.com')).toBe('gmail.com');
  });

  it('suggests hotmail.com for hotmial.com', () => {
    expect(findTypoSuggestion('hotmial.com')).toBe('hotmail.com');
  });

  it('does not suggest anything for a correct domain', () => {
    expect(findTypoSuggestion('gmail.com')).toBeUndefined();
  });

  it('does not suggest for unrelated domains', () => {
    expect(findTypoSuggestion('javierzader.com')).toBeUndefined();
  });

  it('does not suggest for known-real domains close to a common provider', () => {
    // ymail.com and mail.com are real providers within Levenshtein range of
    // gmail.com — the allowlist must short-circuit before the fuzzy pass.
    expect(findTypoSuggestion('ymail.com')).toBeUndefined();
    expect(findTypoSuggestion('mail.com')).toBeUndefined();
    expect(findTypoSuggestion('proton.me')).toBeUndefined();
  });
});

describe('parseEmail', () => {
  it('splits local part and domain', () => {
    expect(parseEmail('user@example.com')).toEqual({
      localPart: 'user',
      domain: 'example.com',
    });
  });

  it('returns null for garbage', () => {
    expect(parseEmail('no-at-sign')).toBeNull();
  });
});

describe('quickValidateEmail', () => {
  it('flags typo domains with a suggestion', () => {
    const result = quickValidateEmail('user@gmial.com');
    expect(result.suggestion).toBe('user@gmail.com');
  });

  it('accepts a normal email', () => {
    expect(quickValidateEmail('user@example.com').isValid).toBe(true);
  });
});
