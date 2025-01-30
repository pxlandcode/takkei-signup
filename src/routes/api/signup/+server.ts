import { query } from '$lib/db';
import { addMonths, format, setDate } from 'date-fns';

export async function POST({ request }) {
	try {
		const data = await request.json();
		const {
			firstname,
			lastname,
			email,
			personnummer,
			phone,
			streetAddress,
			zip,
			city,
			paymentChoice,
			payerName,
			payerEmail,
			payerPhone,
			payerOrganizationNumber,
			payerInvoiceAddress,
			payerInvoiceZip,
			payerInvoiceCity,
			selectedTrainingPackage,
			selectedPaymentMethod,
			installmentsCount
		} = data;

		// 1. Create customer (payer)
		const customerResult = await query(
			`
			INSERT INTO customers (name, invoice_address, invoice_zip, invoice_city, organization_number, email, phone)
			VALUES ($1, $2, $3, $4, $5, $6, $7)
			RETURNING id
		`,
			[
				payerName,
				payerInvoiceAddress || streetAddress,
				payerInvoiceZip || zip,
				payerInvoiceCity || city,
				payerOrganizationNumber || null,
				payerEmail,
				payerPhone
			]
		);
		const customerId = customerResult[0].id;

		// 2. Create the client
		const clientResult = await query(
			`
			INSERT INTO clients (customer_id, firstname, lastname, email, phone, person_number, active)
			VALUES ($1, $2, $3, $4, $5, $6, true)
			RETURNING id
		`,
			[customerId, firstname, lastname, email, phone, personnummer]
		);
		const clientId = clientResult[0].id;

		// 3. Link client & customer
		await query(
			`
			INSERT INTO client_customer_relationships (customer_id, client_id, relationship, active)
			VALUES ($1, $2, $3, true)
		`,
			[customerId, clientId, paymentChoice === 'self' ? 'self' : 'payer']
		);

		// 4. Assign the training package (if provided)
		let packageId = null;
		if (selectedTrainingPackage) {
			const articleResult = await query(
				`SELECT id, price FROM articles WHERE name = $1 AND active = true`,
				[selectedTrainingPackage]
			);

			if (articleResult.length > 0) {
				const articleId = articleResult[0].id;
				const totalPrice = articleResult[0].price;

				// Determine first payment date: 27th of next month
				const firstPaymentDate = format(setDate(addMonths(new Date(), 1), 27), 'yyyy-MM-dd');

				// Generate installments
				const installmentAmount = totalPrice / installmentsCount;
				const installments: string[] = [];
				const installmentsPerDate: Record<string, any> = {};

				for (let i = 0; i < installmentsCount; i++) {
					const paymentDate = format(setDate(addMonths(new Date(), i + 1), 27), 'yyyy-MM-dd');
					installments.push(paymentDate);
					installmentsPerDate[paymentDate] = {
						date: paymentDate,
						sum: parseFloat(installmentAmount.toFixed(2)),
						invoice_no: ''
					};
				}

				// Insert package with installments
				const packageResult = await query(
					`
					INSERT INTO packages (customer_id, article_id, client_id, paid_price, first_payment_date, autogiro, payment_installments, payment_installments_per_date)
					VALUES ($1, $2, $3, $4, $5, true, $6, $7)
					RETURNING id
				`,
					[
						customerId,
						articleId,
						clientId,
						totalPrice,
						firstPaymentDate,
						`{${installments.join(',')}}`,
						JSON.stringify(installmentsPerDate)
					]
				);
				packageId = packageResult[0].id;
			}
		}

		// 5. Return success response
		return new Response(
			JSON.stringify({
				message: 'Signup successful',
				clientId,
				customerId,
				packageId,
				trainingPackage: selectedTrainingPackage || null
			}),
			{ status: 201 }
		);
	} catch (err) {
		console.error('Signup Error:', err);
		return new Response(JSON.stringify({ error: 'Could not sign up client' }), { status: 500 });
	}
}
