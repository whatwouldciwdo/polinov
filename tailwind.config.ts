import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cabin: ["'Cabin'", ...defaultTheme.fontFamily.sans],
        buenard: ["'Buenard'", ...defaultTheme.fontFamily.serif],
        mono: ["'Space Mono'", ...defaultTheme.fontFamily.mono],
        bitter: ["'Bitter'", ...defaultTheme.fontFamily.serif],
      },
    },
  },
  plugins: [],
};

export default config;
