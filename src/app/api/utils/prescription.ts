import { ObjectId, PullOperator, PushOperator } from "mongodb";
import { getDb } from "./mongodb";
import { z } from "zod";
import { prescription, prescriptionSchema } from "../schemas/prescription";

async function getAllPrescription() {
  const db = await getDb();
  const prescription = await db.collection("prescriptions").find().toArray();
  if (prescription) {
    return prescription;
  }
}

async function getPrescriptionById(userId: string) {
  const db = await getDb();
  const prescription = await db
    .collection("prescriptions")
    .find({ userId: userId })
    .toArray();
  if (prescription) {
    return prescription;
  }
}

async function createPrescription(newItem: prescription) {
  const db = await getDb();
  try {
    prescriptionSchema.parse(newItem);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        val: false,
        message: "prescription object validation failed",
        errors: err.errors,
      };
    }
  }
  const result = await db
    .collection("prescriptions")
    .insertOne(newItem)
    .then(async (data) => {
      const updateQuantity = await db.collection("inventory").updateOne(
        {
          _id: new ObjectId(newItem.inventory.id),
        },
        {
          $inc: {
            quantity: -newItem.inventory.quantity,
          },
        },
      );
      if (updateQuantity) {
        return data;
      } else {
        return {
          ...data,
          message: "consumable quantity update failed",
        };
      }
    });

  if (result) {
    await db.collection("cases").updateOne(
      { _id: new ObjectId(newItem.caseId) },
      {
        $push: {
          prescriptions: {
            $each: [{ _id: result.insertedId, name: newItem.inventory.name }],
          },
        } as PushOperator<unknown>,
      },
    );
    return {
      val: true,
      ...result,
    };
  }
}

async function deletePrescriptionById(id: ObjectId) {
  const db = await getDb();
  const result = await db.collection("prescription").deleteOne({ _id: id });
  if (result) {
    await db.collection("cases").updateOne(
      { "prescription._id": id },
      {
        $pull: {
          prescription: {
            _id: id,
          },
        } as PullOperator<unknown>,
      },
    );
    return result;
  }
}

export {
  getAllPrescription,
  getPrescriptionById,
  createPrescription,
  deletePrescriptionById,
};
