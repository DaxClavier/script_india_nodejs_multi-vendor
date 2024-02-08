const { response, resMessage } = require("../../../helpers/common");
const { User } = require("../../../models/user.model");
const { Vendor } = require("../../../models/vendor.model");
const { Order } = require("../../../models/order.model");
const { Product } = require("../../../models/product.model");
const makeMongoDbService = require("../../../services/mongoDbService")
const makeMongoDbServiceUser = makeMongoDbService({model: User});
const makeMongoDbServiceVendor = makeMongoDbService({model: Vendor});
const makeMongoDbServiceOrder = makeMongoDbService({model: Order});
const makeMongoDbServiceProduct = makeMongoDbService({model: Product});

// return all users count.
exports.user = async (req) => {
  try {
    if (req.isAdmin) {
      let userCount = await makeMongoDbServiceUser.getCountDocumentByQuery({status: { $ne: 'D'}});
      return response(false, null, resMessage.success, {
        count: userCount
      },200);
    }
    return response(true, null, resMessage.failed,[],403);
  } catch (error) {
    return response(true, null, error.message, error.stack,500);
  }
};

// return all vendors count.
exports.vendor = async (req) => {
  try {
    if (req.isAdmin) {
      let vendorCount = await makeMongoDbServiceVendor.getCountDocumentByQuery({status: { $ne: 'D'}});
      return response(false, null, resMessage.success, {
        count: vendorCount
      },200);
    }
    return response(true, null, resMessage.failed,[],403);
  } catch (error) {
    return response(true, null, error.message, error.stack,500);
  }
};

// return all orders count.
exports.order = async (req) => {
  try {
    if (req.isAdmin) {
      let orderCount = await makeMongoDbServiceOrder.getCountDocumentByQuery({status: { $ne: 'D'}});
      return response(false, null, resMessage.success, {
        count: orderCount
      },200);
    }
    return response(true, null, resMessage.failed,[],403);
  } catch (error) {
    return response(true, null, error.message, error.stack,500);
  }
};

// return all products count.
exports.product = async (req) => {
  try {
    if (req.isAdmin) {
      let productCount = await makeMongoDbServiceProduct.getCountDocumentByQuery({status: { $ne: 'D'}});
      return response(false, null, resMessage.success, {
        count: productCount
      },200);
    }
    return response(true, null, resMessage.failed,[],403);
  } catch (error) {
    return response(true, null, error.message, error.stack,500);
  }
};

// return all counts for admin.
exports.allCounts = async (req) => {
  try {
    if (req.isAdmin) {
      let userCount = await makeMongoDbServiceUser.getCountDocumentByQuery({status: { $ne: 'D'}});
      let vendorCount = await makeMongoDbServiceVendor.getCountDocumentByQuery({status: { $ne: 'D'}});
      let orderCount = await makeMongoDbServiceOrder.getCountDocumentByQuery({status: { $ne: 'D'}});
      let productCount = await makeMongoDbServiceProduct.getCountDocumentByQuery({status: { $ne: 'D'}});
      return response(false, null, resMessage.success, {
        user: userCount,
        product: productCount,
        order: orderCount,
        vendor: vendorCount
      },200);
    }
    return response(true, null, resMessage.failed,[],403);
  } catch (error) {
    return response(true, null, error.message, error.stack,500);
  }
};

// return all orders count for a vendor.
exports.orderVendor = async (req) => {
  try {
    if (req.isVendor) {
      let matchCondition = {
        $and: [
          { vendors: { $in: [req.vendor._id] } },
          { status: { $ne: 'D' } }
        ]
      }
      let orderCount = await makeMongoDbServiceOrder.getCountDocumentByQuery(matchCondition);
      return response(false, null, resMessage.success, {
        count: orderCount
      },200);
    }
    return response(true, null, resMessage.failed,[],403);
  } catch (error) {
    return response(true, null, error.message, error.stack,500);
  }
};

// return all products count for a vendor.
exports.productVendor = async (req) => {
  try {
    if (req.isVendor) {
      const matchCondition = { vendor: req.vendor._id, status: { $ne: "D" } }
      let productCount = await makeMongoDbServiceProduct.getCountDocumentByQuery(matchCondition);
      return response(false, null, resMessage.success, {
        count: productCount
      },200);
    }
    return response(true, null, resMessage.failed,[],403);
  } catch (error) {
    return response(true, null, error.message, error.stack,500);
  }
};

// return all counts for vendor.
exports.allCountsVendor = async (req) => {
  try {
    if (req.isVendor) {
      let matchCondition = { vendor: req.vendor._id, status: { $ne: "D" } }
      let productCount = await makeMongoDbServiceProduct.getCountDocumentByQuery(matchCondition);
      
      matchCondition = {
        $and: [
          { vendors: { $in: [req.vendor._id] } },
          { status: { $ne: 'D' } }
        ]
      }
      let orderCount = await makeMongoDbServiceOrder.getCountDocumentByQuery(matchCondition);
      return response(false, null, resMessage.success, {
        order: orderCount,
        product: productCount,
      },200);
    }
    return response(true, null, resMessage.failed,[],403);
  } catch (error) {
    return response(true, null, error.message, error.stack,500);
  }
};
