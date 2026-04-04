export const config = {
  ports: {
    frontend: 4200,
    iorderMain: 3000,
  },
  hosts: {
    frontend: 'localhost',
    iorderMain: 'localhost',
  },
  apiPrefix: '/api',
} as const;
