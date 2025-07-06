export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [require("daisyui")],
  // Optional: hvis du vil begrænse DaisyUI themes:
  daisyui: {
    themes: ["light", "dark", "cupcake"],
  },
};
