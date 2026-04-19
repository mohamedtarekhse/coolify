import { countAssets, countCertificates, countClients, countInspectors, listExpiringCertificates } from './reports.repository.js';

export async function getSummary(customerId: string | null, restricted: boolean) {
  const baseWhere = restricted && customerId ? { clientId: customerId } : {};
  const today = new Date();
  const soon = new Date(Date.now() + 30 * 86400000);

  const [
    totalAssets, operationAssets, stackedAssets,
    totalCerts, validCerts, expiringSoon, expiredCerts, pendingCerts,
    totalClients, activeClients,
    totalInspectors,
  ] = await Promise.all([
    countAssets(baseWhere),
    countAssets({ ...baseWhere, status: 'operation' }),
    countAssets({ ...baseWhere, status: 'stacked' }),
    countCertificates(baseWhere),
    countCertificates({ ...baseWhere, approvalStatus: 'approved', expiryDate: { gt: soon } }),
    countCertificates({ ...baseWhere, approvalStatus: 'approved', expiryDate: { gte: today, lte: soon } }),
    countCertificates({ ...baseWhere, approvalStatus: 'approved', expiryDate: { lt: today } }),
    countCertificates({ ...baseWhere, approvalStatus: 'pending' }),
    countClients({}),
    countClients({ status: 'active' }),
    countInspectors({}),
  ]);

  return {
    assets: {
      total: totalAssets,
      operation: operationAssets,
      stacked: stackedAssets,
      active: operationAssets,
      maintenance: stackedAssets,
      inactive: 0,
    },
    certificates: {
      total: totalCerts,
      valid: validCerts,
      expiring: expiringSoon,
      expired: expiredCerts,
      pending: pendingCerts,
    },
    clients: { total: totalClients, active: activeClients },
    inspectors: { total: totalInspectors },
  };
}

export async function getExpiring(days: number, customerId: string | null, restricted: boolean) {
  const today = new Date();
  const cutoff = new Date(Date.now() + days * 86400000);
  const where = {
    approvalStatus: 'approved',
    expiryDate: { gte: today, lte: cutoff },
    ...(restricted && customerId ? { clientId: customerId } : {}),
  };

  return {
    certificates: await listExpiringCertificates(where, 200),
    days,
  };
}
