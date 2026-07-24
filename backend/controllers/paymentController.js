import Settlement from "../models/Settlement.js";
import ViolationLine from "../models/ViolationLine.js";
import VehicleOwner from "../models/VehicleOwner.js";
import axios from "axios";
import crypto from "crypto";

// @desc    Initiate Khalti Payment
// @route   POST /api/payments/khalti/initiate
// @access  Private
const initiateKhalti = async (req, res) => {
  const { fineId } = req.body;

  try {
    const settlement = await Settlement.findById(fineId).populate({
      path: "violationLineId",
      populate: { path: "vehicleId", populate: { path: "ownerId" } },
    });

    if (!settlement)
      return res.status(404).json({ message: "Settlement record not found" });

    const violation = settlement.violationLineId;
    const owner = violation.vehicleId?.ownerId;
    const amount = violation.appliedFineAmount;

    if (!owner) return res.status(400).json({ message: "Owner not found for vehicle" });

    const payload = {
      return_url: `${process.env.FRONTEND_URL}/payment-status`,
      website_url: process.env.FRONTEND_URL,
      amount: amount * 100, // Khalti expects Paisa
      purchase_order_id: settlement._id,
      purchase_order_name: `Fine Payment`,
      customer_info: {
        name: owner.fullName,
        email: owner.email,
        phone: owner.phoneNumber || "9800000000",
      },
    };

    const response = await axios.post(
      "https://a.khalti.com/api/v2/epayment/initiate/",
      payload,
      {
        headers: {
          Authorization: `Key ${process.env.KH_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    res.json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ message: "Khalti Initialization Failed" });
  }
};

// @desc    Verify Khalti Payment
// @route   POST /api/payments/khalti/verify
// @access  Private
const verifyKhalti = async (req, res) => {
  const { pidx, fineId } = req.body;

  try {
    const response = await axios.post(
      "https://a.khalti.com/api/v2/epayment/lookup/",
      { pidx },
      {
        headers: {
          Authorization: `Key ${process.env.KH_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (response.data.status === "Completed") {
      const settlement = await Settlement.findById(fineId).populate("violationLineId");
      if (settlement) {
        settlement.paymentStatus = "Completed";
        settlement.amountPaid = settlement.violationLineId.appliedFineAmount;
        settlement.transactionId = pidx;
        settlement.paymentMethod = "Khalti";
        settlement.paymentDate = Date.now();
        await settlement.save();

        await ViolationLine.findByIdAndUpdate(settlement.violationLineId._id, {
          status: "Paid",
        });

        return res.json({ success: true, message: "Payment Verified" });
      }
    }

    res.status(400).json({ success: false, message: "Payment not completed" });
  } catch (error) {
    res.status(500).json({ message: "Verification Failed" });
  }
};

// @desc    Initiate eSewa Payment
// @route   POST /api/payments/esewa/initiate
// @access  Private
const initiateEsewa = async (req, res) => {
  const { fineId } = req.body;

  try {
    const settlement = await Settlement.findById(fineId).populate("violationLineId");
    if (!settlement) return res.status(404).json({ message: "Settlement not found" });

    const amount = settlement.violationLineId.appliedFineAmount;
    const transaction_uuid = `${settlement._id}-${Date.now()}`;
    const product_code = process.env.ESEWA_SCD;
    const secret = process.env.ESEWA_SECRET;

    if (!product_code || !secret) {
      return res
        .status(500)
        .json({ message: "eSewa not configured (missing SCD or SECRET)" });
    }

    const message = `total_amount=${amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
    const hash = crypto
      .createHmac("sha256", secret)
      .update(message)
      .digest("base64");

    const formData = {
      amount: amount,
      failure_url: `${process.env.FRONTEND_URL}/violations`,
      product_delivery_charge: "0",
      product_service_charge: "0",
      product_code: product_code,
      signature: hash,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      success_url: `${process.env.FRONTEND_URL}/payment-status`,
      tax_amount: "0",
      total_amount: amount,
      transaction_uuid: transaction_uuid,
    };

    res.json({
      url: "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
      formData,
    });
  } catch (error) {
    res.status(500).json({ message: "eSewa Initialization Failed" });
  }
};

// @desc    Verify eSewa Payment
// @route   GET /api/payments/esewa/verify
// @access  Public (Callback)
const verifyEsewa = async (req, res) => {
  const { data } = req.query;

  try {
    const decoded = JSON.parse(Buffer.from(data, "base64").toString("utf-8"));
    let success = false;

    const secret = process.env.ESEWA_SECRET;
    if (!secret) throw new Error("eSewa secret not configured");

    if (!decoded.signed_field_names || !decoded.signature) {
      throw new Error("Invalid payload: Missing signature or signed_field_names");
    }

    const fields = decoded.signed_field_names.split(",");
    const message = fields.map((field) => `${field}=${decoded[field] || ""}`).join(",");

    const expectedHash = crypto
      .createHmac("sha256", secret)
      .update(message)
      .digest("base64");

    if (expectedHash !== decoded.signature) {
      console.error("eSewa Security Alert: Signature mismatch");
      throw new Error("Invalid eSewa signature");
    }

    if (decoded.status === "COMPLETE") {
      const fineId = decoded.transaction_uuid.split("-")[0];
      const settlement = await Settlement.findById(fineId).populate("violationLineId");

      if (settlement) {
        settlement.paymentStatus = "Completed";
        settlement.amountPaid = settlement.violationLineId.appliedFineAmount;
        settlement.paymentMethod = "eSewa";
        settlement.transactionId = decoded.transaction_code;
        settlement.paymentDate = Date.now();
        await settlement.save();

        await ViolationLine.findByIdAndUpdate(settlement.violationLineId._id, {
          status: "Paid",
        });

        success = true;
      }
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const redirectUrl = `${frontendUrl}/payment-status?esewa_status=${success ? "success" : "failure"}&esewa_tx=${decoded.transaction_code || ""}`;

    return res.redirect(redirectUrl);
  } catch (error) {
    console.error("eSewa verify error:", error);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    return res.redirect(`${frontendUrl}/payment-status?esewa_status=failure`);
  }
};

// @desc    Manual Fine Payment (Simulation)
// @route   POST /api/payments/:id/pay
// @access  Private
const payFine = async (req, res) => {
  try {
    const settlement = await Settlement.findById(req.params.id).populate("violationLineId");

    if (settlement) {
      settlement.paymentStatus = "Completed";
      settlement.amountPaid = settlement.violationLineId.appliedFineAmount;
      settlement.paymentMethod = "Cash";
      settlement.transactionId = "CASH-" + Date.now();
      settlement.paymentDate = Date.now();
      await settlement.save();

      await ViolationLine.findByIdAndUpdate(settlement.violationLineId._id, {
        status: "Paid",
      });

      res.json({ message: "Payment simulated successfully", payment: settlement });
    } else {
      res.status(404).json({ message: "Settlement not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export { initiateKhalti, verifyKhalti, initiateEsewa, verifyEsewa, payFine };
