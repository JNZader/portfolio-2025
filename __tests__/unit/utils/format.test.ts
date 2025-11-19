import { describe, expect, it } from 'vitest';
import {
  calculateReadingTime,
  formatBytes,
  formatDate,
  formatNumber,
  formatPercent,
  truncate,
} from '@/lib/utils/format';

describe('formatDate', () => {
  it('should format date in long format by default', () => {
    const date = new Date('2025-10-05T10:00:00Z');
    expect(formatDate(date)).toBe('5 de octubre de 2025');
  });

  it('should handle string dates', () => {
    expect(formatDate('2025-10-05')).toMatch(/octubre.*2025/);
  });

  it('should format date in short format', () => {
    const date = new Date('2025-10-05T12:00:00');
    expect(formatDate(date, 'short')).toMatch(/5\/10\/2025/);
  });

  it('should format date in relative format', () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    expect(formatDate(yesterday, 'relative')).toMatch(/hace.*día/);
  });
});

describe('formatNumber', () => {
  it('should format numbers with en-US locale by default', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('should format with es-ES locale', () => {
    expect(formatNumber(1234567, 'es-ES')).toBe('1.234.567');
  });

  it('should handle zero', () => {
    expect(formatNumber(0)).toBe('0');
  });
});

describe('formatBytes', () => {
  it('should format bytes correctly', () => {
    expect(formatBytes(0)).toBe('0 Bytes');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1024 * 1024)).toBe('1 MB');
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
  });

  it('should handle custom decimals', () => {
    expect(formatBytes(1536, 2)).toBe('1.5 KB');
  });
});

describe('truncate', () => {
  it('should truncate text longer than maxLength', () => {
    expect(truncate('Hello World', 5)).toBe('Hello...');
  });

  it('should not truncate text shorter than maxLength', () => {
    expect(truncate('Hello', 10)).toBe('Hello');
  });
});

describe('formatPercent', () => {
  it('should format percentage correctly', () => {
    expect(formatPercent(0.856)).toBe('86%');
    expect(formatPercent(0.856, 1)).toBe('85.6%');
  });
});

describe('calculateReadingTime', () => {
  it('should calculate reading time based on word count', () => {
    const text = 'word '.repeat(400); // 400 words
    expect(calculateReadingTime(text)).toBe(2); // 400/200 = 2 minutes
  });

  it('should round up reading time', () => {
    const text = 'word '.repeat(250); // 250 words
    expect(calculateReadingTime(text)).toBe(2); // ceil(250/200) = 2
  });

  it('should accept custom words per minute', () => {
    const text = 'word '.repeat(300); // 300 words
    expect(calculateReadingTime(text, 100)).toBe(3); // 300/100 = 3
  });
});
