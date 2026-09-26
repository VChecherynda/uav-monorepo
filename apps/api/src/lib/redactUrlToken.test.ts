import { describe, it, expect } from 'vitest';
import { redactUrlToken } from './redactUrlToken.js';

describe('redactUrlToken', () => {
  it('redacts token', () => {
    expect(redactUrlToken('/ws/drones?token=eyJ')).toBe(
      '/ws/drones?token=redacted',
    );
  });

  it('redacts token and keeps other search params', () => {
    expect(redactUrlToken('/ws/drones?token=eyJ&foo=1')).toBe(
      '/ws/drones?token=redacted&foo=1',
    );
  });

  it('returns url unchanged without token', () => {
    expect(redactUrlToken('/health')).toBe('/health');
  });
});
