let dbModule;

if (process.env.NODE_ENV === 'development') {
	dbModule = await import('./db.dev.js');
} else {
	dbModule = await import('./db.prod.js');
}

export const { query } = dbModule;
