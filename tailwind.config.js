/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#177D4F', // Emerald
                secondary: '#8AAB35', // Leaf
                dark: {
                    bg: '#18181b', // Zinc-900
                    card: 'rgba(24, 24, 27, 0.6)',
                },
                light: {
                    bg: '#F8FAF9', // Off-white
                    card: 'rgba(255, 255, 255, 0.8)',
                }
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                glow: {
                    '0%': { boxShadow: '0 0 5px #177D4F' },
                    '100%': { boxShadow: '0 0 20px #8AAB35' },
                }
            }
        },
    },
    plugins: [],
}
