<script lang="ts">
	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import { user } from '$lib/stores/userStore';
	import SlideShow from '../components/slideshow/SlideShow.svelte';
	import '../app.css';

	export let data;

	// Example slides:
	let slides = [
		{
			image: '/images/neck.png',
			lines: ['En timme i veckan', 'Hela kroppen', 'Repetera']
		},
		{
			image: '/images/sand-wall.png',
			lines: ['Något annat budskap', 'Fler rader här', '…']
		},
		{
			image: '/images/leaves.png',
			lines: ['Tredje bildens text', '…', '…']
		}
	];

	function goToTakkeiWebsite() {
		window.open('https://www.takkeitraining.se', '_blank');
	}

	$user = data.user;
</script>

<ParaglideJS {i18n}>
	<main class="flex h-screen bg-black">
		<!-- LEFT SIDE: slideshow background & top bar -->
		<div
			class="mm:block relative m-5 hidden max-w-4xl flex-1 gap-5 overflow-hidden rounded-xl bg-black text-white"
		>
			<!-- top bar -->
			<div class="absolute z-10 flex w-full items-center justify-between p-4 md:p-6">
				<img src="/images/takkei-logo.png" alt="Takkei Logo" class="h-12 md:h-20" />
				<button
					class="rounded-full bg-gray/40 px-3 py-2 text-sm hover:bg-gray/60"
					on:click={goToTakkeiWebsite}
				>
					Till vår hemsida →
				</button>
			</div>

			<!-- slideshow itself -->
			<SlideShow {slides} intervalTime={10000} />
		</div>

		<!-- RIGHT SIDE: slot for child pages (e.g. sign-up form) -->
		<div class="mx-auto w-full overflow-y-auto p-6 text-white md:w-[35rem]">
			<slot />
		</div>
	</main>
</ParaglideJS>
