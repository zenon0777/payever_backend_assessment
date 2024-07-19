module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: 'src',
    testRegex: '.*\.spec\.ts$',
    transform: {
      '^.+\\.(t|j)s$': 'ts-jest',
    },
    collectCoverage: true,
    coverageDirectory: '../coverage',
    moduleNameMapper: {
     "^src/(.*)$": "<rootDir>/src/$1"
    }
  };
  