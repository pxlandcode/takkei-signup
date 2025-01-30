<script lang="ts">
	export let label: string = '';
	export let name: string = '';
	export let type: string = 'text';
	export let placeholder: string = '';

	export let value: string = '';
</script>

<div class="mb-4 w-full">
	{#if label}
		<label for={name} class="mb-1 block text-sm font-medium">
			{label}
		</label>
	{/if}

	<input
		id={name}
		{name}
		{type}
		class="
			w-full
			rounded
			border
			border-transparent
			bg-white
			px-3
			py-2
			text-black
			transition-colors
			duration-150
			focus:border-gray
			focus:text-black
            focus:outline-none
		"
		{placeholder}
		bind:value
	/>
</div>
