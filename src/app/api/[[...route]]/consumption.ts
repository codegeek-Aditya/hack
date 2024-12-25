import { Hono } from "hono";
import { jwt, type JwtVariables } from "hono/jwt";
import { ObjectId } from "mongodb";
import { createConsumption, deleteConsumptionById, getAllConsumption, getConsumptionById } from "../utils/consumption";
import { consumption } from "../schemas/consumption";

type Variables = JwtVariables;

const JWT_SECRET = process.env.JWT_SECRET || "";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "";

const consumptions = new Hono<{ Variables: Variables }>();

consumptions.use("*", jwt({ secret: JWT_SECRET }));

consumptions.get("/", (c) => {
  const payload = c.get("jwtPayload");
  return c.json({
    message: "consumptions route hit!",
    // payload: payload,
  });
});

consumptions.get("/getAll", async (c) => {
  const consumptions = await getAllConsumption();
  return c.json({
    consumptions: consumptions,
  });
});


consumptions.get("/getById/:id", async (c) => {
  const id = new ObjectId(c.req.param("id"));
  const consumptions = await getConsumptionById(id);
  return c.json({
    consumptions: consumptions,
  });
});

consumptions.post("/create", async (c) => {
  const body = await c.req.json();
  const newItem: consumption = {
    monthYear: body.monthYear,
    quantity: body.quantity,
    inventoryId: body.inventoryId,
  };
  if (
    !body.monthYear ||
    !body.quantity
  ) {
    return c.json({ error: "Invalid consumption creation req" }, 400);
  } else {
    const res = await createConsumption(newItem);
    if (!res) {
      return c.json({ error: "consumption creation failed" }, 404);
    } else {
      if (res.val === false) {
        return c.json({ result: res, error: "consumption creation failed" }, 404);
      } else {
        return c.json(
          { result: res, message: "consumption created successfully" },
          200,
        );
      }
    }
  }
});


consumptions.delete("/delete/:id", async (c) => {
  const id = new ObjectId(c.req.param("id"));
  const res = await deleteConsumptionById(id);
  if (res) {
    return c.json({ result: res, message: "Consumption data deleted successfully" }, 200);
  } else {
    return c.json({ error: "Consumption data deletion failed" }, 404);
  }
});


export default consumptions;
