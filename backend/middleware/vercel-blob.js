const path = require('path');
const multer = require('multer');
const fs = require('fs');

// pastikan folder uploads ada
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
}

class LocalStorage {
	constructor(options) {
		this.options = options || {};
	}

	_handleFile(req, file, cb) {
		const hash = Date.now();
		const ext = path.extname(file.originalname);
		const prefix = this.options.prefix || 'uploads';
		const filename = hash + ext;

		const finalPath = path.join(uploadDir, filename);

		const chunks = [];
		file.stream.on('data', (chunk) => chunks.push(chunk));
		file.stream.on('end', () => {
			try {
				const buffer = Buffer.concat(chunks);

				fs.writeFileSync(finalPath, buffer);

				cb(null, {
					path: `/${prefix}/${filename}`,
					filename: filename,
					size: buffer.length,
				});
			} catch (error) {
				cb(error);
			}
		});
		file.stream.on('error', cb);
	}

	_removeFile(req, file, cb) {
		try {
			const filePath = path.join(uploadDir, file.filename);
			if (fs.existsSync(filePath)) {
				fs.unlinkSync(filePath);
			}
			cb(null);
		} catch (err) {
			cb(err);
		}
	}
}

const storage = new LocalStorage({
	prefix: 'uploads',
});

const upload = multer({
	storage,
	limits: { fileSize: 2 * 1024 * 1024 },
	fileFilter: (req, file, cb) => {
		if (file.mimetype.startsWith('image/')) cb(null, true);
		else cb(new Error('Only image files are allowed!'), false);
	},
});

module.exports = {
	upload,
};