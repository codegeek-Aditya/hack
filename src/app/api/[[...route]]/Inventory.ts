import { Hono } from "hono";
import { jwt, type JwtVariables } from "hono/jwt";
import { ObjectId } from "mongodb";
import { createDisposable, createInvetoryItem, deleteInventoryItem, getAll, getByInventoryByHospital, getDisposableStatus, getInvetoryItem, increaseStocks, issueMedicine, updateDisposableStatus } from "../utils/Inventory";
import { Inventory, InventoryOrder } from "../schemas/Inventory";
import { getDb } from "../utils/mongodb";

type Variables = JwtVariables;

const JWT_SECRET = process.env.JWT_SECRET || "";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "";

const inventory = new Hono<{ Variables: Variables }>();

inventory.use("*", jwt({ secret: JWT_SECRET }));

inventory.get("/", (c) => {
  const payload = c.get("jwtPayload");
  return c.json({
    message: "inventory route hit!",
    // payload: payload,
  });
});

inventory.get("/getAll", async (c) => {
  const inventory = await getAll();
  return c.json({
    inventory: inventory,
  });
});


inventory.get("/getById/:id", async (c) => {
  const id = c.req.param("id");
  const inventory = await getInvetoryItem(id);
  return c.json({
    inventory: inventory,
  });
});

inventory.get("/getByHospitalId/:id", async (c) => {
  const id = c.req.param("id");
  const inventory = await getByInventoryByHospital(id);
  return c.json({
    inventory: inventory,
  });
});

inventory.post("/create", async (c) => {
  const body = await c.req.json();
  const newItem: Inventory = {
    name: body.name,
    quantity: body.quantity,
    supplier: body.supplier,
    price: body.price,
    consumption: body.consumption,
    hospitalId: body.hospitalId,
    tag: body.tag,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  if (
    !newItem.name ||
    !newItem.quantity ||
    !newItem.consumption ||
    !newItem.supplier ||
    !newItem.price ||
    !newItem.tag
  ) {
    return c.json({ error: "Invalid inventory creation req" }, 400);
  } else {
    const res = await createInvetoryItem(newItem);
    if (!res) {
      return c.json({ error: "inventory creation failed" }, 404);
    } else {
      if (res.val === false) {
        return c.json({ result: res, error: "inventory creation failed" }, 404);
      } else {
        return c.json(
          { result: res, message: "inventory created successfully" },
          200,
        );
      }
    }
  }
});

inventory.post("/order", async (c) => {
  const body = await c.req.json();
  const newItem: InventoryOrder[] = body.map((item: InventoryOrder) => {
    return {
      name: item.name,
      quantity: item.quantity,
      hospitalId: item.hospitalId,
    };
  });
  if (newItem.length < 0) {
    return c.json({ error: "Invalid order request" }, 400);
  }
  const res = await increaseStocks(newItem);
  if (!res) {
    return c.json({ error: "Inventory order failed" }, 404);
  } else {
    return c.json({ result: res, message: "Inventory ordered successfully" }, 200);
  }
});

inventory.delete("/delete/:id", async (c) => {
  const id = new ObjectId(c.req.param("id"));
  const res = await deleteInventoryItem(id);
  if (res) {
    return c.json({ result: res, message: "Inventory deleted successfully" }, 200);
  } else {
    return c.json({ error: "Inventory deletion failed" }, 404);
  }
});

inventory.get("/disposable/getAll", async (c) => {
  const item = await getDisposableStatus();
  if (!item) {
    return c.json({ error: "Inventory item not found" }, 404);
  }
  return c.json({ result: item, message: "Inventory item found" }, 200);
})


inventory.post("/disposable/create", async (c) => {
  try {
    const body = await c.req.json();
    const { itemId, quantity, hazardType, userName } = body;

    if (!itemId || !quantity || !hazardType || !userName) {
      return c.json({ error: "Invalid disposable request" }, 400);
    }

    const db = await getDb();
    const item = await db.collection("inventory").findOne({ _id: new ObjectId(itemId) });

    if (!item) {
      return c.json({ val: false, message: "Inventory item not found" }, 404);
    }

    if (item.tag === "tool") {
      const res = await createDisposable(itemId, quantity, hazardType, userName);
      if (!res) {
        return c.json({ error: "Disposable request failed" }, 404);
      } else {
        return c.json({ result: res, message: "Disposable request created successfully" }, 200);
      }
    } else {
      const res = await issueMedicine(itemId, item.name, quantity, userName);
      if (!res) {
        return c.json({ error: "Medicine issuance failed" }, 404);
      } else {
        return c.json({ result: res, message: "Medicine issued successfully" }, 200);
      }
    }
  } catch (error) {
    return c.json({ error: error }, 500);
  }
});


inventory.post("/disposable/update", async (c) => {
  const {id, isDisposed, isCollected } = await c.req.json();
  const res = await updateDisposableStatus(id, isCollected, isDisposed);
  if (res) {
    return c.json({ result: res, message: "Inventory status updated successfully" }, 200);
  } else {
    return c.json({ error: "Inventory status update failed" }, 404);
  }
});


export default inventory;