import { describe, expect, it } from 'vitest';
import {
  isArray,
  isBoolean,
  isClient,
  isDefined,
  isEmail,
  isFunction,
  isNullish,
  isNumber,
  isObject,
  isPromise,
  isServer,
  isString,
  isUrl,
} from '@/lib/utils/guards';

describe('isString', () => {
  it('should return true for strings', () => {
    expect(isString('hello')).toBe(true);
    expect(isString('')).toBe(true);
  });

  it('should return false for non-strings', () => {
    expect(isString(123)).toBe(false);
    expect(isString(null)).toBe(false);
    expect(isString(undefined)).toBe(false);
  });
});

describe('isNumber', () => {
  it('should return true for numbers', () => {
    expect(isNumber(123)).toBe(true);
    expect(isNumber(0)).toBe(true);
    expect(isNumber(-5.5)).toBe(true);
  });

  it('should return false for NaN', () => {
    expect(isNumber(Number.NaN)).toBe(false);
  });

  it('should return false for non-numbers', () => {
    expect(isNumber('123')).toBe(false);
    expect(isNumber(null)).toBe(false);
  });
});

describe('isBoolean', () => {
  it('should return true for booleans', () => {
    expect(isBoolean(true)).toBe(true);
    expect(isBoolean(false)).toBe(true);
  });

  it('should return false for non-booleans', () => {
    expect(isBoolean(1)).toBe(false);
    expect(isBoolean('true')).toBe(false);
  });
});

describe('isNullish', () => {
  it('should return true for null and undefined', () => {
    expect(isNullish(null)).toBe(true);
    expect(isNullish(undefined)).toBe(true);
  });

  it('should return false for other values', () => {
    expect(isNullish(0)).toBe(false);
    expect(isNullish('')).toBe(false);
    expect(isNullish(false)).toBe(false);
  });
});

describe('isDefined', () => {
  it('should return true for defined values', () => {
    expect(isDefined(0)).toBe(true);
    expect(isDefined('')).toBe(true);
    expect(isDefined(false)).toBe(true);
  });

  it('should return false for null and undefined', () => {
    expect(isDefined(null)).toBe(false);
    expect(isDefined(undefined)).toBe(false);
  });
});

describe('isArray', () => {
  it('should return true for arrays', () => {
    expect(isArray([])).toBe(true);
    expect(isArray([1, 2, 3])).toBe(true);
  });

  it('should return false for non-arrays', () => {
    expect(isArray({})).toBe(false);
    expect(isArray('array')).toBe(false);
  });
});

describe('isObject', () => {
  it('should return true for objects', () => {
    expect(isObject({})).toBe(true);
    expect(isObject({ key: 'value' })).toBe(true);
  });

  it('should return false for arrays and null', () => {
    expect(isObject([])).toBe(false);
    expect(isObject(null)).toBe(false);
  });
});

describe('isFunction', () => {
  it('should return true for functions', () => {
    expect(isFunction(() => {})).toBe(true);
    expect(isFunction(function test() {})).toBe(true);
  });

  it('should return false for non-functions', () => {
    expect(isFunction({})).toBe(false);
    expect(isFunction('function')).toBe(false);
  });
});

describe('isPromise', () => {
  it('should return true for promises', () => {
    expect(isPromise(Promise.resolve())).toBe(true);
    expect(isPromise(new Promise(() => {}))).toBe(true);
  });

  it('should return false for non-promises', () => {
    expect(isPromise({})).toBe(false);
    expect(isPromise({ then: () => {} })).toBe(false);
  });
});

describe('isEmail', () => {
  it('should return true for valid emails', () => {
    expect(isEmail('test@example.com')).toBe(true);
    expect(isEmail('user.name@domain.org')).toBe(true);
  });

  it('should return false for invalid emails', () => {
    expect(isEmail('invalid')).toBe(false);
    expect(isEmail('no@domain')).toBe(false);
    expect(isEmail('@example.com')).toBe(false);
  });
});

describe('isUrl', () => {
  it('should return true for valid URLs', () => {
    expect(isUrl('https://example.com')).toBe(true);
    expect(isUrl('http://localhost:3000')).toBe(true);
  });

  it('should return false for invalid URLs', () => {
    expect(isUrl('not-a-url')).toBe(false);
    expect(isUrl('example.com')).toBe(false);
  });
});

describe('isClient', () => {
  it('should return true in browser environment', () => {
    // In happy-dom, window is defined
    expect(isClient()).toBe(true);
  });
});

describe('isServer', () => {
  it('should return false in browser environment', () => {
    // In happy-dom, window is defined
    expect(isServer()).toBe(false);
  });
});
