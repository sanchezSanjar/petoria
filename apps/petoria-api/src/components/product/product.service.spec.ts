import { BadRequestException } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductGender, ProductLocation, ProductSpecies, ProductType } from '../../libs/enums/product.enum';
import { Message } from '../../libs/enums/common.enum';
import { ProductInput, ProductsInquiry } from '../../libs/dto/product/product.input';
import { ProductUpdate } from '../../libs/dto/product/product.update';

// uuid ships ESM only; libs/config imports it but these tests never call it.
jest.mock('uuid', () => ({ v4: () => 'test-uuid' }));

const chain = (value: unknown) => ({
	select: () => chain(value),
	lean: () => chain(value),
	exec: () => Promise.resolve(value),
	catch: () => Promise.resolve(value),
});

describe('ProductService', () => {
	let productModel: Record<string, jest.Mock>;
	let memberService: { memberStatsEditor: jest.Mock };
	let service: ProductService;

	const baseInput: ProductInput = {
		productType: ProductType.FOOD,
		productSpecies: ProductSpecies.CAT,
		productLocation: ProductLocation.SEOUL,
		productTitle: 'Cat food',
		productPrice: 10000,
		productImages: ['uploads/product/a.jpg'],
		memberId: 'member-1' as never,
	};

	beforeEach(() => {
		productModel = {
			create: jest.fn().mockResolvedValue({ memberId: 'member-1' }),
			findOne: jest.fn(),
			findOneAndUpdate: jest.fn().mockReturnValue({ exec: () => chain({ memberId: 'member-1' }) }),
			aggregate: jest.fn().mockReturnValue(chain([{ list: [], metaCounter: [] }])),
		};
		memberService = { memberStatsEditor: jest.fn() };
		service = new ProductService(productModel as never, memberService as never, {} as never, {} as never);
	});

	describe('createProduct', () => {
		it('rejects a PET without productGender', async () => {
			await expect(service.createProduct({ ...baseInput, productType: ProductType.PET })).rejects.toThrow(
				new BadRequestException(Message.PET_GENDER_REQUIRED),
			);
			expect(productModel.create).not.toHaveBeenCalled();
		});

		it('creates a PET with productGender and increments memberProducts', async () => {
			await service.createProduct({
				...baseInput,
				productType: ProductType.PET,
				productSpecies: ProductSpecies.DOG,
				productGender: ProductGender.MALE,
			});
			expect(productModel.create).toHaveBeenCalled();
			expect(memberService.memberStatsEditor).toHaveBeenCalledWith({
				_id: 'member-1',
				targetKey: 'memberProducts',
				modifier: 1,
			});
		});

		it('creates a non-PET product without productGender', async () => {
			await service.createProduct(baseInput);
			expect(productModel.create).toHaveBeenCalledWith(baseInput);
		});
	});

	describe('updateProduct', () => {
		const update: ProductUpdate = { _id: 'product-1' as never, productType: ProductType.PET };

		it('rejects switching to PET when no gender is stored or sent', async () => {
			productModel.findOne.mockReturnValue(chain({}));
			await expect(service.updateProduct('member-1' as never, { ...update })).rejects.toThrow(
				Message.PET_GENDER_REQUIRED,
			);
			expect(productModel.findOneAndUpdate).not.toHaveBeenCalled();
		});

		it('allows switching to PET when a gender is already stored', async () => {
			productModel.findOne.mockReturnValue(chain({ productGender: ProductGender.FEMALE }));
			await service.updateProduct('member-1' as never, { ...update });
			expect(productModel.findOneAndUpdate).toHaveBeenCalled();
		});
	});

	describe('getProducts', () => {
		it('filters by type, species and gender', async () => {
			const input: ProductsInquiry = {
				page: 1,
				limit: 10,
				search: {
					typeList: [ProductType.PET],
					speciesList: [ProductSpecies.DOG],
					genderList: [ProductGender.MALE],
				},
			};
			await service.getProducts(null as never, input);

			const pipeline = productModel.aggregate.mock.calls[0][0] as Array<Record<string, unknown>>;
			expect(pipeline[0].$match).toEqual({
				productStatus: 'ACTIVE',
				productType: { $in: [ProductType.PET] },
				productSpecies: { $in: [ProductSpecies.DOG] },
				productGender: { $in: [ProductGender.MALE] },
			});
		});
	});
});
