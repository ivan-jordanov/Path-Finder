module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        parchment: {
          DEFAULT: '#F5F0E8',
          dark: '#EDE8DC',
        },
        forest: {
          DEFAULT: '#2D6A4F',
          light: '#52B788',
          dark: '#1B4332',
        },
        amber: {
          DEFAULT: '#D4782A',
          light: '#F4A261',
        },
        trail: '#E76F51',
        ink: {
          DEFAULT: '#1C1C1C',
          light: '#5A5A4A',
          muted: '#9A9A8A',
        },
        sand: {
          DEFAULT: '#D8D2C2',
          light: '#E5E0D4',
        },
        danger: {
          DEFAULT: '#C1121F',
          light: '#FFDDD2',
        },
      },
    },
  },
};