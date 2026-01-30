/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'milk-white': '#FDFDFD',      
        'compliance-blue': '#003366', 
        'clinical-grey': '#4B5563',   
      },
    },
  },
  plugins: [],
}