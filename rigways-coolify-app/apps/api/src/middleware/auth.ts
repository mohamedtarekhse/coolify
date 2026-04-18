import type { NextFunction, Request, Response } from 'express';

import type { SessionUser, UserRole } from '@rigways/shared';

import { config } from '../config.js';
import { verifyJwt } from '../lib/jwt.js';

type TokenClaims = {
  sub: string;
  username: string;
  name: string;
  role: UserRole;
  customerId: string | null;
};

export function requireSession(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized', code: 'UNAUTH' });
  }

  try {
    const claims = verifyJwt<TokenClaims>(auth.slice(7), config.jwtSecret);
    req.sessionUser = {
      id: claims.sub,
      username: claims.username,
      name: claims.name,
      role: claims.role,
      customerId: claims.customerId,
    };
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Unauthorized', code: 'UNAUTH' });
  }
}

export function requireRole(roles: UserRole[]) {
  return function roleGuard(req: Request, res: Response, next: NextFunction) {
    if (!req.sessionUser || !roles.includes(req.sessionUser.role)) {
      return res.status(403).json({ success: false, error: 'Forbidden', code: 'FORBIDDEN' });
    }
    next();
  };
}
