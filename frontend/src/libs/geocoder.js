const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const EMAIL = import.meta.env.VITE_NOMINATIM_EMAIL || '';
const APP_ID = 'rumah-literasi/1.0';
const MIN_INTERVAL_MS = 1100;
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const CACHE_PREFIX = 'geocode:v1:';

let lastRequestAt = 0;
let queue = Promise.resolve();
const memCache = new Map();

const normalizeQuery = (q) =>
	String(q || '')
		.toLowerCase()
		.replace(/[^\w\s,.-]/g, '')
		.replace(/\s+/g, ' ')
		.trim();

const cacheKey = (kind, payload) => CACHE_PREFIX + kind + ':' + payload;

const readCache = (key) => {
	if (memCache.has(key)) return memCache.get(key);
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (Date.now() - parsed.t > CACHE_TTL_MS) {
			localStorage.removeItem(key);
			return null;
		}
		memCache.set(key, parsed.v);
		return parsed.v;
	} catch {
		return null;
	}
};

const writeCache = (key, value) => {
	memCache.set(key, value);
	try {
		localStorage.setItem(key, JSON.stringify({ t: Date.now(), v: value }));
	} catch {
		// localStorage full / disabled, fail silently
	}
};

const throttledFetch = (url) => {
	queue = queue.then(async () => {
		const wait = Math.max(0, lastRequestAt + MIN_INTERVAL_MS - Date.now());
		if (wait > 0) await new Promise((r) => setTimeout(r, wait));
		lastRequestAt = Date.now();
		const res = await fetch(url, {
			headers: { 'Accept-Language': 'id', 'X-App-Id': APP_ID },
		});
		if (!res.ok) throw new Error('Nominatim HTTP ' + res.status);
		return res.json();
	});
	return queue;
};

export const geocodeAddress = async (query) => {
	const norm = normalizeQuery(query);
	if (!norm) return null;
	const key = cacheKey('fwd', norm);
	const cached = readCache(key);
	if (cached !== null) return cached;

	const params = new URLSearchParams({
		q: query,
		countrycodes: 'id',
		format: 'json',
		limit: '1',
		addressdetails: '1',
	});
	if (EMAIL) params.set('email', EMAIL);

	try {
		const data = await throttledFetch(`${NOMINATIM_BASE}/search?${params}`);
		if (Array.isArray(data) && data.length > 0) {
			const result = {
				latitude: parseFloat(data[0].lat),
				longitude: parseFloat(data[0].lon),
				display_name: data[0].display_name,
				address: data[0].address || {},
			};
			writeCache(key, result);
			return result;
		}
		writeCache(key, null);
		return null;
	} catch {
		return null;
	}
};

export const reverseGeocode = async (lat, lng) => {
	if (lat == null || lng == null) return null;
	const roundedLat = Number(lat).toFixed(5);
	const roundedLng = Number(lng).toFixed(5);
	const key = cacheKey('rev', `${roundedLat},${roundedLng}`);
	const cached = readCache(key);
	if (cached !== null) return cached;

	const params = new URLSearchParams({
		lat: String(lat),
		lon: String(lng),
		format: 'json',
		'accept-language': 'id',
		addressdetails: '1',
		zoom: '18',
	});
	if (EMAIL) params.set('email', EMAIL);

	try {
		const data = await throttledFetch(`${NOMINATIM_BASE}/reverse?${params}`);
		if (!data || data.error) {
			writeCache(key, null);
			return null;
		}
		const result = {
			display_name: data.display_name || '',
			address: data.address || {},
		};
		writeCache(key, result);
		return result;
	} catch {
		return null;
	}
};

export const haversineKm = (lat1, lng1, lat2, lng2) => {
	if ([lat1, lng1, lat2, lng2].some((v) => v == null || Number.isNaN(v))) {
		return null;
	}
	const R = 6371;
	const toRad = (d) => (d * Math.PI) / 180;
	const dLat = toRad(lat2 - lat1);
	const dLng = toRad(lng2 - lng1);
	const a =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
	return 2 * R * Math.asin(Math.sqrt(a));
};
