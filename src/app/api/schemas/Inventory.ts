import { ObjectId } from "mongodb";
import { z } from "zod";

interface Inventory {
    _id?: string | ObjectId;
    name: string;
    supplier: string;
    quantity: number;
    consumption: string[];
    price: number;
    hospitalId?: string;
    tag: string;
    batchId?: string;
    createdAt: Date;
    updatedAt: Date;
}

interface InventoryOrder {
    _id?: string;
    name: string;
    hospitalId: string;
    quantity: number;
}

const InventorySchema = z.object({
    _id: z.string().min(24).max(24).optional(),
    name: z
        .string()
        .min(1, "Inventory name is required")
        .max(150, "Inventory name too long"),
    supplier: z.string().min(1, "Supplier is required"),
    quantity: z.number(),
    consumption: z.array(z.string()),
    price: z.number().gt(0, "Price must be greater than 0"),
    hospitalId: z.string().min(24).max(24).optional(),
    tag: z.enum(["medicine", "tool", "machine"]),
    batchId: z.string().min(24).max(24).optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

export type { Inventory, InventoryOrder };

export { InventorySchema };