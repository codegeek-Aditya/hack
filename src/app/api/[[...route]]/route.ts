import { Hono } from "hono";
import { handle } from "hono/vercel";
import auth from "./auth";
import hospital from "./hospital";
import department from "./department";
import admin from "./admin";
import { cors } from "hono/cors";
import user from "./user";
import prescriptions from "./prescription";
import cases from "./case";
import { getNearbyHospitals } from "../utils/hospital";
import transactions from "./transactions";
import inventory from "./Inventory";
import consumptions from "./consumption";
//export const runtime = "edge";

const app = new Hono().basePath("/api");

app.use(
  "*",
  cors({
    origin: "*",
    credentials: true,
  }),
);

app.get("/", (c) => {
  return c.json({
    message: "MediLink API!",
  });
});

app.post("/getNearby", async (c) => {
  const body = await c.req.json();
  const lat = body.lat;
  const long = body.long;
  if (!lat || !long || typeof lat !== "number" || typeof long !== "number") {
    return c.json(
      {
        success: false,
        message: "Invalid nearby hospitals request!",
        error: "Latitude (number) or longitude (number) missing",
      },
      400,
    );
  }
  const hospitals = await getNearbyHospitals(lat, long);
  return c.json({
    hospitals: hospitals,
  });
});

app.route("/auth", auth);
app.route("/admin", admin);
app.route("/hospital", hospital);
app.route("/stock", inventory);
app.route("/consumption", consumptions);
app.route("/case", cases);
app.route("/prescription", prescriptions);
app.route("/user", user);
app.route("/transactions", transactions);

export const GET = handle(app);
export const POST = handle(app);
export const DELETE = handle(app);
