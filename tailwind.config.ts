import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        shop_dark_green: '#063c28',
        shop_btn_dark_green: '#063d29',
        shop_light_bg: '#fcf0e4',
        shop_light_green: '#3b9c3d',
        shop_orange: '#fb6c08',
        darkColor: '#151515',
        lightColor: '#52525b',
        lightOrange: '#fca99b',
        shop_lighter_green: '#93d991',
        shop_light_pink: '#fcf0e4',
        dark_blue: '#6c7fd8',
        shop_light_text: '#686e7d',
        shop_lighter_text: '#ababab',
        deal_bg: '#f1f3f8',
        shop_bg: '#F5F6FA',
        surface: '#FFFFFF',
        text_primary: '#1F2937',
        text_secondary: '#6B7280',
      },
    },
  },
  plugins: [],
};

export default config;