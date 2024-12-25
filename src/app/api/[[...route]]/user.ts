import { Hono } from "hono";
import { handle } from "hono/vercel";
import { jwt, type JwtVariables } from "hono/jwt";
import { z } from "zod";
import {
  createHospital,
  updateHospital,
  createDepartment,
  getAllHospitals,
  addBeds,
  getBeds,
  setBedStatus,
  getNearbyHospitals,
} from "../utils/hospital";
import { type hospital } from "../schemas/hospital";
import { type department } from "../schemas/department";
import { location } from "../schemas/location";
import { createConsultation } from "../utils/consultation";
import {
  bookAppointment,
  getPastAppointments,
  getUpcomingAppointments,
  getUserById,
  hasUserBookedAppointment,
} from "../utils/user";

type Variables = JwtVariables;

const JWT_SECRET = process.env.JWT_SECRET || "";

const user = new Hono<{ Variables: Variables }>();

user.use("*", jwt({ secret: JWT_SECRET }));

user.post("/getUserById", async (c) => {
  try {
    const { userId } = await c.req.json();

    if (!userId || typeof userId !== "string" || userId.length !== 24) {
      return c.json(
        {
          success: false,
          message: "Invalid user ID format",
        },
        400,
      );
    }

    const user = await getUserById(userId);
    if (!user) {
      return c.json(
        {
          success: false,
          message: "User not found",
        },
        404,
      );
    }

    return c.json({ success: true, user });
  } catch (error) {
    return c.json(
      {
        success: false,
        message: "Internal server error",
      },
      500,
    );
  }
});

user.post("/appointment/book", async (c) => {
  const {
    consultationId,
    slotIndex,
    userId,
    symptomKeywords,
    possibleAilment,
    illness_severity,
    transmittable,
    online,
  } = await c.req.json();

  if (
    !consultationId ||
    !slotIndex == undefined ||
    !userId ||
    !symptomKeywords ||
    !possibleAilment ||
    transmittable == undefined ||
    !illness_severity ||
    online == undefined
  ) {
    return c.json({ success: false, message: "Invalid request" });
  }

  /*const existing = await hasUserBookedAppointment(userId);

  if (existing.success) {
    return c.json(
      {
        success: false,
        message: "User has already booked an appointment",
      },
      400,
    );
  }*/

  const res = await bookAppointment(
    consultationId,
    slotIndex,
    userId,
    symptomKeywords,
    possibleAilment,
    illness_severity,
    transmittable,
    online,
  );

  return c.json({ ...res } /*, res.success ? 201 : 400*/);
});

user.post("/getUpcomingAppointments", async (c) => {
  const { userId } = await c.req.json();

  if (!userId || typeof userId !== "string" || userId.length !== 24) {
    return c.json(
      {
        success: false,
        message: "Invalid user ID format",
      },
      400,
    );
  }

  const res = await getUpcomingAppointments(userId);

  return c.json({ ...res }, res.success ? 200 : 404);
});

user.post("/getPastAppointments", async (c) => {
  const { userId } = await c.req.json();

  if (!userId || typeof userId !== "string" || userId.length !== 24) {
    return c.json(
      {
        success: false,
        message: "Invalid user ID format",
      },
      400,
    );
  }

  const res = await getPastAppointments(userId);

  return c.json({ ...res }, res.success ? 200 : 404);
});

export default user;
