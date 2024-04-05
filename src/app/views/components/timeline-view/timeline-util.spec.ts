/* @format */
import * as Util from './timeline-util';

describe('Timeline Utilities', () => {
  describe('DateType To Number', () => {
    it('will pass number values through', () => {
      expect(Util.dateTypeToNumber(0)).toBe(0);
      expect(Util.dateTypeToNumber(Math.PI)).toBe(Math.PI);
      expect(Util.dateTypeToNumber(NaN)).toBeNaN();
    });

    it('will convert dates to number values', () => {
      expect(Util.dateTypeToNumber(new Date(0))).toBe(0);
      expect(Util.dateTypeToNumber(new Date(123456789))).toBe(123456789);
    });

    it('will convert strings to number values', () => {
      expect(Util.dateTypeToNumber('0')).toBe(0);
      expect(Util.dateTypeToNumber(Math.PI.toString())).toBe(Math.PI);
    });
  });
});
