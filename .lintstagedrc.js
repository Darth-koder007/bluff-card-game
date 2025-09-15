
const path = require('path');

const eslintCommand = (filenames) =>
  `npx eslint --fix ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(' ')}`;

const prettierCommand = 'prettier --write';

module.exports = {
  'frontend/**/*.{ts,tsx,js,jsx}': (filenames) => {
    const relativeFilenames = filenames
      .map((f) => path.relative('frontend', f))
      .join(' ');
    return `cd frontend && npx eslint --fix ${relativeFilenames} && prettier --write ${relativeFilenames}`;
  },
  'backend/**/*.{ts,js}': (filenames) => {
    const relativeFilenames = filenames
      .map((f) => path.relative('backend', f))
      .join(' ');
    return `cd backend && npx eslint --fix ${relativeFilenames} && prettier --write ${relativeFilenames}`;
  },
  'shared/**/*.{ts,js}': (filenames) => {
    const relativeFilenames = filenames
      .map((f) => path.relative('shared', f))
      .join(' ');
    return `cd shared && npx eslint --fix ${relativeFilenames} && prettier --write ${relativeFilenames}`;
  },
};
