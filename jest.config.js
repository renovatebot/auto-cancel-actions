const ci = !!process.env.CI;

/** @type {import('@jest/types').Config.InitialOptions} */
/** @typedef {import('ts-jest')} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{js,ts}'],
  coverageReporters: ci
    ? ['html', 'json', 'text-summary']
    : ['html', 'text-summary'],
  // coverageThreshold: {
  //   global: {
  //     branches: 100,
  //     functions: 100,
  //     lines: 100,
  //     statements: 100,
  //   },
  // },
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
};
