import axios from "axios";
import { connectDB } from "./mongodb";
import BkashToken from "../models/BkashToken";

const getEnv = () => ({
  BKASH_BASE_URL: process.env.BKASH_BASE_URL,
  BKASH_USERNAME: process.env.BKASH_USERNAME,
  BKASH_PASSWORD: process.env.BKASH_PASSWORD,
  BKASH_APP_KEY: process.env.BKASH_APP_KEY,
  BKASH_APP_SECRET: process.env.BKASH_APP_SECRET,
});

export const getBkashHeaders = async (forceRefresh = false) => {
  try {
    await connectDB();
    const env = getEnv();

    if (!forceRefresh) {
      // Check for valid token in DB (with 5 min safety margin)
      const cachedToken = await BkashToken.findOne().sort({ createdAt: -1 });
      const now = new Date();
      
      if (cachedToken && new Date(cachedToken.expiresAt) > new Date(now.getTime() + 5 * 60 * 1000)) {
        return {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: cachedToken.id_token,
          "X-App-Key": env.BKASH_APP_KEY,
        };
      }
    }

    // If no valid token or forceRefresh, grant a new one
    console.log("Granting new bKash token...");
    const { data } = await axios.post(
      `${env.BKASH_BASE_URL}/tokenized/checkout/token/grant`,
      {
        app_key: env.BKASH_APP_KEY,
        app_secret: env.BKASH_APP_SECRET,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          username: env.BKASH_USERNAME,
          password: env.BKASH_PASSWORD,
        },
      }
    );

    if (data.id_token) {
      // Save new token to DB (Delete old ones first to keep it clean)
      await BkashToken.deleteMany({});
      await BkashToken.create({
        id_token: data.id_token,
        expiresAt: new Date(new Date().getTime() + (parseInt(data.expires_in) || 3600) * 1000),
      });

      return {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: data.id_token,
        "X-App-Key": env.BKASH_APP_KEY,
      };
    } else {
      throw new Error(data.statusMessage || "Failed to grant token");
    }
  } catch (error) {
    console.error("bKash Auth Error:", error.response?.data || error.message);
    throw new Error("Failed to authenticate with bKash");
  }
};

export const createBkashPayment = async (amount, invoiceNumber, callbackURL, phone) => {
  const env = getEnv();
  try {
    const headers = await getBkashHeaders();
    const { data } = await axios.post(
      `${env.BKASH_BASE_URL}/tokenized/checkout/create`,
      {
        mode: "0011",
        payerReference: phone || "01600786666", // Use customer phone or default
        callbackURL: callbackURL,
        amount: amount.toString(),
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: invoiceNumber,
      },
      { headers }
    );

    return data;
  } catch (error) {
    // If unauthorized, token might be stale. Try one more time with fresh token.
    if (error.response?.data?.message === "Unauthorized" || error.response?.status === 401) {
      console.log("Unauthorized detected, retrying with fresh token...");
      const headers = await getBkashHeaders(true);
      const { data } = await axios.post(
        `${env.BKASH_BASE_URL}/tokenized/checkout/create`,
        {
          mode: "0011",
          payerReference: phone || "01600786666",
          callbackURL: callbackURL,
          amount: amount.toString(),
          currency: "BDT",
          intent: "sale",
          merchantInvoiceNumber: invoiceNumber,
        },
        { headers }
      );
      return data;
    }
    console.error("bKash Create Payment Error:", error.response?.data || error.message);
    throw new Error("Failed to create bKash payment");
  }
};

export const executeBkashPayment = async (paymentID) => {
  const env = getEnv();
  try {
    const headers = await getBkashHeaders();
    const { data } = await axios.post(
      `${env.BKASH_BASE_URL}/tokenized/checkout/execute`,
      { paymentID },
      { headers }
    );

    return data;
  } catch (error) {
    if (error.response?.data?.message === "Unauthorized" || error.response?.status === 401) {
      console.log("Unauthorized detected, retrying with fresh token...");
      const headers = await getBkashHeaders(true);
      const { data } = await axios.post(
        `${env.BKASH_BASE_URL}/tokenized/checkout/execute`,
        { paymentID },
        { headers }
      );
      return data;
    }
    console.error("bKash Execute Payment Error:", error.response?.data || error.message);
    throw error;
  }
};

export const queryBkashPayment = async (paymentID) => {
  const env = getEnv();
  try {
    const headers = await getBkashHeaders();
    const { data } = await axios.post(
      `${env.BKASH_BASE_URL}/tokenized/checkout/payment/status`,
      { paymentID },
      { headers }
    );

    return data;
  } catch (error) {
    if (error.response?.data?.message === "Unauthorized" || error.response?.status === 401) {
      console.log("Unauthorized detected in query, retrying with fresh token...");
      const headers = await getBkashHeaders(true);
      const { data } = await axios.post(
        `${env.BKASH_BASE_URL}/tokenized/checkout/payment/status`,
        { paymentID },
        { headers }
      );
      return data;
    }
    console.error("bKash Query Payment Error:", error.response?.data || error.message);
    throw error;
  }
};

export const refundBkashPayment = async ({ paymentID, amount, trxID, sku = "booking", reason = "Customer Request" }) => {
  const env = getEnv();
  try {
    const headers = await getBkashHeaders();
    const { data } = await axios.post(
      `${env.BKASH_BASE_URL}/tokenized/checkout/payment/refund`,
      {
        paymentID,
        amount: amount.toString(),
        trxID,
        sku,
        reason,
      },
      { headers }
    );

    return data;
  } catch (error) {
    if (error.response?.data?.message === "Unauthorized" || error.response?.status === 401) {
      console.log("Unauthorized detected in refund, retrying with fresh token...");
      const headers = await getBkashHeaders(true);
      const { data } = await axios.post(
        `${env.BKASH_BASE_URL}/tokenized/checkout/payment/refund`,
        {
          paymentID,
          amount: amount.toString(),
          trxID,
          sku,
          reason,
        },
        { headers }
      );
      return data;
    }
    console.error("bKash Refund Error:", error.response?.data || error.message);
    throw error;
  }
};
