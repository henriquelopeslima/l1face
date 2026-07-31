// src/shared/hooks/useTodayDateMax.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useTodayDateMax } from './useTodayDateMax';

describe('useTodayDateMax', () => {
  beforeEach(() => {
    // Mock Date.now para 2026-07-31
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-31T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('deve retornar data de hoje no formato YYYY-MM-DD', () => {
    const result = useTodayDateMax();
    expect(result).toBe('2026-07-31');
  });

  it('deve retornar com zero-padding correto para dias e meses menores que 10', () => {
    vi.setSystemTime(new Date('2026-01-05T12:00:00Z'));
    const result = useTodayDateMax();
    expect(result).toBe('2026-01-05');
  });
});
