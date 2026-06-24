import clsx from 'clsx';
import confetti from 'canvas-confetti';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs) => {
	return twMerge(clsx(inputs));
};

export const currency = (value) => {
	return new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: 'IDR',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value);
};

export const animate = () => {
	const duration = 5 * 1000;
	const end = Date.now() + duration;
	const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

	const range = (min, max) => Math.random() * (max - min) + min;

	const interval = window.setInterval(() => {
		const remaining = end - Date.now();

		if (remaining <= 0) return clearInterval(interval);
		const count = 50 * (remaining / duration);

		confetti({
			...defaults,
			particleCount: count,
			origin: { x: range(0.1, 0.3), y: Math.random() - 0.2 },
		});

		confetti({
			...defaults,
			particleCount: count,
			origin: { x: range(0.7, 0.9), y: Math.random() - 0.2 },
		});
	}, 250);
};

export const assetUrl = (path) => {
	if (!path) return '';
	if (/^https?:\/\//i.test(path)) return path;
	const base = (import.meta.env.VITE_BASE_URL || '')
		.replace(/\/+$/, '')
		.replace(/\/api$/, '');
	return `${base}/${String(path).replace(/^\/+/, '')}`;
};

export const formatByte = (size) => {
	return Intl.NumberFormat('en', {
		notation: 'compact',
		style: 'unit',
		unit: 'byte',
		unitDisplay: 'narrow',
	}).format(size);
};

export const formatDate = (raw) => {
	const date = new Date(raw);
	return new Intl.DateTimeFormat('id-ID', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	}).format(date);
};

export const colorHash = (text) => {
	let hash = 0;
	for (let i = 0; i < text.length; i++) {
		hash = text.charCodeAt(i) + ((hash << 5) - hash);
	}

	const hue = Math.abs(hash) % 360;
	const saturation = 55;
	const lightness = 80;

	const h = hue / 360;
	const s = saturation / 100;
	const l = lightness / 100;

	let r, g, b;

	if (s === 0) {
		r = g = b = l;
	} else {
		const hue2rgb = (p, q, t) => {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		};

		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;

		r = hue2rgb(p, q, h + 1 / 3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1 / 3);
	}

	const toHex = (x) => {
		const hex = Math.round(x * 255).toString(16);
		return hex.padStart(2, '0');
	};

	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};
