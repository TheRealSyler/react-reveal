import { promises } from 'fs';
import { Config } from '@jest/types';

const config: Config.InitialOptions = {
  testURL: 'http://localhost',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  setupFilesAfterEnv: ['jest-enzyme'],
  testEnvironment: 'enzyme',
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(tsx?)$', // jsx?|
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};

(async () => {
  await promises.writeFile('./jest.config.json', JSON.stringify(config, null, 2));
  console.log('\x1b[1;38;2;255;60;120mUpdated Jest Config\x1b[m');
})();
