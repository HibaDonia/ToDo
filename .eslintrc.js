module.exports = {
    root: true,
    env: {
        node: true,
        es6: true,
    },
    'extends': [
        'plugin:vue/essential',
        'eslint:recommended',
        '@vue/typescript/recommended'
    ],
    parserOptions: {
        ecmaVersion: 2020
    },
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'vue/no-v-model-argument': 'off',
        'indent': [
            'error',
            4,
            { 'SwitchCase': 1 }
        ],
        'quotes': [
            'error',
            'single',
            { 'allowTemplateLiterals': true }
        ],
        'semi': [
            'error',
            'always'
        ],
        'no-trailing-spaces': 'error',
    }
};
