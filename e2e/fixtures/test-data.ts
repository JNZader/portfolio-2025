import { nanoid } from 'nanoid';

/**
 * Generate unique test data
 */
export const testData = {
  // Newsletter
  newsletter: {
    validEmail: () => `test-${nanoid(8)}@example.com`,
    invalidEmail: 'not-an-email',
  },

  // Contact
  contact: {
    name: 'John Doe',
    email: () => `test-${nanoid(8)}@example.com`,
    message: 'This is a test message from E2E tests.',
    longMessage: 'a'.repeat(1000),
  },

  // Search
  search: {
    validQuery: 'React',
    noResultsQuery: 'xyzabc123',
  },
};
