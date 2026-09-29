import { Request, Response, NextFunction } from 'express';

/**
 * Express Middleware to enforce Role-Based Access Control (RBAC) on API endpoints
 */
export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Extract role and status from incoming authorization headers or query parameters
    const userRole = (req.headers['x-user-role'] as string || req.body?.user?.role || req.query?.role as string || 'farmer').toLowerCase().trim();
    const userStatus = (req.headers['x-user-status'] as string || req.body?.user?.status || req.query?.status as string || 'active').toLowerCase().trim();

    // Standardize role strings
    let normalizedRole = 'farmer';
    if (userRole === 'government' || userRole === 'admin' || userRole === 'authority' || userRole === 'govt') {
      normalizedRole = 'government';
    } else if (userRole === 'vet' || userRole === 'veterinarian' || userRole === 'doctor') {
      normalizedRole = 'vet';
    }

    // Standardize allowed roles list
    const normalizedAllowed = allowedRoles.map(r => r.toLowerCase().trim());

    const isRoleAllowed = normalizedAllowed.includes(normalizedRole) || 
      (normalizedAllowed.includes('government') && (normalizedRole === 'government' || userRole === 'admin'));

    if (!isRoleAllowed) {
      res.status(403).json({
        status: 'error',
        message: `Access denied. Your active role (${normalizedRole.toUpperCase()}) is not authorized to perform this operation.`,
        requiredRoles: allowedRoles,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // If accessing government endpoints, enforce government account approval status
    if (normalizedRole === 'government' || normalizedAllowed.includes('government')) {
      const isApproved = userStatus === 'approved' || userStatus === 'active';
      if (!isApproved) {
        res.status(403).json({
          status: 'error',
          message: 'Your government account is awaiting authorization.',
          statusReason: 'government_pending',
          timestamp: new Date().toISOString(),
        });
        return;
      }
    }

    next();
  };
};
