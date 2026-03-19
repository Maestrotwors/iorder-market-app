import { SheriffConfig } from '@softarc/sheriff-core';

export const config: SheriffConfig = {
  enableBarrelLess: true,
  modules: {
    'frontend/web/src/app/pages/customer': ['domain:customer', 'type:feature'],
    'frontend/web/src/app/pages/supplier': ['domain:supplier', 'type:feature'],
    'frontend/web/src/app/pages/admin': ['domain:admin', 'type:feature'],
    'packages/shared-contracts': ['type:shared'],
    'packages/shared-logic': ['type:shared'],
    'packages/shared-ui': ['type:shared-ui'],
    'microservices/api-gateway': ['layer:gateway'],
    'microservices/products-service': ['layer:service'],
  },
  depRules: {
    root: ['type:feature', 'type:shared', 'type:shared-ui', 'noTag'],
    noTag: ['noTag', 'type:shared'],

    // Each domain can only depend on itself and shared packages
    'domain:*': ['domain:$*', 'type:shared', 'type:shared-ui'],

    // Shared packages don't depend on domains
    'type:shared': 'type:shared',
    'type:shared-ui': ['type:shared', 'type:shared-ui'],

    // Gateway can use services and shared, services only use shared
    'layer:gateway': ['layer:service', 'type:shared'],
    'layer:service': 'type:shared',
  },
};
