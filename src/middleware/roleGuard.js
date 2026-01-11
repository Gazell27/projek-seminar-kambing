export const roleGuard = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Akses ditolak. Anda tidak memiliki izin untuk mengakses resource ini.'
            });
        }

        next();
    };
};

export const adminOnly = roleGuard('admin');
export const kasirOnly = roleGuard('kasir');
export const adminOrKasir = roleGuard('admin', 'kasir');

export default { roleGuard, adminOnly, kasirOnly, adminOrKasir };
