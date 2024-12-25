import { Hono } from "hono";
import { handle } from "hono/vercel";
import { jwt, type JwtVariables } from "hono/jwt";
import {
  createDepartment,
  getDepartment,
  updateDepartment,
} from "../utils/department";
import { type department } from "../schemas/department";
//import { addDepartment, getHospital } from "../utils/hospital";
import { type hospital } from "../schemas/hospital";
import { LuSeparatorHorizontal } from "react-icons/lu";

type Variables = JwtVariables;

const JWT_SECRET = process.env.JWT_SECRET || "";

const department = new Hono<{ Variables: Variables }>();

department.use("*", jwt({ secret: JWT_SECRET }));

department.get("/", (c) => {
  const payload = c.get("jwtPayload");
  return c.json({
    message: "Department route hit!",
    payload: payload,
  });
});

department.get("/getDepartment", async (c) => {
  const body = await c.req.json();
  const res = await getDepartment(body.id);
  return c.json({ ...res }, res.success ? 200 : 404);
});

department.post("/create", async (c) => {
  const body = await c.req.json();
  if (!body.name || !body.hospitalId || !body.location) {
    return c.json({ error: "Invalid department creation req" }, 400);
  }
  const newDepartment: department = {
    name: body.name,
    location: body.location,
    hod: body.hod ?? "",
    beds: body.beds ?? "",
    doctors: body.doctors ?? [],
  };
  const res = await createDepartment(newDepartment);
  return c.json({ ...res }, res.success ? 200 : 400);
});

department.post("/updateDepartment", async (c) => {
  const body = await c.req.json();
  const departmentId = body.departmentId;
  const updated = body.updated;
  if (!departmentId || !updated) {
    return c.json({ error: "Invalid Department update req" }, 400);
  }
  const res = await updateDepartment(departmentId, updated);
  return c.json({ ...res }, res.success ? 200 : 400);
});

export default department;
