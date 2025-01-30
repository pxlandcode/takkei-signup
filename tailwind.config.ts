const black = '#000000';

const gray = '#BEC0C1';
const grayDark = '#494B50';
const grayMedium = '#9BA3AF';

module.exports = {
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		'./src/routes/**/*.{svelte,ts,js}',
		'./src/lib/**/*.{svelte,ts,js}'
	],
	theme: {
		extend: {
			fontFamily: {
				circular: ['Circular', 'Inter', 'san-serif']
			},
			colors: {
				black: {
					DEFAULT: black
				},
				gray: {
					DEFAULT: gray,
					dark: grayDark,
					medium: grayMedium
				}
			},
			screens: {
				xs: '320px',
				sm: '640px',
				md: '768px',
				mm: '970px',
				lg: '1024px',
				xl: '1280px',
				'2xl': '1536px'
			}
		}
	},
	plugins: []
};
