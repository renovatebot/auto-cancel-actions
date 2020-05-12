import { getName } from './utils';
import { isbranchAllowed } from '../src/filter';

describe(getName(__filename), () => {
  describe('isbranchAllowed', () => {
    it('works', () => {
      const patterns = ['!master'];

      expect(isbranchAllowed('master', patterns)).toBe(false);
      expect(isbranchAllowed('devel', patterns)).toBe(true);
      expect(isbranchAllowed('renovate/test', patterns)).toBe(true);
    });

    it('renovate only', () => {
      const patterns = ['master', 'renovate/**'];

      expect(isbranchAllowed('master', patterns)).toBe(true);
      expect(isbranchAllowed('devel', patterns)).toBe(false);
      expect(isbranchAllowed('renovate/some-branch', patterns)).toBe(true);
    });
  });
});
