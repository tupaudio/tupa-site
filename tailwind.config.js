// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        // 'serif' para títulos (estilo boutique/clássico)
        'serif': ['"Playfair Display"', 'serif'], 
        // 'sans' para textos técnicos e botões (limpo/leitura fácil)
        'sans': ['"Inter"', 'ui-sans-serif', 'system-ui'],
      },
        colors: {
        tupaGold: '#D4AF37',
        tupaBlack: '#050505',
        tupaOffWhite: '#EAEAEA',
        tupaSilver: '#A8A9AD',
        tupaGrey: '#1A1A1A',
        tupaWood: '#5D4037',
        tupaMarrom: '#6F4E37',       // Adicionado
        tupaVerdeMusgo: '#4A5D4E',   // Adicionado
        tupaBege: '#D2B48C',         // Ajustado para tom de guitarra
      },
    },
  },
}