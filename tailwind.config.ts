// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      keyframes: {
        // The shutter starts at bottom (100%), moves to center (0%), stays there, then moves up (-100%)
        shutter: {
          '0%': { transform: 'translateY(100%)' },
          '20%': { transform: 'translateY(0%)' },  // Arrive at center quickly
          '60%': { transform: 'translateY(0%)' },  // Stay covering screen while loading
          '100%': { transform: 'translateY(-100%)' }, // Exit to top
        },
        // Content fades in while shutter is closed
        fadeInBehind: {
          '0%, 20%': { opacity: '0' },
          '40%, 100%': { opacity: '1' },
        }
      },
      animation: {
        shutter: 'shutter 2.5s cubic-bezier(0.87, 0, 0.13, 1) forwards',
        fadeInBehind: 'fadeInBehind 2.5s ease-out forwards',
      },
    },
  },
  // ... rest of config
};
export default config;