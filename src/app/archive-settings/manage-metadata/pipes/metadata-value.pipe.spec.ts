import { MetadataValuePipe } from './metadata-value.pipe';

describe('MetadataValuePipe', () => {
  let pipe: MetadataValuePipe;
  beforeEach(() => {
    pipe = new MetadataValuePipe();
  });
  it('can create an instance', () => {
    expect(pipe).toBeTruthy();
  });
  it('gets custom metadata value', () => {
    expect(pipe.transform('a:1')).toBe('1');
  });
  describe('weird cases', () => {
    it('no : separator', () => {
      expect(pipe.transform('potato')).toBe('potato');
    });
    it('multiple : separators', () => {
      expect(pipe.transform('a:b:c')).toBe('b:c');
    });
    it('empty string', () => {
      expect(pipe.transform('')).toBe('');
    });
  });
});
