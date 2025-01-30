<script lang="ts">
	import Checkbox from '../components/checkbox/Checkbox.svelte';
	import Dropdown from '../components/dropdown/Dropdown.svelte';
	import InfoButton from '../components/infoButton/InfoButton.svelte';
	import Input from '../components/Input/Input.svelte';
	import { onMount, tick } from 'svelte';
	import OptionButton from '../components/optionButton/OptionButton.svelte';

	export let data;

	let firstname = '';
	let lastname = '';
	let email = '';
	let personnummer = '';
	let phone = '';
	let streetAddress = '';
	let zip = '';
	let city = '';

	let agreeToTerms = false;
	let agreeToPrivacy = false;

	let selectedTrainingPackage = '';
	let selectedPaymentMethod = '';

	let isOtherPaymentAddress = false;
	let payerName = '';
	let payerEmail = '';
	let payerPhone = '';
	let payerOrganizationNumber = '';
	let payerInvoiceAddress = '';
	let payerInvoiceZip = '';
	let payerInvoiceCity = '';

	let trainingPackages = [];
	let trainingPackageOptions = [];
	let paymentInstallmentOptions = [{ value: 1, label: '1 delbetalning' }];
	let selectedInstallment = paymentInstallmentOptions[0];

	// Fetch training packages
	onMount(async () => {
		try {
			const res = await fetch('/api/training-packages');
			const fetchedData = await res.json();

			trainingPackages = fetchedData.packages.map((pkg) => {
				const sessionCount = extractSessionCount(pkg.name);
				return {
					id: pkg.id,
					name: pkg.name.trim(),
					price: pkg.price,
					sessionCount
				};
			});

			trainingPackageOptions = trainingPackages.map(
				(pkg) => `${pkg.name} - ${formatPrice(pkg.price)} kr`
			);
		} catch (error) {
			console.error('Error fetching training packages:', error);
		}
	});

	async function handleSubmit() {
		const payload = {
			firstname,
			lastname,
			email,
			personnummer,
			phone,
			streetAddress,
			zip,
			city,
			agreeToTerms,
			agreeToPrivacy,
			selectedTrainingPackage,
			selectedPaymentMethod,
			paymentChoice: isOtherPaymentAddress ? 'company' : 'self',
			payerName: isOtherPaymentAddress ? payerName : `${firstname} ${lastname}`,
			payerEmail: isOtherPaymentAddress ? payerEmail : email,
			payerPhone: isOtherPaymentAddress ? payerPhone : phone,
			payerOrganizationNumber: isOtherPaymentAddress ? payerOrganizationNumber : '',
			payerInvoiceAddress: isOtherPaymentAddress ? payerInvoiceAddress : streetAddress,
			payerInvoiceZip: isOtherPaymentAddress ? payerInvoiceZip : zip,
			payerInvoiceCity: isOtherPaymentAddress ? payerInvoiceCity : city
		};

		const res = await fetch('/api/signup', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});

		const responseData = await res.json();
		console.log(responseData);
	}

	function formatPrice(price: number) {
		return new Intl.NumberFormat('sv-SE').format(Math.round(price));
	}

	function handlePaymentChoiceChange(value: boolean) {
		isOtherPaymentAddress = value;
	}

	async function handleTrainingPackageChange(event) {
		selectedTrainingPackage = event.detail.value; // ✅ Update selected training package first
		await tick(); // ✅ Wait for UI update before updating installments
		updateInstallmentOptions();
	}

	function extractSessionCount(name) {
		const match = name.match(/(\d+)/);
		return match ? parseInt(match[1]) : 1; // Default to 1 if no number is found
	}

	function getPricePerSession(pkg) {
		const sessionCountMatch = pkg.name.match(/(\d+)/);
		const sessionCount = sessionCountMatch ? parseInt(sessionCountMatch[1]) : 1;

		const pricePerSession = pkg.price / sessionCount;

		return pricePerSession;
	}

	function updateInstallmentOptions() {
		if (!selectedTrainingPackage) return;

		// Extract only the package name (remove price formatting)
		const extractedName = selectedTrainingPackage.split(' - ')[0];

		// Find the corresponding package object
		console.log(extractedName);
		console.log(trainingPackages);
		const selectedPackage = trainingPackages.find(
			(pkg) => pkg.name.trim() === extractedName.trim()
		);
		console.log(selectedPackage);
		if (!selectedPackage) return;

		const sessionCount = selectedPackage.sessionCount;
		console.log(sessionCount);
		console.log(selectedPackage);
		let options = [{ value: 1, label: '1 st' }];

		if (sessionCount >= 12) options.push({ value: 3, label: '3 st' });
		if (sessionCount >= 24) options.push({ value: 6, label: '6 st' });
		if (sessionCount >= 48) options.push({ value: 12, label: '12 st' });

		paymentInstallmentOptions = options;
		selectedInstallment = options[0];
	}
</script>

<form class="mx-auto max-w-md" on:submit|preventDefault={handleSubmit}>
	<div class="flex flex-col gap-2 pb-2">
		<p class="text-sm">Fyll i dina uppgifter och välj paket</p>
		<h2 class="pt-4 text-xl font-semibold">Personuppgifter</h2>
	</div>

	<div class="flex flex-row gap-2">
		<Input label="Förnamn" name="firstname" bind:value={firstname} placeholder="Förnamn" />
		<Input label="Efternamn" name="lastname" bind:value={lastname} placeholder="Efternamn" />
	</div>
	<Input label="E-post" name="email" type="email" bind:value={email} placeholder="info@takkei.se" />

	<div class="flex flex-row gap-2">
		<Input
			label="Personnummer"
			name="personnummer"
			bind:value={personnummer}
			placeholder="xxxxxx-xxxx (10 siffror)"
		/>
		<Input label="Mobilnummer" name="phone" bind:value={phone} placeholder="07xxxxxxxx" />
	</div>

	<Input
		label="Gatuadress"
		name="streetAddress"
		bind:value={streetAddress}
		placeholder="Garvargatan 7"
	/>
	<div class="flex space-x-2">
		<Input label="Postnummer" name="zip" bind:value={zip} placeholder="112 21" />
		<Input label="Ort" name="city" bind:value={city} placeholder="Stockholm" />
	</div>

	<h2 class="pb-2 pt-4 text-xl font-semibold">Träningspaket &amp; Betalningsalternativ</h2>
	<div class="flex flex-col gap-2">
		<h3>Prislista 2025</h3>
		<ul>
			{#each data.packages as pkg}
				<li>
					{pkg.name} - {formatPrice(pkg.price)}kr
					<span class="text-gray-500">
						= {formatPrice(getPricePerSession(pkg))}kr/träningstillfälle</span
					>
				</li>
			{/each}
		</ul>
	</div>
	<div class="flex flex-row items-center gap-2 pt-4">
		<Dropdown
			id="training-package"
			label="Träningspaket"
			bind:selectedValue={selectedTrainingPackage}
			options={data.packages.map((pkg) => `${pkg.name} - ${formatPrice(pkg.price)}kr`)}
			on:change={handleTrainingPackageChange}
		/>
		<div class="mt-7">
			<InfoButton
				info="Ett träningspaket fungerar som ett klippkort, skulle du betala allt på en gång så finns träningarna tillgodo tills de nyttjas. Alternativt delbetala månadsvis utifrån ett förutbestämt antal delbetalningar."
			/>
		</div>
	</div>

	<h3 class="pt-4">Betalningsalternativ</h3>

	<div class="flex flex-col gap-4">
		{#if paymentInstallmentOptions.length > 1}
			<p class="pt-4">Välj antal delbetalningar</p>
			<OptionButton
				options={paymentInstallmentOptions}
				bind:selectedOption={selectedInstallment}
				on:select={(event) =>
					(selectedInstallment = paymentInstallmentOptions.find(
						(opt) => opt.value === event.detail
					))}
			/>
		{/if}
		<div class="flex flex-row gap-4 py-4">
			<Checkbox
				id="self-pay"
				label="Annan faktureringsadress"
				name="payment-choice"
				checked={isOtherPaymentAddress}
				on:change={(e) => handlePaymentChoiceChange(e.detail.checked)}
			/>
			<InfoButton info="Välj om fakturan ska betalas av ett företag eller någon annan än dig." />
		</div>
	</div>

	{#if isOtherPaymentAddress}
		<h2 class="text-xl font-semibold">Betalare</h2>
		<Input
			label="Företagsnamn/Namn"
			name="payerName"
			bind:value={payerName}
			placeholder="Takkei Trainingsystems AB"
		/>
		<Input label="E-post" name="payerEmail" bind:value={payerEmail} placeholder="info@takkei.se" />
		<div class="flex flex-row gap-2">
			<Input
				label="Organisationsnummer"
				name="payerOrganizationNumber"
				bind:value={payerOrganizationNumber}
				placeholder="xxxxxx-xxxx"
			/>
			<Input
				label="Telefonnummer"
				name="payerPhone"
				bind:value={payerPhone}
				placeholder="08xxxxxx"
			/>
		</div>

		<Input
			label="Fakturaadress"
			name="payerInvoiceAddress"
			bind:value={payerInvoiceAddress}
			placeholder="Garvargatan 7"
		/>
		<div class="flex space-x-2">
			<Input label="Postnummer" name="zip" bind:value={payerInvoiceZip} placeholder="112 21" />
			<Input label="Ort" name="city" bind:value={payerInvoiceCity} placeholder="Stockholm" />
		</div>
	{/if}

	<button
		type="submit"
		class="w-full rounded bg-orange-500 px-4 py-2 text-white hover:bg-orange-600">Skicka in</button
	>
</form>

<style>
</style>
