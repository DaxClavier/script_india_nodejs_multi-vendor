const { handleResponse } = require("../../../helpers/common");
const order = require("./order.accounting");
const vOrder = require("./order.verfiy");
const getOrder = require("./order");

exports.checkout = (req, res) => {
    handleResponse(order.accounting(req), res);
};

exports.verifyOrder = (req, res) => {
    handleResponse(vOrder.verifyOrder(req), res);
};

exports.getOrder = (req, res) => {
    handleResponse(getOrder.get(req), res);
};

exports.updateOrder = (req, res) => {
    handleResponse(getOrder.update(req), res);
};

exports.deleteOrder = (req, res) => {
    handleResponse(getOrder.delete(req), res);
};