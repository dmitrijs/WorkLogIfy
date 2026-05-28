import { rmSync } from "node:fs";
import { defineConfig } from "vite-plus";
import electron from "vite-plugin-electron";
import renderer from "vite-plugin-electron-renderer";
import pkg from "./package.json" with { type: "json" };
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

rmSync("dist-electron", { recursive: true, force: true });

const isBuild = process.env.NODE_ENV === "production";
const sourcemap = !isBuild || !!process.env.VSCODE_DEBUG;

// https://vitejs.dev/config/
export default defineConfig({
    lint: {
        plugins: ["oxc", "typescript", "unicorn", "react"],
        categories: {
            correctness: "warn",
        },
        env: {
            builtin: true,
        },
        ignorePatterns: ["external/", "dist/", "dist-electron/"],
        rules: {
            "constructor-super": "error",
            "for-direction": "error",
            "getter-return": "error",
            "no-async-promise-executor": "error",
            "no-case-declarations": "error",
            "no-class-assign": "error",
            "no-compare-neg-zero": "error",
            "no-cond-assign": "error",
            "no-const-assign": "error",
            "no-constant-binary-expression": "error",
            "no-constant-condition": "error",
            "no-control-regex": "error",
            "no-debugger": "error",
            "no-delete-var": "error",
            "no-dupe-class-members": "error",
            "no-dupe-else-if": "error",
            "no-dupe-keys": "error",
            "no-duplicate-case": "error",
            "no-empty": "error",
            "no-empty-character-class": "error",
            "no-empty-pattern": "error",
            "no-empty-static-block": "error",
            "no-ex-assign": "error",
            "no-extra-boolean-cast": "error",
            "no-fallthrough": "error",
            "no-func-assign": "error",
            "no-global-assign": "error",
            "no-import-assign": "error",
            "no-invalid-regexp": "error",
            "no-irregular-whitespace": "error",
            "no-loss-of-precision": "error",
            "no-misleading-character-class": "error",
            "no-new-native-nonconstructor": "error",
            "no-nonoctal-decimal-escape": "error",
            "no-obj-calls": "error",
            "no-prototype-builtins": "error",
            "no-redeclare": "error",
            "no-regex-spaces": "error",
            "no-self-assign": "error",
            "no-setter-return": "error",
            "no-shadow-restricted-names": "error",
            "no-sparse-arrays": "error",
            "no-this-before-super": "error",
            "no-undef": "error",
            "no-unexpected-multiline": "error",
            "no-unreachable": "error",
            "no-unsafe-finally": "error",
            "no-unsafe-negation": "error",
            "no-unsafe-optional-chaining": "error",
            "no-unused-labels": "error",
            "no-unused-private-class-members": "error",
            "no-unused-vars": "error",
            "no-useless-backreference": "error",
            "no-useless-catch": "error",
            "no-useless-escape": "error",
            "no-with": "error",
            "require-yield": "error",
            "use-isnan": "error",
            "valid-typeof": "error",
            "no-array-constructor": "error",
            "no-unused-expressions": "error",
            "typescript/ban-ts-comment": "error",
            "typescript/no-duplicate-enum-values": "error",
            "typescript/no-empty-object-type": "error",
            "typescript/no-explicit-any": "error",
            "typescript/no-extra-non-null-assertion": "error",
            "typescript/no-misused-new": "error",
            "typescript/no-namespace": "error",
            "typescript/no-non-null-asserted-optional-chain": "error",
            "typescript/no-require-imports": "error",
            "typescript/no-this-alias": "error",
            "typescript/no-unnecessary-type-constraint": "error",
            "typescript/no-unsafe-declaration-merging": "error",
            "typescript/no-unsafe-function-type": "error",
            "typescript/no-wrapper-object-types": "error",
            "typescript/prefer-as-const": "error",
            "typescript/prefer-namespace-keyword": "error",
            "typescript/triple-slash-reference": "error",
            "typescript/no-floating-promises": "allow",
            "no-explicit-any": "allow",
            "exhaustive-deps": "allow",
            "no-redundant-type-constituents": "allow",
        },
        overrides: [
            {
                files: ["**/*.cjs"],
                globals: {
                    __dirname: "readonly",
                    __filename: "readonly",
                    AbortController: "readonly",
                    AbortSignal: "readonly",
                    atob: "readonly",
                    Blob: "readonly",
                    BroadcastChannel: "readonly",
                    btoa: "readonly",
                    Buffer: "readonly",
                    ByteLengthQueuingStrategy: "readonly",
                    clearImmediate: "readonly",
                    clearInterval: "readonly",
                    clearTimeout: "readonly",
                    CompressionStream: "readonly",
                    console: "readonly",
                    CountQueuingStrategy: "readonly",
                    crypto: "readonly",
                    Crypto: "readonly",
                    CryptoKey: "readonly",
                    CustomEvent: "readonly",
                    DecompressionStream: "readonly",
                    DOMException: "readonly",
                    Event: "readonly",
                    EventTarget: "readonly",
                    fetch: "readonly",
                    File: "readonly",
                    FormData: "readonly",
                    Headers: "readonly",
                    Intl: "readonly",
                    MessageChannel: "readonly",
                    MessageEvent: "readonly",
                    MessagePort: "readonly",
                    performance: "readonly",
                    PerformanceEntry: "readonly",
                    PerformanceMark: "readonly",
                    PerformanceMeasure: "readonly",
                    PerformanceObserver: "readonly",
                    PerformanceObserverEntryList: "readonly",
                    PerformanceResourceTiming: "readonly",
                    process: "readonly",
                    queueMicrotask: "readonly",
                    ReadableByteStreamController: "readonly",
                    ReadableStream: "readonly",
                    ReadableStreamBYOBReader: "readonly",
                    ReadableStreamBYOBRequest: "readonly",
                    ReadableStreamDefaultController: "readonly",
                    ReadableStreamDefaultReader: "readonly",
                    Request: "readonly",
                    Response: "readonly",
                    setImmediate: "readonly",
                    setInterval: "readonly",
                    setTimeout: "readonly",
                    structuredClone: "readonly",
                    SubtleCrypto: "readonly",
                    TextDecoder: "readonly",
                    TextDecoderStream: "readonly",
                    TextEncoder: "readonly",
                    TextEncoderStream: "readonly",
                    TransformStream: "readonly",
                    TransformStreamDefaultController: "readonly",
                    URL: "readonly",
                    URLSearchParams: "readonly",
                    WebAssembly: "readonly",
                    WritableStream: "readonly",
                    WritableStreamDefaultController: "readonly",
                    WritableStreamDefaultWriter: "readonly",
                },
                env: {
                    amd: true,
                    commonjs: true,
                },
            },
            {
                files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
                rules: {
                    "constructor-super": "off",
                    "getter-return": "off",
                    "no-class-assign": "off",
                    "no-const-assign": "off",
                    "no-dupe-class-members": "off",
                    "no-dupe-keys": "off",
                    "no-func-assign": "off",
                    "no-import-assign": "off",
                    "no-new-native-nonconstructor": "off",
                    "no-obj-calls": "off",
                    "no-redeclare": "off",
                    "no-setter-return": "off",
                    "no-this-before-super": "off",
                    "no-undef": "off",
                    "no-unreachable": "off",
                    "no-unsafe-negation": "off",
                    "no-var": "error",
                    "no-with": "off",
                    "prefer-const": "error",
                    "prefer-rest-params": "error",
                    "prefer-spread": "error",
                },
            },
            {
                files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"],
                rules: {
                    "react/display-name": "error",
                    "react/jsx-key": "error",
                    "react/jsx-no-comment-textnodes": "error",
                    "react/jsx-no-duplicate-props": "error",
                    "react/jsx-no-target-blank": "error",
                    "react/jsx-no-undef": "error",
                    "react/no-children-prop": "error",
                    "react/no-danger-with-children": "error",
                    "react/no-direct-mutation-state": "error",
                    "react/no-find-dom-node": "error",
                    "react/no-is-mounted": "error",
                    "react/no-render-return-value": "error",
                    "react/no-string-refs": "error",
                    "react/no-unescaped-entities": "error",
                    "react/no-unknown-property": "error",
                    "react/no-unsafe": "off",
                    "react/react-in-jsx-scope": "off",
                    "react/require-render-return": "error",
                    "react/rules-of-hooks": "error",
                    "react/exhaustive-deps": "warn",
                },
            },
        ],
        options: {
            typeAware: true,
            typeCheck: true,
        },
    },
    build: {
        assetsInlineLimit: 0,
    },
    plugins: [
        react(),
        tailwindcss(),
        electron([
            {
                // Main-Process entry file of the Electron App.
                entry: "app/main/index.ts",
                onstart(options) {
                    if (process.env.VSCODE_DEBUG) {
                        console.log(/* For `.vscode/.debug.script.mjs` */ "[startup] Electron App");
                    } else {
                        options.startup();
                    }
                },
                vite: {
                    build: {
                        assetsInlineLimit: 0,
                        sourcemap,
                        minify: isBuild,
                        outDir: "dist-electron/main",
                        rollupOptions: {
                            external: Object.keys("dependencies" in pkg ? pkg.dependencies : {}),
                        },
                    },
                },
            },
            {
                entry: "app/main/preload.ts",
                onstart(options) {
                    // Notify the Renderer-Process to reload the page when the Preload-Scripts build is complete,
                    // instead of restarting the entire Electron App.
                    options.reload();
                },
                vite: {
                    build: {
                        assetsInlineLimit: 0,
                        sourcemap: sourcemap ? "inline" : undefined, // #332
                        minify: isBuild,
                        outDir: "dist-electron/preload",
                        rollupOptions: {
                            external: Object.keys("dependencies" in pkg ? pkg.dependencies : {}),
                        },
                    },
                },
            },
        ]),
        // Use Node.js API in the Renderer-process
        renderer(),
    ],
    staged: {
        "*": "vp check --fix",
    },
    fmt: {
        tabWidth: 4,
    },
    resolve: {
        alias: {
            "@": path.resolve(import.meta.dirname, "./app"),
        },
    },
    server: process.env.VSCODE_DEBUG
        ? (() => {
              const url = new URL(
                  (pkg as typeof pkg & { debug: { env: { VITE_DEV_SERVER_URL: string } } }).debug
                      .env.VITE_DEV_SERVER_URL,
              );
              return {
                  host: url.hostname,
                  port: +url.port,
              };
          })()
        : undefined,
    clearScreen: false,
});
