const base = require('axios');

const biteship = base.create({
	baseURL: process.env.BITESHIP_API_URL,
	// Cegah request menggantung tanpa batas. Penting untuk operasi confirm:
	// kombinasikan dengan idempotensi di sisi approve agar timeout tidak
	// berujung double-charge.
	timeout: Number(process.env.BITESHIP_TIMEOUT_MS) || 20000,
	headers: {
		'Content-Type': 'application/json',
		authorization: process.env.BITESHIP_API_KEY,
	},
});

module.exports = biteship;
