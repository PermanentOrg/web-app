/* @format */
import { RecordVO } from '@models';
import { GetAltTextPipe } from './get-alt-text.pipe';

describe('GetAltTextPipe', () => {
  let pipe: GetAltTextPipe;

  beforeEach(() => {
    pipe = new GetAltTextPipe();
  });
  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('returns the alt text', () => {
    const value = new RecordVO({});
    value.altText = 'alt text';
    value.displayName = 'display name';
    const result = pipe.transform(value);

    expect(result).toEqual('alt text');
  });

  it('returns the display name', () => {
    const value = new RecordVO({});
    value.displayName = 'display name';
    const result = pipe.transform(value);

    expect(result).toEqual('display name');
  });
});
