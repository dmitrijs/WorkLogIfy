
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

            xs: {max: "319px"},
            // => @media (max-width: 319px) { ... }

            ['>xl']: {min: "1280px"},
            ['>lg']: {min: "1024px"},
            ['>md']: {min: "768px"},
        },
    },
    darkMode: "class",
}
