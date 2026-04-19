export const userRoles = ['admin', 'manager', 'technician', 'user'] as const;
export type UserRole = (typeof userRoles)[number];

export const clientStatuses = ['active', 'inactive', 'suspended'] as const;
export type ClientStatus = (typeof clientStatuses)[number];

export const functionalLocationTypes = ['Rig', 'Workshop', 'Yard', 'Warehouse', 'Other'] as const;
export type FunctionalLocationType = (typeof functionalLocationTypes)[number];

export const assetTypes = [
  'Hoisting Equipment',
  'Drilling Equipment',
  'Mud System Low Pressure',
  'Mud System High Pressure',
  'Wirelines',
  'Structure',
  'Well Control',
  'Tubular',
] as const;
export type AssetType = (typeof assetTypes)[number];

export const assetStatuses = ['operation', 'stacked'] as const;
export type AssetStatus = (typeof assetStatuses)[number];

export const certificateTypes = ['CAT III', 'CAT IV', 'ORIGINAL COC', 'LOAD TEST', 'LIFTING', 'NDT', 'TUBULAR'] as const;
export type CertificateType = (typeof certificateTypes)[number];

export const approvalStatuses = ['pending', 'approved', 'rejected'] as const;
export type ApprovalStatus = (typeof approvalStatuses)[number];

export const jobStatuses = ['active', 'technician_done', 'closed', 'reopened'] as const;
export type JobStatus = (typeof jobStatuses)[number];

export type SessionUser = {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  customerId: string | null;
};
