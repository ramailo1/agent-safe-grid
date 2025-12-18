import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'production-secret-key-change-me';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    tenantId: string;
  };
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // Cast to any to avoid "Property 'headers' does not exist" error in strict environments
  const authHeader = (req as any).headers ? (req as any).headers['authorization'] : (req as any).get('authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    (res as any).status(401).json({ error: 'Unauthorized: No token provided' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      (res as any).status(403).json({ error: 'Forbidden: Invalid token' });
      return;
    }
    
    (req as any).user = user;
    
    // Enforce Tenant Isolation automatically
    // All subsequent DB queries should use req.user.tenantId
    if (!(req as any).user?.tenantId) {
        (res as any).status(403).json({ error: 'Forbidden: No tenant context' });
        return;
    }

    next();
  });
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      (res as any).status(403).json({ error: 'Forbidden: Insufficient permissions' });
      return;
    }
    next();
  };
};
