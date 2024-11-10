import { CapitalizeFirstLettersPipe } from './capitalize-first-letters.pipe';

describe('CapitalizeFirstLettersPipe', () => {
  it('create an instance', () => {
    const pipe = new CapitalizeFirstLettersPipe();
    expect(pipe).toBeTruthy();
  });
});
