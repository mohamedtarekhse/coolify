import type { SessionUser, UserRole } from '@rigways/shared';

import { config } from '../../config.js';
import { signJwt } from '../../lib/jwt.js';
import { hashPassword, verifyPassword } from '../../lib/password.js';
import { findUserById, findUserByUsername, updateLastLoginAt } from './auth.repository.js';

const jwtLifetimeSeconds = 86400;

export function getAuthBootstrap() {
  return {
    enabled: Boolean(config.jwtSecret),
    message: 'Auth module scaffold is active with login/me/logout/hash contracts matching the legacy worker.',
  };
}

export async function login(username: string, password: string) {
  const user = await findUserByUsername(username.trim().toLowerCase());
  if (!user || !user.isActive) return null;

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return null;

  updateLastLoginAt(user.id).catch(() => {});

  const sessionUser = toSessionUser({
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role as UserRole,
    clientId: user.clientId,
  });

  const token = signJwt(
    {
      sub: sessionUser.id,
      username: sessionUser.username,
      name: sessionUser.name,
      role: sessionUser.role,
      customerId: sessionUser.customerId,
    },
    config.jwtSecret,
    jwtLifetimeSeconds,
  );

  return {
    token,
    expiresIn: jwtLifetimeSeconds,
    user: sessionUser,
  };
}

export async function getMe(userId: string) {
  const user = await findUserById(userId);
  if (!user || !user.isActive) return null;

  return {
    id: user.id,
    username: user.username,
    role: user.role as UserRole,
    name: user.name,
    customerId: user.clientId,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  };
}

export async function createPasswordHash(password: string) {
  return hashPassword(password);
}

function toSessionUser(input: {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  clientId: string | null;
}): SessionUser {
  return {
    id: input.id,
    username: input.username,
    name: input.name,
    role: input.role,
    customerId: input.clientId,
  };
}
