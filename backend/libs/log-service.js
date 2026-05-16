const { Log } = require('../models');
const { ROLES } = require('./constant');

const LOGGED_ROLES = new Set([ROLES.ADMIN, ROLES.SUPERADMIN]);

class LogService {
	static async createLog(
		action,
		userId = null,
		resourceType = null,
		resourceId = null,
		message = null,
		metadata = null,
		req = null
	) {
		try {
			if (req && req.user) {
				const role = req.user.role;
				if (!LOGGED_ROLES.has(role)) {
					return;
				}
			} else if (!userId) {
				return;
			}

			await Log.create({
				action,
				user_id: userId,
				resource_type: resourceType,
				resource_id: resourceId,
				message,
				metadata,
				ip_address: req ? (req.ip || null) : null,
				user_agent: req ? (req.get('User-Agent') || null) : null,
			});
		} catch (error) {
			console.error('Failed to create log entry:', error);
		}
	}
}

module.exports = LogService;