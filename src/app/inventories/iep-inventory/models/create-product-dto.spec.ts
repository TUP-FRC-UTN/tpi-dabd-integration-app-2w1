import { createProductDTO } from './create-product-dto';
import { CreateProductDtoClass } from './create-product-dto-class';
describe('createProductDTO', () => {
  it('should create an instance', () => {
    expect(new CreateProductDtoClass).toBeTruthy();
  });
});
