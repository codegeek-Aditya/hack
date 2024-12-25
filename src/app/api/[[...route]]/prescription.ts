import { Hono } from "hono";
import { jwt, type JwtVariables } from "hono/jwt";
import { ObjectId } from "mongodb";
import {
  createPrescription,
  deletePrescriptionById,
  getAllPrescription,
  getPrescriptionById,
} from "../utils/prescription";
import { prescription } from "../schemas/prescription";

type Variables = JwtVariables;

const JWT_SECRET = process.env.JWT_SECRET || "";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "";

const prescriptions = new Hono<{ Variables: Variables }>();

prescriptions.use("*", jwt({ secret: JWT_SECRET }));

prescriptions.get("/", (c) => {
  const payload = c.get("jwtPayload");
  return c.json({
    message: "prescriptions route hit!",
    // payload: payload,
  });
});

prescriptions.get("/getAll", async (c) => {
  const prescriptions = await getAllPrescription();
  return c.json({
    prescriptions: prescriptions,
  });
});

prescriptions.get("/getByUser/:userId", async (c) => {
  const userId = c.req.param("userId");
  const prescriptions = await getPrescriptionById(userId);
  return c.json({
    prescriptions: prescriptions,
  });
});

prescriptions.post("/create", async (c) => {
  const body = await c.req.json();
  const newItem: prescription = {
    userId: body.userId,
    doctorId: body.doctorId,
    inventory: {
      id: body.inventory.id,
      name: body.inventory.name,
      quantity: body.inventory.quantity,
    },
    caseId: body.caseId,
    price: body.price,
  };
  if (
    !body.userId ||
    !body.doctorId ||
    !body.inventory.id ||
    !body.inventory.name ||
    !body.inventory.quantity ||
    !body.price
  ) {
    return c.json({ error: "Invalid prescription creation req" }, 400);
  } else {
    const res = await createPrescription(newItem);
    if (!res) {
      return c.json({ error: "Prescription creation failed" }, 404);
    } else {
      if (res.val === false) {
        return c.json(
          { result: res, error: "Prescription creation failed" },
          404,
        );
      } else {
        return c.json(
          { result: res, message: "Prescription created successfully" },
          200,
        );
      }
    }
  }
});

prescriptions.delete("/delete/:id", async (c) => {
  const id = new ObjectId(c.req.param("id"));
  const res = await deletePrescriptionById(id);
  if (res) {
    return c.json(
      { result: res, message: "Prescription data deleted successfully" },
      200,
    );
  } else {
    return c.json({ error: "Prescription data deletion failed" }, 404);
  }
});

export default prescriptions;
