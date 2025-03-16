import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import react from 'eslint-plugin-react';
import globals from "globals";

export default tseslint.config(
    {
        files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
        plugins: {
            react,
        },
        languageOptions: {
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
    },
    {
        ignores: [
            'external/',
            'dist/',
            'dist-electron/',
        ],
    },
    {
        files: ["**/*.cjs"],
        languageOptions: {
            sourceType: "commonjs",
            globals: {
                ...globals.node,
                ...globals.amd,
            },
        },
    },
    {
        extends: [
            eslint.configs.recommended,
            tseslint.configs.recommended,
        ],
        rules: {
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-unused-expressions": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "prefer-const": "off",
        },
    },
    {
        files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
        extends: [
            react.configs.flat.recommended,
            react.configs.flat['jsx-runtime'],
            reactHooks.configs['recommended-latest'],
        ],
        settings: {
            react: {
                version: "detect",
            }
        }
    },
);
