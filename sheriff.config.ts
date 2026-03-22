import { SheriffConfig } from '@softarc/sheriff-core';

export const config: SheriffConfig = {
  enableBarrelLess: true,
  modules: {
    // FSD layers — frontend
    'frontend/web/src/app/pages/landing': ['layer:page', 'page:landing'],
    'frontend/web/src/app/pages/customer': ['layer:page', 'page:customer'],
    'frontend/web/src/app/pages/supplier': ['layer:page', 'page:supplier'],
    'frontend/web/src/app/pages/admin': ['layer:page', 'page:admin'],
    'frontend/web/src/app/widgets': ['layer:widget'],
    'frontend/web/src/app/features': ['layer:feature'],
    'frontend/web/src/app/entities': ['layer:entity'],
    'frontend/web/src/app/shared': ['layer:shared-local'],

    // Shared packages
    'packages/shared-contracts': ['type:shared'],
    'packages/shared-logic': ['type:shared'],
    'packages/shared-ui': ['type:shared-ui'],

    // Microservices
    'microservices/api-gateway': ['layer:gateway'],
    'microservices/products-service': ['layer:service'],
    'microservices/auth-service': ['layer:service'],
  },
  depRules: {
    root: ['layer:page', 'layer:widget', 'layer:feature', 'layer:entity', 'layer:shared-local', 'type:shared', 'type:shared-ui', 'noTag'],
    noTag: ['noTag', 'type:shared'],

    // FSD: each layer can only import lower layers (top → bottom)
    'layer:page': ['layer:widget', 'layer:feature', 'layer:entity', 'layer:shared-local', 'type:shared', 'type:shared-ui'],
    'layer:widget': ['layer:feature', 'layer:entity', 'layer:shared-local', 'type:shared', 'type:shared-ui'],
    'layer:feature': ['layer:entity', 'layer:shared-local', 'type:shared', 'type:shared-ui'],
    'layer:entity': ['layer:shared-local', 'type:shared', 'type:shared-ui'],
    'layer:shared-local': ['type:shared', 'type:shared-ui'],

    // Shared packages don't depend on frontend layers
    'type:shared': 'type:shared',
    'type:shared-ui': ['type:shared', 'type:shared-ui'],

    // Microservices
    'layer:gateway': ['layer:service', 'type:shared'],
    'layer:service': 'type:shared',
  },
};
