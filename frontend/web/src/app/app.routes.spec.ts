import { Routes } from '@angular/router';
import { describe, it, expect } from 'vitest';
import { routes } from './app.routes';

// ─── Helpers ───

const flattenRoutes = (routeList: Routes, prefix = ''): string[] => {
  const result: string[] = [];
  for (const route of routeList) {
    const path = prefix + (route.path ?? '');
    result.push(path);
    if (route.children) {
      result.push(...flattenRoutes(route.children, path ? `${path}/` : ''));
    }
  }
  return result;
};

// ─── Route structure tests ───

describe('App Routes — structure', () => {
  it('should contain all expected route paths', () => {
    const paths = flattenRoutes(routes);
    expect(paths).toContain('');
    expect(paths).toContain('login');
    expect(paths).toContain('register');
    expect(paths).toContain('customer');
    expect(paths).toContain('supplier');
    expect(paths).toContain('admin');
  });
});
