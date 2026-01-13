import plugin from "tailwindcss/plugin";
import gradientMaskImage from "tailwind-gradient-mask-image";
import typography from "@tailwindcss/typography";
import tailwindAnimate from "tailwindcss-animate";

const sizes = Array.from({ length: 1000 }, (_, i) => i).reduce(
	(acc, curr) => {
		acc[curr] = `${curr}px`;
		return acc;
	},
	{
		max: "max-content",
		unset: "unset",
		full: "100%",
		inherit: "inherit",
		"1/2": "50%",
		"1/3": "33.3%",
		"2/3": "66.6%",
		"1/4": "25%",
		"1/6": "16.6%",
		"2/6": "33.3%",
		"3/6": "50%",
		"4/6": "66.6%",
		"5/6": "83.3%",
	}
);

/** @type {import('tailwindcss').Config} */
const config = {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
		"./lib/**/*.{js,ts,jsx,tsx}",
		"./packages/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
    	container: {
    		center: true,
    		padding: '2rem',
    		screens: {
    			'2xl': '1400px'
    		}
    	},
    	extend: {
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
    		colors: {
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			primary: {
    				DEFAULT: 'hsl(var(--primary))',
    				foreground: 'hsl(var(--primary-foreground))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
    			},
    			sidebar: {
    				DEFAULT: 'hsl(var(--sidebar-background))',
    				foreground: 'hsl(var(--sidebar-foreground))',
    				primary: 'hsl(var(--sidebar-primary))',
    				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
    				accent: 'hsl(var(--sidebar-accent))',
    				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
    				border: 'hsl(var(--sidebar-border))',
    				ring: 'hsl(var(--sidebar-ring))'
    			}
    		},
    		keyframes: {
    			'accordion-down': {
    				from: {
    					height: '0'
    				},
    				to: {
    					height: 'var(--radix-accordion-content-height)'
    				}
    			},
    			'accordion-up': {
    				from: {
    					height: 'var(--radix-accordion-content-height)'
    				},
    				to: {
    					height: '0'
    				}
    			}
    		},
    		animation: {
    			'accordion-down': 'accordion-down 0.2s ease-out',
    			'accordion-up': 'accordion-up 0.2s ease-out'
    		}
    	}
    },
	plugins: [
		plugin(({ addUtilities, matchUtilities }) => {
			addUtilities({
				".mask-border": {
					mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
					"mask-composite": "exclude",
					"pointer-events": "none",
				},
				".center-x": {
					position: "absolute",
					left: "50%",
					transform: "translateX(-50%)",
				},
				".center-y": {
					position: "absolute",
					top: "50%",
					transform: "translateY(-50%)",
				},
				".center": {
					position: "absolute",
					left: "50%",
					top: "50%",
					transform: "translate(-50%, -50%)",
				},
				".flex-center": {
					display: "flex",
					"align-items": "center",
					"justify-content": "center",
				},
				".rounded-inherit": { "border-radius": "inherit" },
				".overlay": {
					position: "absolute",
					top: 0,
					left: 0,
					width: "100%",
					height: "100%",
					"border-radius": "inherit",
				},
				".text-gradient": {
					"background-clip": "text",
					color: "transparent",
					"-webkit-text-fill-color": "transparent",
					"-webkit-background-clip": "text",
				},
			});

			matchUtilities(
				{
					cw: (value) => {
						const width = parseInt(value);
						return { width: value, left: `calc(50% - ${width / 2}px)` };
					},
					ch: (value) => {
						const height = parseInt(value);
						return { height: value, top: `calc(50% - ${height / 2}px)` };
					},
					cs: (value) => {
						const size = parseInt(value);
						return {
							width: size,
							height: size,
							left: `calc(50% - ${size / 2}px)`,
							top: `calc(50% - ${size / 2}px)`,
						};
					},
					cmw: (value) => {
						const [maxWidth, paddingX] = value
							.split(",")
							.map((v) => parseInt(v));
						const width = paddingX ? `calc(100% - ${paddingX * 2}px)` : "100%";
						return {
							maxWidth: maxWidth,
							width,
							left: `calc(50% - (min(${maxWidth}px, ${width}) / 2))`,
						};
					},
					mw: (value) => {
						const [maxWidth, paddingX] = value
							.split(",")
							.map((v) => parseInt(v));
						const width = paddingX ? `calc(100% - ${paddingX * 2}px)` : "100%";
						return { maxWidth: maxWidth, width };
					},
				},
				{ values: sizes }
			);
		}),
		gradientMaskImage,
		typography,
		tailwindAnimate,
		require("tailwindcss-animate"),
	],
};

export default config;
