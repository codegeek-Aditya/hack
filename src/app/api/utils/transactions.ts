import Razorpay from "razorpay";
import crypto from "crypto";
import { Context } from "hono";
import { getDb } from "./mongodb";
import { transaction } from "../schemas/transaction";
import { ObjectId } from "mongodb";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

interface CreateOrderRequest {
  amount: number;
  currency: string;
  receipt: string;
}

export const createOrder = async (c: Context) => {
  try {
    const { amount, currency, receipt } =
      await c.req.json<CreateOrderRequest>();

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt,
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return c.json({ error: "Error creating order" }, 500);
    }

    return c.json(order);
  } catch (error) {
    console.log("Error creating order:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

interface ValidatePaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export const validatePayment = async (c: Context) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await c.req.json<ValidatePaymentRequest>();

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return c.json({ error: "Server configuration error" }, 500);
    }

    const sha = crypto.createHmac("sha256", keySecret);
    sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = sha.digest("hex");

    if (digest !== razorpay_signature) {
      return c.json({ message: "Transaction not legit!" }, 400);
    }

    return c.json({
      message: "Payment successful",
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    console.log("Error validating payment:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

export async function createTransaction(transaction: transaction) {
  const db = await getDb();

  const result = await db.collection("transactions").insertOne(transaction);
  if (result) {
    return {
      success: true,
      message: "Transaction created successfully",
    };
  } else {
    return {
      success: false,
      message: "Failed to create transaction",
      error: "Internal Server Error",
    };
  }
}

export async function getEveryTransaction() {
  const db = await getDb();
  const transactions = await db.collection("transactions").find({}).toArray();
  if (transactions) {
    return {
      success: true,
      message: "Transactions fetched successfully",
      transactions,
    };
  } else {
    return {
      success: false,
      message: "Failed to fetch transactions",
      error: "Internal Server Error",
    };
  }
}

export async function getAllTransactions(hospitalId: string) {
  const db = await getDb();

  const transactions = await db
    .collection("transactions")
    .aggregate([
      {
        $match: { hospitalId },
      },
      {
        $lookup: {
          from: "hospitals",
          localField: "hospitalId",
          foreignField: "_id",
          as: "hospitalDetails",
        },
      },
      {
        $addFields: {
          hospitalName: { $arrayElemAt: ["$hospitalDetails.name", 0] },
        },
      },
      {
        $project: {
          hospitalDetails: 0, // Remove the hospitalDetails array from final results
        },
      },
    ])
    .toArray();

  if (!transactions) {
    return {
      success: false,
      message: "Failed to fetch transactions",
      error: "Internal Server Error",
    };
  }

  return {
    success: true,
    message: "Transactions fetched successfully",
    transactions,
  };
}

export async function getUserTransactions(userId: string) {
  const db = await getDb();
  const transactions = await db
    .collection("transactions")
    .aggregate([
      {
        $match: { userId },
      },
      {
        $lookup: {
          from: "hospitals",
          localField: "hospitalId",
          foreignField: "_id",
          as: "hospitalDetails",
        },
      },
      {
        $addFields: {
          hospitalName: { $arrayElemAt: ["$hospitalDetails.name", 0] },
        },
      },
      {
        $project: {
          hospitalDetails: 0, // Remove the hospitalDetails array from final results
        },
      },
    ])
    .toArray();

  if (!transactions) {
    return {
      success: false,
      message: "Failed to fetch transactions",
      error: "Internal Server Error",
    };
  }

  return {
    success: true,
    message: "Transactions fetched successfully",
    transactions,
  };
}

export async function approveTransaction(transactionId: string) {
  const db = await getDb();
  const result = await db
    .collection("transactions")
    .updateOne(
      { _id: new ObjectId(transactionId) },
      { $set: { approved: true } },
    );

  if (result.modifiedCount > 0) {
    return {
      success: true,
      message: "Transaction approved successfully",
    };
  } else {
    return {
      success: false,
      message: "Failed to approve transaction",
      error: "Transaction not found or already approved",
    };
  }
}
