import { ObjectId, PullOperator, PushOperator } from "mongodb";
import { consumption, consumptionSchema } from "../schemas/consumption";
import { getDb } from "./mongodb";
import { z } from "zod";

async function getAllConsumption() {
  const db = await getDb();
  const consumptions = await db.collection("consumptions").find().toArray();
  if (consumptions) {
    return consumptions;
  }
}

async function getConsumptionById(id: ObjectId) {
  const db = await getDb();
  const consumption = await db.collection("consumptions").findOne({ _id: id });
  if (consumption) {
    return consumption;
  }
}

async function createConsumption(newItem: consumption) {
  const db = await getDb();
  try {
    consumptionSchema.parse(newItem);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        val: false,
        message: "Consumption object validation failed",
        errors: err.errors,
      };
    }
  }
  const result = await db.collection("consumptions").insertOne(newItem);
  if (result) {
    console.log(newItem.inventoryId);
    const update = await db.collection("inventory").updateOne(
      { _id: new ObjectId(newItem.inventoryId) },
      {
        $push: {
          consumption: { id: new ObjectId(result.insertedId) },
        } as PushOperator<unknown>,
      },
    )
    console.log(update);
    return {
      val: true,
      ...result,
    };
  }
}

async function deleteConsumptionById(id: ObjectId) {
  const db = await getDb();
  const result = await db.collection("consumptions").deleteOne({ _id: id });
  if (result) {
    await db.collection("hospitals").updateOne(
      { "inventory.id": id },
      {
        $pull: {
          inventory: {
            id: id,
          },
        } as PullOperator<unknown>,
      },
    );
    return result;
  }
}

export { getAllConsumption, getConsumptionById, createConsumption, deleteConsumptionById };