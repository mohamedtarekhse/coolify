import { prisma } from '@rigways/db';

import { createNotification, sendPushToRoles, sendPushToUser } from './notifications.js';

export async function processExpiryChecks() {
  const today = isoDate(new Date());
  const in7d = isoDate(addDays(7));
  const in30d = isoDate(addDays(30));

  const [expired, critical, warning] = await Promise.all([
    prisma.certificate.findMany({
      where: {
        approvalStatus: 'approved',
        expiryDate: { lt: new Date(today) },
      },
      select: {
        id: true,
        name: true,
        certNumber: true,
        expiryDate: true,
        uploadedById: true,
        clientId: true,
      },
      take: 500,
      orderBy: { expiryDate: 'asc' },
    }),
    prisma.certificate.findMany({
      where: {
        approvalStatus: 'approved',
        expiryDate: { gte: new Date(today), lte: new Date(in7d) },
      },
      select: {
        id: true,
        name: true,
        certNumber: true,
        expiryDate: true,
        uploadedById: true,
        clientId: true,
      },
      take: 500,
    }),
    prisma.certificate.findMany({
      where: {
        approvalStatus: 'approved',
        expiryDate: { gt: new Date(in7d), lte: new Date(in30d) },
      },
      select: {
        id: true,
        name: true,
        certNumber: true,
        expiryDate: true,
        uploadedById: true,
        clientId: true,
      },
      take: 500,
    }),
  ]);

  let pushesSent = 0;

  if (expired.length) {
    const payload = {
      title: `Expired Certificates`,
      body: `${expired.length} certificate${expired.length !== 1 ? 's are' : ' is'} expired.`,
      url: '/notifications.html',
      tag: 'cert-expired',
    };
    await sendPushToRoles(['admin', 'manager'], payload);
    pushesSent++;

    for (const cert of expired) {
      if (!cert.uploadedById) continue;
      await createNotification(
        cert.uploadedById,
        'cert_expired',
        'Certificate Expired',
        `${cert.name || cert.certNumber} has expired.`,
        'certificate',
        cert.id,
      );
      await sendPushToUser(cert.uploadedById, {
        title: 'Certificate Expired',
        body: `${cert.name || cert.certNumber} has expired.`,
        url: '/certificates.html',
        tag: `cert-expired-${cert.id}`,
      });
      pushesSent++;
    }
  }

  if (critical.length) {
    const payload = {
      title: `Certificates Expiring Within 7 Days`,
      body: `${critical.length} certificate${critical.length !== 1 ? 's are' : ' is'} expiring within 7 days.`,
      url: '/notifications.html',
      tag: 'cert-expiring-critical',
    };
    await sendPushToRoles(['admin', 'manager'], payload);
    pushesSent++;

    for (const cert of critical) {
      if (!cert.uploadedById) continue;
      await createNotification(
        cert.uploadedById,
        'cert_expiring_critical',
        'Certificate Expiring Soon',
        `${cert.name || cert.certNumber} expires on ${isoDate(cert.expiryDate)}.`,
        'certificate',
        cert.id,
      );
      await sendPushToUser(cert.uploadedById, {
        title: 'Certificate Expiring Soon',
        body: `${cert.name || cert.certNumber} expires on ${isoDate(cert.expiryDate)}.`,
        url: '/certificates.html',
        tag: `cert-critical-${cert.id}`,
      });
      pushesSent++;
    }
  }

  if (warning.length && new Date().getUTCDay() === 1) {
    const payload = {
      title: `Certificates Expiring Within 30 Days`,
      body: `${warning.length} certificate${warning.length !== 1 ? 's are' : ' is'} expiring within 30 days.`,
      url: '/notifications.html',
      tag: 'cert-expiring-warning',
    };
    await sendPushToRoles(['admin', 'manager'], payload);
    pushesSent++;
  }

  return {
    checked: true,
    expired: expired.length,
    critical: critical.length,
    warning: warning.length,
    pushesSent,
  };
}

function addDays(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date;
}

function isoDate(date: Date) {
  return new Date(date).toISOString().split('T')[0];
}
