/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta base (Coolors) con verde predominante
        'brand-navy': '#1B4079',       // azul profundo
        'brand-teal': '#4D7C8A',       // azul verdoso
        'brand-sage': '#7F9C96',       // verde grisáceo
        'brand-fern': '#8FAD88',       // verde principal
        'brand-lime': '#CBDF90',       // verde claro de acento

        // Tokens de diseño usados en los componentes
        primary: '#8FAD88',            // bg-primary
        'primary-dark': '#7F9C96',     // hover / estados activos
        'primary-soft': '#CBDF90',     // chips, badges suaves
        'primary-foreground': '#0F172A',

        surface: '#F5F7F2',            // fondos suaves reemplazando grises planos
      },
    },
  },
  plugins: [],
}