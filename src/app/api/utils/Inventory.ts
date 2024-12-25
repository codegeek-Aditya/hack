import { ObjectId, PullOperator, PushOperator } from "mongodb";
import { getDb } from "./mongodb";
import { z } from "zod";
import { Inventory, InventoryOrder, InventorySchema } from "../schemas/Inventory";

async function getAll() {
  const db = await getDb();
  const Inventory = await db.collection("inventory").find().toArray();
  if (Inventory) {
    return Inventory;
  }
}

async function getInvetoryItem(id: string) {
  const db = await getDb();
  const Inventory = await db.collection("inventory").findOne({ _id: new ObjectId(id) });
  if (Inventory) {
    return Inventory;
  }
}

async function getByInventoryByHospital(hospitalId: string) {
  const db = await getDb();
  const Inventory = await db.collection("inventory").find({ hospitalId: hospitalId }).toArray();
  if (Inventory) {
    return Inventory;
  }
}

async function createInvetoryItem(newItem: Inventory) {
  const db = await getDb();
  try {
    InventorySchema.parse(newItem);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        val: false,
        message: "Inventory object validation failed",
        errors: err.errors,
      };
    }
  }

  const result = await db.collection("inventory").insertOne(newItem);
  if (result) {
    await db.collection("hospitals").updateOne(
      { _id: new ObjectId(newItem.hospitalId) },
      {
        $push: {
          inventory: {
            $each: [{ id: result.insertedId, name: newItem.name, tag: newItem.tag }],
          },
        } as PushOperator<unknown>,
      },
    )
    return {
      val: true,
      ...result,
    };
  }
}

async function increaseStocks(newItem: InventoryOrder[]) {
  const db = await getDb();
  const item = newItem.map((item) => {
    return {
      updateOne: {
        filter: { hospitalId: item.hospitalId, name: item.name },
        update: { $inc: { quantity: item.quantity } },
      },
    };
  });
  const result = await db.collection("inventory").bulkWrite(item);
  console.log(result);
  if (result) {
    return result;
  }
}


async function createDisposable(itemId: string, quantity: number, hazardType: string, userName: string) {
  const db = await getDb();
  const item = await db.collection("inventory").findOne({ _id: new ObjectId(itemId) });
  if (!item) {
    return {
      val: false,
      message: "Inventory item not found",
    };
  }
  if (item.tag === "tool") {

    const user = await db.collection("users").findOne({ name: userName });

    if (!user) {
      return {
        val: false,
        message: "User not found",
      };
    }

    const issuedBody = {
      itemId: itemId,
      itemName: item.name,
      userId: user._id.toString(),
      userName: userName,
      quantity: quantity,
      isDisposed: false,
      isCollected: true,
      isHazardous: hazardType,
    }


    const result = await db.collection("requests").insertOne(issuedBody);
    if (result) {
      return result;
    } else {
      return false;
    }
  } else {
    return {
      val: false,
      message: "Inventory item is not disposable",
    };
  }
}

async function issueMedicine(itemId: string, name: string, quantity: number, userName: string) {
  const db = await getDb();
  const user = await db.collection("users").findOne({ name: userName });
  console.log(user);
  if (!user) {
    return {
      val: false,
      message: "User not found",
    };
  }
  const issuedBody = {
    itemId: itemId,
    itemName: name,
    userName: user.name,
    userId: user._id,
    quantity: quantity,
    isCollected: false,
  }
  const result = await db.collection("requests").insertOne(issuedBody);
  if (result) {
    return result;
  } else {
    return false;
  }
}

async function getDisposableStatus() {
  const db = await getDb();
  const issuedInventory = await db.collection("requests").find().toArray();
  if (!issuedInventory) {
    return {
      val: false,
      message: "No issued inventory",
    };
  }
  return {
    val: true,
    issued: issuedInventory,
  };
}

async function updateDisposableStatus(id: string, isCollected: boolean, isDisposed?: boolean | null) {
  const db = await getDb();
    const updateObj = isDisposed !== null ? {
      isDisposed: isDisposed,
      isCollected: isCollected,
    } : {
      isCollected: isCollected,
    };

    const result = await db.collection("requests").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: updateObj,
      },
    );
    if (result.modifiedCount === 0) {
      return {
        val: false,
        message: "Failed to update inventory status",
      };
    }

    const updatedItem = await db.collection("requests").findOne({ _id: new ObjectId(id) });
    console.log(updatedItem);
    if (!updatedItem) {
      return {val: false, message: 'Failed to update inventory status'};
    }

    if (updatedItem.isCollected) {
      const inventoryUpdateResult = await db.collection("inventory").updateOne(
        { name: updatedItem.itemName },
        { $inc: { quantity: -updatedItem.quantity } }
      );

      if (inventoryUpdateResult.modifiedCount === 0) {
        return {val: false, message: 'Failed to update inventory quantity'};
      }
    }

    return {
      val: true,
      message: 'Inventory status updated successfully',
    };
}


async function deleteInventoryItem(id: ObjectId) {
  const db = await getDb();
  const result = await db.collection("inventory").deleteOne({ _id: id });
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

export { getAll, getInvetoryItem, getDisposableStatus, createInvetoryItem, createDisposable, deleteInventoryItem, getByInventoryByHospital, updateDisposableStatus, increaseStocks, issueMedicine }