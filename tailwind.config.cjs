const {heroui} = require("@heroui/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
    content:  [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    ],
    theme:    {
        extend:  {},
        screens: {
            xl: {max: "1279px"},
            // => @media (max-width: 1279px) { ... }

            lg: {max: "1023px"},
            // => @media (max-width: 1023px) { ... }

            md: {max: "767px"},
            // => @media (max-width: 767px) { ... }

            sm: {max: "639px"},
            // => @media (max-width: 639px) { ... }

            le320: {max: "320px"},
            // => @media (max-width: 639px) { ... }

            ['>xl']: {min: "1280px"},
            ['>lg']: {min: "1024px"},
            ['>md']: {min: "768px"},
        },
    },
    darkMode: "class",
    plugins:  [heroui({
        themes: {
            dark: {
                colors: {
                    background: "#141316",
                    primary:    {
                        DEFAULT:    "#5BF556",
                        foreground: "black",
                    },
                    danger:     {
                        DEFAULT: "#E31A1A",
                    },
                    default:    {
                        DEFAULT:    "#222421",
                        foreground: "white",
                    },
                    focus:      "#5BF556",
                },
            },
        },
    })],
}


