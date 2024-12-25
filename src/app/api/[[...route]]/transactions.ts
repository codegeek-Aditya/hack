import { Hono } from "hono";
import { jwt, type JwtVariables } from "hono/jwt";
import {
  approveTransaction,
  createOrder,
  createTransaction,
  getAllTransactions,
  getEveryTransaction,
  validatePayment,
} from "../utils/transactions";
import { transaction } from "../schemas/transaction";
import { getDb } from "../utils/mongodb";

type Variables = JwtVariables;

const JWT_SECRET = process.env.JWT_SECRET || "";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "";

const transactions = new Hono<{ Variables: Variables }>();

transactions.get("/", (c) => {
  return c.json({
    message: "transactions route hit!",
  });
});

transactions.post("/create-order", createOrder);

transactions.post("/validate-payment", validatePayment);

transactions.post("/create", async (c) => {
  const { diagnosisId, caseId, hospitalId, amount, patientId, patientName } =
    await c.req.json();
  const transaction: transaction = {
    diagnosisId,
    caseId,
    hospitalId,
    patientId,
    patientName,
    amount,
    approved: false,
  };
  const res = await createTransaction(transaction);
  return c.json({ ...res }, res.success ? 201 : 400);
});

transactions.get("/getAll/:hospitalId", async (c) => {
  const hospitalId = c.req.param("hospitalId");
  if (!hospitalId) {
    return c.json(
      {
        success: false,
        message: "Transaction get all request failed!",
        error: "Hospital ID is required",
      },
      400,
    );
  }
  const res = await getAllTransactions(hospitalId);
  return c.json({ ...res }, res.success ? 200 : 400);
});

transactions.get("/getEvery", async (c) => {
  const res = await getEveryTransaction();
  return c.json({ ...res }, res.success ? 200 : 400);
});

transactions.post("/approve", async (c) => {
  const { transactionId } = await c.req.json();
  const res = await approveTransaction(transactionId);
  return c.json({ ...res }, res.success ? 200 : 400);
});

transactions.get("/getUser/:userId", async (c) => {
  const userId = c.req.param("userId");
  if (!userId) {
    return c.json(
      {
        success: false,
        message: "Transaction get all request failed!",
        error: "Hospital ID is required",
      },
      400,
    );
  }
  const res = await getAllTransactions(userId);
  return c.json({ ...res }, res.success ? 200 : 400);
});

export default transactions;
