import { calculateDecay } from '../decay';

describe('calculateDecay', () => {
  it('無衰退（0小時）', () => {
    const now = new Date();
    const result = calculateDecay(now);
    expect(result).toEqual({ hp: 0, stamina: 0, appetite: 0, bodySize: 0 });
  });

  it('2小時衰退', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 3600000);
    const result = calculateDecay(twoHoursAgo);
    expect(result.hp).toBe(2);
    expect(result.stamina).toBe(1);
    expect(result.appetite).toBe(0);
    expect(result.bodySize).toBe(0);
  });

  it('4小時衰退（累計2+3）', () => {
    const fourHoursAgo = new Date(Date.now() - 4 * 3600000);
    const result = calculateDecay(fourHoursAgo);
    expect(result.hp).toBe(5); // 2 + 3
    expect(result.stamina).toBe(3); // 1 + 2
    expect(result.appetite).toBe(2);
    expect(result.bodySize).toBe(0);
  });

  it('8小時衰退（累計）', () => {
    const eightHoursAgo = new Date(Date.now() - 8 * 3600000);
    const result = calculateDecay(eightHoursAgo);
    expect(result.hp).toBe(10); // 2 + 3 + 5
    expect(result.stamina).toBe(6); // 1 + 2 + 3
    expect(result.appetite).toBe(5); // 2 + 3
    expect(result.bodySize).toBe(1);
  });

  it('12小時衰退（再多+8）', () => {
    const twelveHoursAgo = new Date(Date.now() - 12 * 3600000);
    const result = calculateDecay(twelveHoursAgo);
    expect(result.hp).toBe(18); // 2 + 3 + 5 + 8
    expect(result.stamina).toBe(6); // 1 + 2 + 3
    expect(result.appetite).toBe(5); // 2 + 3
    expect(result.bodySize).toBe(1);
  });

  it('1.5小時無衰退', () => {
    const oneAndHalfHoursAgo = new Date(Date.now() - 1.5 * 3600000);
    const result = calculateDecay(oneAndHalfHoursAgo);
    expect(result).toEqual({ hp: 0, stamina: 0, appetite: 0, bodySize: 0 });
  });

  it('6小時衰退（累計2+3）', () => {
    const sixHoursAgo = new Date(Date.now() - 6 * 3600000);
    const result = calculateDecay(sixHoursAgo);
    expect(result.hp).toBe(5); // 2 + 3
    expect(result.stamina).toBe(3); // 1 + 2
    expect(result.appetite).toBe(2);
    expect(result.bodySize).toBe(0);
  });

  it('24小時衰退（全部累計）', () => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 3600000);
    const result = calculateDecay(twentyFourHoursAgo);
    expect(result.hp).toBe(18); // 2 + 3 + 5 + 8
    expect(result.stamina).toBe(6); // 1 + 2 + 3
    expect(result.appetite).toBe(5); // 2 + 3
    expect(result.bodySize).toBe(1);
  });
});
