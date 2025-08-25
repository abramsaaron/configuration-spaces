const colors = require("tailwindcss/colors");
const defaultTheme = require("tailwindcss/defaultTheme");
module.exports = {
  content: ["./htdocs/**/*.{php,html,js}", "./source/**/*.{php,html,js}"],
  important: true,
  plugins: [require("daisyui"), require("@tailwindcss/typography")],
  theme: {
    extend: {
      colors: {
        gray: colors.neutral,
      },
      fontFamily: {
        body: ["Alpino-Medium", ...defaultTheme.fontFamily.sans],
        sans: ["Alpino-Medium", ...defaultTheme.fontFamily.sans],
        serif: [...defaultTheme.fontFamily.serif],
        mono: [...defaultTheme.fontFamily.mono],
        fun: ["Alpino-Medium", ...defaultTheme.fontFamily.sans],
        gui: [...defaultTheme.fontFamily.sans],
      },
    },
    daisyui: {
      themes: [
        {
          lofi: {
            ...require("daisyui/src/colors/themes")["[data-theme=lofi]"],
          },
        },
      ],
    },
    typography: {
      DEFAULT: {
        css: {
          color: "#333",
          a: {
            color: "#c00",
            "&:hover": {
              color: "#00c",
            },
          },
        },
      },
    },
  },
};
