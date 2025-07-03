import type { JestConfigWithTsJest } from 'ts-jest'
import { pathsToModuleNameMapper } from 'ts-jest'
import { compilerOptions } from '../../tsconfig.json'

const config: JestConfigWithTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['./tests'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        isolatedModules: true,
      },
    ],
  },
  coverageReporters: ['text-summary', 'html'],
  moduleNameMapper:
    pathsToModuleNameMapper(compilerOptions.paths ?? {}, { prefix: '<rootDir>/../../' }) || {},
}

export default config
