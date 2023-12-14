const express = require("express");
const router = express.Router();

const validate = require("../validations/handler");
const rules = require("../validations/vendor.validation");
const vendor = require("../controller/v1/vendor");
const { verifyToken, isAdmin } = require("../middleware/auth.mdl");
// const { verifyToken, isAdmin, isVendor } = require("../middleware/auth.mdl");

// Create a new vendor
router.post("/add", isAdmin,validate(rules.createVendor), vendor.create);

// Retrieve all vendors
router.get("/all", isAdmin, validate(rules.listVendors), vendor.findAll);

// Retrieve a single vendor with id
router.get("/", verifyToken, vendor.findById);

// Update a vendor
router.post("/update", verifyToken, validate(rules.updateVendor), vendor.update);
// router.post("/update", isVendor, validate(rules.updateVendor), vendor.update);

// Delete a vendor
router.post("/delete", isAdmin, vendor.deleteVendor);

module.exports = router;
