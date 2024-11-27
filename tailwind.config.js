/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class'],
    content: ['./src/components/**/*.{ts,tsx}', './src/app/**/*.{ts,tsx}'],
    theme: {
        container: {
            center: 'true',
            padding: '2rem',
            screens: {
                '2xl': '1400px',
            },
            extend: {
                backgroundImage: {
                    'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                    'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                },
                transitionProperty: {
                    top: 'top',
                },
            },
        },
        extend: {
            aspectRatio: {
                '3/4': '3 / 4',
                '9/16': '9 / 16',
            },
            colors: {
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                },
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            keyframes: {
                'accordion-down': {
                    from: {
                        height: '0',
                    },
                    to: {
                        height: 'var(--radix-accordion-content-height)',
                    },
                },
                'accordion-up': {
                    from: {
                        height: 'var(--radix-accordion-content-height)',
                    },
                    to: {
                        height: '0',
                    },
                },
                shine: {
                    '0%': {
                        'background-position': '0% 0%',
                    },
                    '100%': {
                        'background-position': '-135% 0%',
                    },
                },
                'text-gradient': {
                    to: {
                        'background-position': '-200%',
                    },
                },
                'spinner-leaf-fade': {
                    '0%, 100%': {
                        opacity: '0',
                    },
                    '50%': {
                        opacity: '1',
                    },
                },
            },
            animation: {
                shine: 'shine 1.3s infinite',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'accordion-down': 'accordion-down 0.2s ease-out',
                'text-gradient': 'text-gradient 4s linear 0s infinite normal forwards running',
                spin_3s_linear_infinite: 'spin 3s linear infinite',
                'spinner-leaf-fade': 'spinner-leaf-fade 800ms linear infinite',
            },
            backgroundImage: {
                curtain: 'url("/picture-photo.svg")',
                shine: 'linear-gradient(-90deg, hsl(var(--background)) 0%, hsl(var(--shine)) 50%, hsl(var(--background)) 100%)',
            },
            backgroundSize: {
                400: '400% 400%',
                '1/3': 'calc(100%/3)',
            },
        },
    },
    plugins: [
        require('tailwindcss-animate'),
        require('@vidstack/react/tailwind.cjs'),
        ({ addVariant }) => {
            addVariant('hocus', ['&:hover', '&:focus-visible']);
            addVariant('group-hocus', ['.group:hover &', '.group:focus-visible &']);
        },
    ],
};
