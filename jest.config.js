const nextJest = require('next/jest')

const createJestConfig = nextJest({ dir: './' })

const config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(unified|remark-|rehype-|micromark|unist-|mdast-|character-entities|markdown-table|ccount|escape-string-regexp|is-plain-obj|is-buffer|bail|decode-named-character-reference)/)',
  ],
}

module.exports = createJestConfig(config)
