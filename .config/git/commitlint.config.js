module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation only
        'style',    // Formatting changes
        'refactor', // Code change that neither fixes a bug nor adds a feature
        'perf',     // Performance improvement
        'test',     // Adding or updating tests
        'chore',    // Maintenance, dependency updates
        'ci',       // CI/CD changes
        'build',    // Build system changes
        'revert',   // Revert previous commit
      ],
    ],
    'scope-enum': [
      2,
      'always',
      [
        'core',
        'cli',
        'api',
        'ui',
        'db',
        'auth',
        'tests',
        'docs',
        'deps',
        'config',
        'hooks',
        'ci',
        'security',
      ],
    ],
    'subject-case': [2, 'always', 'sentence-case'],
    'subject-max-length': [2, 'always', 100],
    'subject-empty': [2, 'never'],
    'body-max-line-length': [2, 'always', 100],
    'footer-max-line-length': [2, 'always', 100],
  },
  prompt: {
    questions: {
      type: {
        description: 'Select the type of change you are committing',
        enum: {
          feat: {
            description: 'A new feature',
            title: 'Features',
          },
          fix: {
            description: 'A bug fix',
            title: 'Bug Fixes',
          },
          docs: {
            description: 'Documentation only changes',
            title: 'Documentation',
          },
          style: {
            description: 'Changes that do not affect the meaning of the code',
            title: 'Styles',
          },
          refactor: {
            description: 'A code change that neither fixes a bug nor adds a feature',
            title: 'Code Refactoring',
          },
          perf: {
            description: 'A code change that improves performance',
            title: 'Performance Improvements',
          },
          test: {
            description: 'Adding missing tests or correcting existing tests',
            title: 'Tests',
          },
          build: {
            description: 'Changes that affect the build system or external dependencies',
            title: 'Builds',
          },
          ci: {
            description: 'Changes to our CI configuration files and scripts',
            title: 'Continuous Integrations',
          },
          chore: {
            description: "Other changes that don't modify src or test files",
            title: 'Chores',
          },
          revert: {
            description: 'Reverts a previous commit',
            title: 'Reverts',
          },
        },
      },
      scope: {
        description: 'What is the scope of this change (component/feature)',
      },
      subject: {
        description: 'Write a short, imperative tense description of the change',
      },
      body: {
        description: 'Provide a longer description of the change (optional)',
      },
      isBreaking: {
        description: 'Are there any breaking changes?',
      },
      breakingBody: {
        description: 'Describe the breaking changes',
      },
      breaking: {
        description: 'Describe the breaking changes',
      },
      issues: {
        description: 'Add issue references (e.g., "fix #123", "re #456")',
      },
    },
  },
};
