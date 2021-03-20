import { getName } from '../test/utils';
import { isbranchAllowed } from './filter';

describe(getName(__filename), () => {
  describe('isbranchAllowed', () => {
    it('not main', () => {
      const patterns = ['!main'];

      expect(isbranchAllowed('main', patterns)).toBe(false);
      expect(isbranchAllowed('devel', patterns)).toBe(true);
      expect(isbranchAllowed('renovate/test', patterns)).toBe(true);
    });

    it('only some', () => {
      const patterns = ['main', 'renovate/**'];

      expect(isbranchAllowed('main', patterns)).toBe(true);
      expect(isbranchAllowed('renovate/some-branch', patterns)).toBe(true);

      expect(isbranchAllowed('devel', patterns)).toBe(false);
      expect(isbranchAllowed('test/main', patterns)).toBe(false);
    });
  });
});
