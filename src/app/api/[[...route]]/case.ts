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
import {
  createCase,
  deleteCaseById,
  getAllCase,
  getCaseById,
} from "../utils/case";
import { Case } from "../schemas/case";

type Variables = JwtVariables;

const JWT_SECRET = process.env.JWT_SECRET || "";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "";

const cases = new Hono<{ Variables: Variables }>();

cases.use("*", jwt({ secret: JWT_SECRET }));

cases.get("/", (c) => {
  const payload = c.get("jwtPayload");
  return c.json({
    message: "cases route hit!",
    // payload: payload,
  });
});

cases.get("/getAll", async (c) => {
  const cases = await getAllCase();
  return c.json({
    cases: cases,
  });
});

cases.get("/getById/:id", async (c) => {
  const id = new ObjectId(c.req.param("id"));
  const cases = await getCaseById(id);
  return c.json({
    cases: cases,
  });
});

cases.post("/create", async (c) => {
  const body = await c.req.json();
  const illness_severity = body.illness_severity;
  const transmittable = body.transmittable;
  const doctorOffset = body.doctorOffset;
  const newItem: Case = {
    admittedAt: body.admittedAt,
    dischargedAt: body.dischargedAt,
    hospitalId: body.hospitalId,
    bedIndex: body.bedIndex,
    departmentId: body.departmentId,
    userId: body.userId,
    userName: body.userName,
    ailment: body.ailment,
    documents: body.documents,
    prescriptions: body.prescriptions,
    doctorId: body.doctorId,
    doctorName: body.doctorName,
    consultantId: body.consultantId,
    resolved: body.resolved,
  };
  const res = await createCase(
    newItem,
    illness_severity,
    transmittable,
    doctorOffset,
  );
  if (!res) {
    return c.json({ error: "Case creation failed" }, 404);
  } else {
    if (res.val === false) {
      return c.json({ result: res, error: "Case creation failed" }, 404);
    } else {
      return c.json({ result: res, message: "Case created successfully" }, 200);
    }
  }
});

/* cases.delete("/delete/:id", async (c) => {
    const id = new ObjectId(c.req.param("id"));
    const res = await deleteCaseById(id);
    if (res) {
        return c.json({ result: res, message: "Prescription data deleted successfully" }, 200);
    } else {
        return c.json({ error: "Prescription data deletion failed" }, 404);
    }
}); */

export default cases;
