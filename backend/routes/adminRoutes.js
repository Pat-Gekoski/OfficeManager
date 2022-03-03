const express = require("express");
const authController = require("../controllers/authController");
const adminController = require("../controllers/adminController");

const router = express.Router();

router.use(authController.protect, authController.restrictTo("systemAdmin"));

router.route("/accounts").get(adminController.getAllAccounts);

router
  .route("/accounts/:id")
  .get(adminController.getAccount)
  .patch(adminController.updateAccount)
  .delete(adminController.deleteAccount)

router.route("/accounts/:id/restore").patch(adminController.restoreAccount)

module.exports = router;
