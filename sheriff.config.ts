import { SheriffConfig } from '@softarc/sheriff-core';

export const config: SheriffConfig = {
  enableBarrelLess: true,
  modules: {
    // FSD layers — frontend
    'frontend/web/src/app/pages/landing': ['layer:page', 'page:landing'],
    'frontend/web/src/app/pages/landing/home': ['layer:page', 'page:landing'],
    'frontend/web/src/app/pages/customer': ['layer:page', 'page:customer'],
    'frontend/web/src/app/pages/supplier': ['layer:page', 'page:supplier'],
    'frontend/web/src/app/pages/admin': ['layer:page', 'page:admin'],
    'frontend/web/src/app/widgets': ['layer:widget'],
    'frontend/web/src/app/features': ['layer:feature'],
    'frontend/web/src/app/schemas': ['layer:schemas'],
    'frontend/web/src/app/shared': ['layer:shared-local'],
    'frontend/web/src/app/store': ['layer:store'],
    'frontend/web/src/app/ui': ['layer:ui'],

    // Shared contracts (types, schemas, endpoints)
    'packages/shared-contracts': ['type:shared'],

    // Microservices
    'microservices/api-gateway': ['layer:gateway'],
    'microservices/products-service': ['layer:service'],
    'microservices/auth-service': ['layer:service'],
  },
  depRules: {
    root: [
      'layer:page',
      'layer:widget',
      'layer:feature',
      'layer:schemas',
      'layer:shared-local',
      'layer:store',
      'layer:ui',
      'type:shared',
      'noTag',
    ],
    noTag: ['noTag', 'type:shared'],

    // FSD: each layer can only import lower layers (top → bottom)
    'layer:page': [
      'layer:page',
      'layer:widget',
      'layer:feature',
      'layer:schemas',
      'layer:shared-local',
      'layer:store',
      'layer:ui',
      'type:shared',
    ],
    'layer:widget': [
      'layer:feature',
      'layer:schemas',
      'layer:shared-local',
      'layer:store',
      'layer:ui',
      'type:shared',
    ],
    'layer:feature': [
      'layer:feature',
      'layer:schemas',
      'layer:shared-local',
      'layer:store',
      'layer:ui',
      'type:shared',
    ],
    'layer:shared-local': ['layer:store', 'type:shared'],

    // Schemas layer — frontend-only Zod schemas
    'layer:schemas': ['type:shared'],

    // Store layer — global state, depends on shared
    'layer:store': ['layer:shared-local', 'type:shared'],

    // UI layer — only depends on shared contracts
    'layer:ui': ['type:shared'],

    // Shared packages don't depend on frontend layers
    'type:shared': 'type:shared',

    // Microservices
    'layer:gateway': ['layer:service', 'type:shared'],
    'layer:service': 'type:shared',
  },
};
