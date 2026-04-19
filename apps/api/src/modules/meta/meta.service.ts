import { userRoles, assetStatuses, certificateTypes } from '@rigways/shared';

export function getMetaPayload() {
  return {
    app: 'Rigways Coolify App',
    phase: 'foundation',
    stack: ['React', 'Node.js', 'TypeScript', 'MySQL', 'Tailwind CSS'],
    modules: ['auth', 'clients', 'functional-locations', 'inspectors', 'assets', 'certificates', 'jobs', 'notifications', 'reports'],
    referenceData: {
      userRoles,
      assetStatuses,
      certificateTypes,
    },
  };
}
