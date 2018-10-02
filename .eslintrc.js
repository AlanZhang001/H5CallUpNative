module.exports = {
    root: true,
    extends: 'eslint:recommended',
    env: {
        browser: true,
        node: true,
        amd: true
    },
    globals: {
        'JSON': true
    },
    parserOptions: {
        ecmaVersion: 7,
        sourceType: 'module'
    },
    rules:{
        // 如果项目有特殊需求，可在此覆盖

    }
};
