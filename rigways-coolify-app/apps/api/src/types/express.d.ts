import type { SessionUser } from '@rigways/shared';

declare global {
  namespace Express {
    interface Request {
      sessionUser?: SessionUser;
    }
  }
}

export {};
