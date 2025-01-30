import { query } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	try {
		// Fetch active training packages, excluding those starting with 'MF'
		const packages = await query(`
			SELECT id, name, price, sessions, validity_start_date, validity_end_date
			FROM articles
			WHERE active = true
			AND name NOT LIKE 'MF%' 
			ORDER BY name ASC
		`);

		return { packages };
	} catch (err) {
		console.error('Error fetching training packages:', err);
		return { packages: [] }; // Return empty array if error occurs
	}
};
