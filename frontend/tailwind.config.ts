import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "var(--color-primary)", // Red
                secondary: "var(--color-secondary)", // Black
                "primary-light": "var(--color-primary-light)",
                "off-white": "var(--color-off-white)",
            },
            fontFamily: {
                sans: ["var(--font-poppins)", "sans-serif"],
                serif: ["var(--font-montserrat)", "sans-serif"],
            },
        },
    },
    plugins: [],
};
export default config;
