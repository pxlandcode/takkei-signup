import { query } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	try {
		const packages = await query(`
			SELECT id, name, price, price * 1.06 AS price_with_vat, sessions, validity_start_date, validity_end_date
            FROM articles
            WHERE active = true
            AND (name LIKE '12%' OR name LIKE '24%' OR name LIKE '48%')
            ORDER BY name ASC;
		`);

		return { packages };
	} catch (err) {
		console.error('Error fetching training packages:', err);
		return { packages: [] }; // Return empty array if error occurs
	}
};
