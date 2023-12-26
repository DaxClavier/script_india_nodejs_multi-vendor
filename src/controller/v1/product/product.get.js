const { response, resMessage } = require("../../../helpers/common");
const { Product } = require("../../../models/product.model");
const { Vendor } = require("../../../models/vendor.model");
const makeMongoDbService = require("../../../services/mongoDbService")({
	model: Product,
});
const makeMongoDbServiceVendor = require("../../../services/mongoDbService")({
	model: Vendor,
});

// Retrieve and return all products from the database.
exports.findAll = async (req) => {
	try {
		let meta = {};
		const pageNumber = parseInt(req.query.pageNumber);
		const pageSize = 10;
		const skip = pageNumber === 1 ? 0 : parseInt((pageNumber - 1) * pageSize);
		const sortCriteria = { _id: -1 };
		const searchValue = req.query.search;
		let vendors = await makeMongoDbServiceVendor.getDocumentByQuery({
			status: { $ne: 'D'}
		});
		vendors = vendors.reduce((obj, item) => (obj[item._id] = item, obj) ,{});

		const matchCondition = { };
		if (searchValue && searchValue.trim() !== "") {
			matchCondition.$and = [
				{
					$or: [
						{ title: { $regex: searchValue, $options: "i" } },
						{ sub_title: { $regex: searchValue, $options: "i" } },
						{ author: { $regex: searchValue, $options: "i" } },
						{ description: { $regex: searchValue, $options: "i" } },
						{ category: { $regex: searchValue, $options: "i" } },
					],
				},
			];
		}

		let productsList, productCount;
		if(req.isVendor){
			if(!matchCondition.$and){
				matchCondition = { vendor: req.vendor._id, status: { $ne: "D" } }
			}else{
				matchCondition.$and.push({ vendor: req.vendor._id, status: { $ne: "D" } })
			}
			productsList =
				await makeMongoDbService.getDocumentByCustomAggregation([
					{ $match: matchCondition },
					{
						$project: {
							title: 1,
							subTitle: 1,
							author: 1,
							description: 1,
							price: 1,
							offer_price: 1,
							image: 1,
							category: 1,
							status: 1,
							isSoldOut: 1,
							vendor: 1,
							extraAttr: 1,
						},
					},
					{ $sort: sortCriteria },
					{ $skip: skip },
					{ $limit: pageSize },
				]);
			productCount = await makeMongoDbService.getCountDocumentByQuery(matchCondition);
		}else{
			if(!matchCondition.$and){
				matchCondition = { status: { $ne: "D" } }
			}else{
				matchCondition.$and.push({ status: { $ne: "D" } })
			}
			productsList =
				await makeMongoDbService.getDocumentByCustomAggregation([
					{ $match: matchCondition },
					{
						$project: {
							title: 1,
							subTitle: 1,
							author: 1,
							description: 1,
							price: 1,
							offer_price: 1,
							image: 1,
							category: 1,
							status: 1,
							vendor: 1,
							isSoldOut: 1,
							extraAttr: 1,
						},
					},
					{ $sort: sortCriteria },
					{ $skip: skip },
					{ $limit: pageSize },
				]);
			productCount = await makeMongoDbService.getCountDocumentByQuery(matchCondition);
		}

		productsList = productsList.map((product) => {
			let vendor = vendors[product.vendor];
			if (!vendor || vendor.status == "D") {
				vendor = {commission: 0};
			}
			return {
				...product,
				commission: ((product.price*vendor.commission)/100),
				finalPrice: product.price + ((product.price*vendor.commission)/100),
			}
		})
		meta = {
			pageNumber,
			pageSize,
			totalCount: productCount,
			prevPage: parseInt(pageNumber) === 1 ? false : true,
			nextPage:
				parseInt(productCount) / parseInt(pageSize) <= parseInt(pageNumber)
				? false
				: true,
			totalPages: Math.ceil(parseInt(productCount) / parseInt(pageSize)),
		};
		return response(false, null, resMessage.success, {
			result: productsList,
			meta 
		});
	} catch (error) {
		return response(true, null, error.message, error.stack);
	}
};

exports.findById = async (req) => {
	try {
		let isProduct;
		if (req.isVendor) {
			isProduct = await makeMongoDbService.getSingleDocumentByQuery({ 
				vendor: req.vendor._id, _id: req.query.product_id
			});
		} else {
			isProduct = await makeMongoDbService.getSingleDocumentById(
				req.query.product_id
			);
		}
		if (!isProduct || isProduct.status == "D") {
			return response(true, null, resMessage.notFound);
		}
		const vendor = await makeMongoDbServiceVendor.getDocumentById(isProduct.vendor);
		if (!vendor || vendor.status == "D") {
			return response(true, null, resMessage.vendorNotFound);
		}
		isProduct = {
			...isProduct._doc,
			commission: ((isProduct.price*vendor.commission)/100),
			finalPrice: isProduct.price + ((isProduct.price*vendor.commission)/100),
		}
		return response(false, null, resMessage.success, isProduct);
	} catch (error) {
		return response(true, null, error.message, error.stack);
	}
};
