import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
	connectionString,
	ssl: { rejectUnauthorized: false }
});

export const query = async (text, params) => {
	const client = await pool.connect();
	try {
		const res = await client.query(text, params);
		return res.rows;
	} catch (err) {
		console.error('Database Query Error:', err);
		throw err;
	} finally {
		client.release();
	}
};

// ✅ Test DB Connection
(async () => {
	try {
		const res = await query('SELECT NOW()');
		console.log('✅ Connected to Database at:', res[0].now);
	} catch (err) {
		console.error('❌ Database Connection Failed:', err);
	}
})();
