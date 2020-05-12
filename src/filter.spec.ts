import { getName } from '../test/utils';
import { isbranchAllowed } from './filter';

describe(getName(__filename), () => {
  describe('isbranchAllowed', () => {
    it('not master', () => {
      const patterns = ['!master'];

      expect(isbranchAllowed('master', patterns)).toBe(false);
      expect(isbranchAllowed('devel', patterns)).toBe(true);
      expect(isbranchAllowed('renovate/test', patterns)).toBe(true);
    });

    it('only some', () => {
      const patterns = ['master', 'renovate/**'];

      expect(isbranchAllowed('master', patterns)).toBe(true);
      expect(isbranchAllowed('renovate/some-branch', patterns)).toBe(true);

      expect(isbranchAllowed('devel', patterns)).toBe(false);
      expect(isbranchAllowed('test/master', patterns)).toBe(false);
    });
  });
});
