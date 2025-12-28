/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: '#059669', // Emerald-600
                secondary: '#10b981', // Emerald-500
                accent: '#34d399', // Emerald-400
                glass: {
                    100: 'rgba(255, 255, 255, 0.1)',
                    200: 'rgba(255, 255, 255, 0.2)',
                    300: 'rgba(255, 255, 255, 0.3)',
                    border: 'rgba(255, 255, 255, 0.4)',
                    text: '#064e3b', // Emerald-900
                    'text-secondary': '#065f46', // Emerald-800
                },
                dark: {
                    bg: '#ecfdf5', // Emerald-50
                    card: 'rgba(255, 255, 255, 0.6)',
                },
                light: {
                    bg: '#ecfdf5', // Emerald-50
                    card: 'rgba(255, 255, 255, 0.6)',
                }
            },
            backgroundImage: {
                'glass-gradient': 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                'glass-card': 'linear-gradient(180deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.4) 100%)',
            },
            boxShadow: {
                'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
                'glass-sm': '0 2px 10px rgba(0, 0, 0, 0.05)',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                glow: {
                    '0%': { boxShadow: '0 0 5px #10b981' },
                    '100%': { boxShadow: '0 0 20px #34d399' },
                }
            }
        },
    },
    plugins: [
        function ({ addUtilities }) {
            const newUtilities = {
                ".pb-safe": {
                    paddingBottom: "env(safe-area-inset-bottom)",
                },
                ".pt-safe": {
                    paddingTop: "env(safe-area-inset-top)",
                },
                ".pl-safe": {
                    paddingLeft: "env(safe-area-inset-left)",
                },
                ".pr-safe": {
                    paddingRight: "env(safe-area-inset-right)",
                },
                ".mb-safe": {
                    marginBottom: "env(safe-area-inset-bottom)",
                },
                ".mt-safe": {
                    marginTop: "env(safe-area-inset-top)",
                },
            };
            addUtilities(newUtilities);
        },
    ],
}
