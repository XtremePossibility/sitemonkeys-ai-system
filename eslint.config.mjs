export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '.git/**',
      'api/lib/verifier/**'
    ]
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        setImmediate: 'readonly',
        clearImmediate: 'readonly'
      }
    },
    rules: {
      'semi': ['warn', 'always'],
      'no-unused-vars': ['warn', { 
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_'
      }],
      'no-undef': 'error',
      'no-console': 'off'
    }
  },
  {
    files: ['**/sw.js', '**/service-worker.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        self: 'readonly',
        fetch: 'readonly',
        caches: 'readonly',
        Response: 'readonly',
        Request: 'readonly'
      }
    }
  },
  {
    files: ['public/**/*.js', 'locked-ui/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        console: 'readonly',
        navigator: 'readonly',
        location: 'readonly',
        XMLHttpRequest: 'readonly',
        FormData: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        // Application-specific globals defined in index.html
        conversationHistory: 'writable',
        getCurrentMode: 'readonly',
        extractedDocuments: 'writable',
        aiToggle: 'readonly',
        systemActive: 'writable',
        isVaultMode: 'readonly',
        crypto: 'readonly',
        AbortSignal: 'readonly'
      }
    }
  }
];
