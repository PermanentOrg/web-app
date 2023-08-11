import { PrConstantsService } from '@shared/services/pr-constants/pr-constants.service';
import { PrConstantsPipe } from './pr-constants.pipe';

const prConstants = new PrConstantsService();

describe('PrConstantsPipe', () => {
  it('create an instance', () => {
    const pipe = new PrConstantsPipe(prConstants);
    expect(pipe).toBeTruthy();
  });

  it('translates an existing string', () => {
    const pipe = new PrConstantsPipe(prConstants);
    const constantString = 'access.role.viewer';
    expect(pipe.transform(constantString)).toEqual('Viewer');
  });

  it('returns string unchanged if missing', () => {
    const pipe = new PrConstantsPipe(prConstants);
    const constantString = 'access.role.missing';
    expect(pipe.transform(constantString)).toEqual(constantString);
  });
});
