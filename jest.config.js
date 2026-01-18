/**
 * Jest Configuration for Veil Extension
 *
 * Testing Chrome Extension utilities without actual Chrome APIs
 */

module.exports = {
  // Use jsdom environment for DOM testing
  testEnvironment: 'jsdom',

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Test file patterns
  testMatch: [
    '**/tests/**/*.test.js',
  ],

  // Coverage collection
  collectCoverageFrom: [
    'shared/**/*.js',
    'content/**/*.js',
    '!shared/constants.js',
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
  },

  // Module paths
  moduleDirectories: ['node_modules', '<rootDir>'],

  // Clear mocks between tests
  clearMocks: true,

  // Verbose output
  verbose: true,
};
