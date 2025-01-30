<script lang="ts">
	import Checkbox from '../components/checkbox/Checkbox.svelte';
	import Dropdown from '../components/dropdown/Dropdown.svelte';
	import InfoButton from '../components/infoButton/InfoButton.svelte';
	import Input from '../components/Input/Input.svelte';
	import { onMount, tick } from 'svelte';
	import OptionButton from '../components/optionButton/OptionButton.svelte';
	import Button from '../components/button/Button.svelte';
	import PopupWrapper from '../components/ui/popupWrapper/PopupWrapper.svelte';

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
	}

	function formatPrice(price: number) {
		return new Intl.NumberFormat('sv-SE').format(Math.round(price));
	}

	function handlePaymentChoiceChange(value: boolean) {
		isOtherPaymentAddress = value;
	}
	function handleTermsAcceptanceChange(value: boolean) {
		agreeToTerms = value;
	}

	function handlePersonalDataAcceptanceChange(value: boolean) {
		agreeToPrivacy = value;
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

		const selectedPackage = trainingPackages.find(
			(pkg) => pkg.name.trim() === extractedName.trim()
		);

		if (!selectedPackage) return;

		const sessionCount = selectedPackage.sessionCount;

		let options = [{ value: 1, label: '1 st' }];

		if (sessionCount >= 12) options.push({ value: 3, label: '3 st' });
		if (sessionCount >= 24) options.push({ value: 6, label: '6 st' });
		if (sessionCount >= 48) options.push({ value: 12, label: '12 st' });

		paymentInstallmentOptions = options;
		selectedInstallment = options[0];
	}

	let isPopupOpen = false;
	let popupHeader = '';
	let popupContent = '';
	let popupIcon = 'CircleInfo';

	const agreePrivayContent = `
<div class="p-6 bg-white text-black rounded-lg  max-w-3xl mx-auto overflow-y-scroll">
    <h2 class="text-2xl font-bold text-black mb-4">Hantering av Personuppgifter</h2>

    <h3 class="text-lg font-semibold text-black mt-6 mb-2">För att kunna identifiera dig som kund och betalare hanteras följande:</h3>
    <ul class="list-disc list-inside space-y-1 text-gray-700">
        <li>Namn</li>
        <li>Adress</li>
        <li>Personnummer</li>
        <li>Bild</li>
        <li>Grupptillhörighet</li>
        <li>Medlemskap</li>
    </ul>

    <h3 class="text-lg font-semibold text-black mt-6 mb-2">Beroende på betalningsmetod hanteras följande:</h3>
    <ul class="list-disc list-inside space-y-1 text-gray-700">
        <li>Kortuppgifter</li>
        <li>Bankkontouppgifter</li>
        <li>Personnummer</li>
        <li>Faktura-uppgifter (namn och adress)</li>
        <li>E-post</li>
    </ul>

    <h3 class="text-lg font-semibold text-black mt-6 mb-2">För att vi ska kunna kontakta dig och låta dig logga in hanteras följande:</h3>
    <ul class="list-disc list-inside space-y-1 text-gray-700">
        <li>E-post</li>
        <li>Telefonnummer</li>
        <li>Grupptillhörigheter</li>
    </ul>

    <h3 class="text-lg font-semibold text-black mt-6 mb-2">För statistik hanteras följande:</h3>
    <ul class="list-disc list-inside space-y-1 text-gray-700">
        <li>Pass- och aktivitetshistorik</li>
        <li>Incheckningshistorik</li>
        <li>Kön</li>
        <li>Köphistorik</li>
        <li>Medlemskapshistorik</li>
    </ul>

    <h3 class="text-lg font-semibold text-black mt-6 mb-2">För bokföringssyfte hanterar vi:</h3>
    <ul class="list-disc list-inside space-y-1 text-gray-700">
        <li>Köphistorik</li>
        <li>Missade betalningar</li>
    </ul>

    <h3 class="text-lg font-semibold text-black mt-6 mb-2">Hur länge sparas mina uppgifter?</h3>
    <p class="text-gray-700">
        Vi sparar dina uppgifter så länge du är kund och medlem hos oss. Därefter rensas dina uppgifter automatiskt inom 1 år.
        Din betalningshistorik sparas enligt bokföringslagen.
    </p>

    <h3 class="text-lg font-semibold text-black mt-6 mb-2">Vilka rättigheter har jag?</h3>
    <p class="text-gray-700">
        Som kund hos oss har du vissa rättigheter gällande behandlingen av dina personuppgifter:
    </p>

    <ul class="list-disc list-inside space-y-2 text-gray-700 mt-2">
        <li><strong>Rätt till tillgång</strong> – Du kan begära ut ett utdrag av all data vi sparat om dig.</li>
        <li><strong>Rätt till rättelse</strong> – Du har rätt att korrigera felaktiga uppgifter.</li>
        <li><strong>Rätt till radering</strong> – Du kan begära att all din data raderas (om inget aktivt avtal finns).</li>
        <li><strong>Rätt till begränsning</strong> – Du kan kräva att vi begränsar hur vi behandlar dina uppgifter.</li>
        <li><strong>Rätt att göra invändningar</strong> – Du kan neka att dina uppgifter används för direktmarknadsföring.</li>
        <li><strong>Rätt till dataportabilitet</strong> – Du kan få en kopia av din data i ett strukturerat format.</li>
        <li><strong>Rätt att framföra klagan</strong> – Om du anser att vi hanterar dina uppgifter felaktigt kan du kontakta oss eller lämna in ett klagomål till tillsynsmyndigheten.</li>
    </ul>
</div>

`;

	const agreeTermsContent = `
	<div class="p-6 bg-white text-black rounded-lg  max-w-3xl mx-auto overflow-y-scroll">
    <h2 class="text-2xl font-bold text-black mb-4">1. Allmänt</h2>
    <p class="mb-4">
        1.1. Dessa allmänna villkor gäller för avtal om träning på <strong>Takkei Trainingsystems AB</strong>
        <span class="font-semibold">(”Bolaget”)</span> och mellan den person
        <span class="font-semibold">(”Kunden”)</span> som är namngiven i köpeavtalet, till vilket villkoren utgör en integrerad del.
        Avtalet är personligt och kan inte överlåtas på annan person.
    </p>
    <p class="mb-4">
        Avtalet inkluderar deltagande i Bolagets utbud under schema/öppettider. Samtliga träningspaket/klippkort ligger digitalt i appen och på kundens profil.
        <strong>Inga fysiska medlemskort/klippkort distribueras.</strong>
    </p>

    <h2 class="text-2xl font-bold text-black mt-6 mb-4">2. Distansavtalslagen & Återbetalning</h2>
    <p class="mb-4">
        2.1. Takkei Trainingsystems AB följer distansavtalslagen vid köp via vår hemsida. Under förutsättning att tjänsten/träningen inte har påbörjats eller aktiverats har kunden rätt att inom
        <span class="font-semibold">14 dagar</span> ångra sitt köp och få full återbetalning.
    </p>
    <p class="mb-4">
        2.2. Om kunden utnyttjar sin ångerrätt betalas det erlagda beloppet tillbaka inom
        <span class="font-semibold">30 dagar</span> från dagen då vi tog emot varan eller tjänsten.
    </p>
    <p class="mb-4">
        2.3. Se även Konsumentverket och distansavtalslagen, samt EU:s tvistlösningssida:
        <a href="http://ec.europa.eu/odr" class="text-blue-500 underline">http://ec.europa.eu/odr</a>.
    </p>

    <h2 class="text-2xl font-bold text-black mt-6 mb-4">3. Kundens Ansvar</h2>
    <ul class="list-disc list-inside space-y-2 text-gray-700">
        <li>Kunden förbinder sig att följa anvisningar från Takkeis personal.</li>
        <li>Inte uppträda störande för andra personer i träningscentret.</li>
        <li>Vid sjukdom av- eller omboka bokad träning.</li>
        <li>Ansvara för eventuella medföljande barns säkerhet.</li>
    </ul>
    <p class="mt-4">
        <span class="font-semibold">3.2.</span> Avbokning ska ske via e-post eller sms senast kl 12.00 dagen före bokad träning.
    </p>

    <h2 class="text-2xl font-bold text-black mt-6 mb-4">4. Takkeis Ansvar</h2>
    <p class="mb-4">
        4.1. Bolaget ska i uppenbara fall avråda Kunden från träning eller träningsmoment som kan innebära skada.
    </p>
    <p class="mb-4">
        4.2. Bolaget ansvarar ej för hinder i träningsmöjligheter orsakade av yttre omständigheter, såsom brand eller myndighetsbeslut.
    </p>

    <h2 class="text-2xl font-bold text-black mt-6 mb-4">5. Avgifter & Betalning</h2>
    <p class="mb-4">
        5.1. Kunden ska erlägga träningsavgifter enligt Bolagets prislista. Betalning kan ske via kort, faktura eller autogiro.
    </p>
    <p class="mb-4">
        5.2. Tillgodohavanden måste användas inom
        <span class="font-semibold">24 månader</span>, annars betraktas de som förbrukade.
    </p>

    <h2 class="text-2xl font-bold text-black mt-6 mb-4">6. Frysning av Träningspaket</h2>
    <p class="mb-4">
        6.1. Vid sjukdom, skada, graviditet eller militärtjänst kan träningspaketet frysas med giltigt intyg.
    </p>
    <ul class="list-disc list-inside space-y-2 text-gray-700">
        <li><strong>Sjukdom/skada:</strong> Läkarintyg krävs.</li>
        <li><strong>Graviditet:</strong> Inget intyg krävs.</li>
        <li><strong>Arbete på annan ort:</strong> Intyg från arbetsgivare krävs.</li>
    </ul>

    <h2 class="text-2xl font-bold text-black mt-6 mb-4">7. Upphörande av Avtalet</h2>
    <p class="mb-4">
        7.1. Kunden kan säga upp avtalet med
        <span class="font-semibold">en månads varsel</span>. Uppsägning skickas till
        <a href="mailto:ekonomi@takkei.se" class="text-blue-500 underline">ekonomi@takkei.se</a>.
    </p>

    <h2 class="text-2xl font-bold text-black mt-6 mb-4">8. Återbetalning under Vissa Omständigheter</h2>
    <p class="mb-4">
        8.1. Kunden kan få återbetalning om träning inte längre kan genomföras på grund av sjukdom eller av andra dokumenterade skäl.
    </p>

    <h2 class="text-2xl font-bold text-black mt-6 mb-4">9. Ändring av Villkor</h2>
    <p class="mb-4">
        9.1. Bolaget har rätt att ändra dessa villkor och ska meddela Kunden om sådana ändringar.
    </p>

    <h2 class="text-2xl font-bold text-black mt-6 mb-4">10. Meddelanden</h2>
    <p class="mb-4">
        10.1. Bolaget skickar information och meddelanden via e-post.
    </p>

    <h2 class="text-2xl font-bold text-black mt-6 mb-4">11. Praktiska Ändringar</h2>
    <p class="mb-4">
        11.1. Bolaget förbehåller sig rätten att ändra scheman och öppettider vid behov.
    </p>

    <h2 class="text-2xl font-bold text-black mt-6 mb-4">12. Personuppgifter</h2>
    <p class="mb-4">
        12.1. Kundens uppgifter lagras enligt GDPR och används endast för att administrera träningssystemet.
    </p>

    <h2 class="text-2xl font-bold text-black mt-6 mb-4">13. Medgivande</h2>
    <p class="mb-4">
        13.1. Kunden godkänner att uttag får göras från konto/kort för betalning.
    </p>

    <h2 class="text-2xl font-bold text-black mt-6 mb-4">14. Annan Betalare</h2>
    <p class="mb-4">
        14.1. Om annan person eller företag avbryter betalning är kunden fortsatt ansvarig för avgifterna.
    </p>

    <h2 class="text-2xl font-bold text-black mt-6 mb-4">15. Cookies</h2>
    <p class="mb-4">
        15.1. Denna webbplats använder cookies för att förbättra användarupplevelsen.
    </p>
</div>
	`;

	function openPopup(header: string, content: string) {
		popupHeader = header;
		popupContent = content;
		isPopupOpen = true;
	}

	function closePopup() {
		isPopupOpen = false;
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

	<div class="flex flex-col gap-4 pb-4">
		<h3 class="pt-4 text-xl font-semibold">Godkännande av vilkor</h3>

		<Checkbox
			id="accept-terms"
			label="Jag godkänner villkoren"
			name="accept-terms"
			checked={agreeToTerms}
			on:change={(e) => handleTermsAcceptanceChange(e.detail.checked)}
		/>
		<Checkbox
			id="accept-handling-of-personal-data"
			label="Jag godkänner hanteringen av mina personuppgifter"
			name="accept-handling-of-personal-data"
			checked={agreeToPrivacy}
			on:change={(e) => handlePersonalDataAcceptanceChange(e.detail.checked)}
		/>

		<div class="flex flex-row gap-4">
			<Button onClick={() => openPopup('Villkor', agreeTermsContent)}>Läs villkoren</Button>
			<Button onClick={() => openPopup('Hantering av personuppgifter', agreePrivayContent)}
				>Läs hur vi hanterar dina personupptifter</Button
			>
		</div>
	</div>

	<button
		type="submit"
		class="w-full rounded bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
		>Skaffa medlemskap!</button
	>
</form>

{#if isPopupOpen}
	<PopupWrapper width="600px" icon={popupIcon} header={popupHeader} on:close={closePopup}>
		{@html popupContent}
	</PopupWrapper>
{/if}

<style lang="scss">
</style>
