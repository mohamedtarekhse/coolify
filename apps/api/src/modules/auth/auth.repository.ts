import { prisma } from '@rigways/db';

export async function findUserByUsername(username: string) {
  return prisma.user.findFirst({
    where: {
      username: {
        equals: username,
      },
    },
    include: {
      client: {
        select: {
          id: true,
        },
      },
    },
  });
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      client: {
        select: {
          id: true,
        },
      },
    },
  });
}

export async function updateLastLoginAt(id: string) {
  return prisma.user.update({
    where: { id },
    data: {
      lastLoginAt: new Date(),
    },
  });
}
