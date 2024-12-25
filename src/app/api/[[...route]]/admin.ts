import { Hono } from "hono";
import { handle } from "hono/vercel";
import { jwt, sign, verify } from "hono/jwt";
import { z } from "zod";
import {
  createUser,
  getUser,
  login,
  loginStaff,
  getAllUsers,
  getDoctorByHospitalId,
} from "../utils/user";
import { userSchema, type user } from "../schemas/user";
import { sendOtp, verifyOtp } from "../utils/auth";
import { getHospital } from "../utils/hospital";
import { Variables } from "hono/types";
import department from "./department";
import { getDepartment } from "../utils/department";

const JWT_SECRET = process.env.JWT_SECRET || "";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "";

const admin = new Hono<{ Variables: Variables }>();

admin.use("*", jwt({ secret: JWT_SECRET }));

admin.get("/", (c) => {
  return c.json({
    message: "Admin route hit!",
  });
});

admin.post("/createUser", async (c) => {
  const {
    tier,
    name,
    address,
    dob,
    gender,
    email,
    phone,
    password,
    bloodGroup,
    allergies,
    udid,
    qualification,
    hospitalId,
    departmentId,
  } = await c.req.json();

  if (
    !tier ||
    !name ||
    !address ||
    !dob ||
    !gender ||
    !email ||
    !phone ||
    !bloodGroup ||
    !allergies
  ) {
    return c.json(
      {
        success: false,
        message: "Invalid staff user creation request!",
        error:
          "Tier, Name, address, date of birth, gender, email, phone, blood group, and allergies are required.",
      },
      400,
    );
  }

  if (tier > 0 && (!password || !qualification)) {
    return c.json(
      {
        success: false,
        message: "Invalid staff user creation request!",
        error:
          "For creating staff user, password and qualification is mandatory!",
      },
      400,
    );
  }

  if (tier > 0 && tier < 4) {
    if (!hospitalId || hospitalId.length !== 24) {
      return c.json(
        {
          success: false,
          message: "Invalid staff user creation request!",
          error: "Hospital ID is required for staff users!",
        },
        400,
      );
    }
  }

  if (tier == 1) {
    if (!departmentId || departmentId.length !== 24) {
      return c.json(
        {
          success: false,
          message: "Invalid staff user creation request!",
          error: "Department ID is required for doctors!",
        },
        400,
      );
    }
  }

  const hospital = await getDepartment(departmentId);
  if (!hospital) {
    return c.json(
      {
        success: false,
        message: "Department not found",
        error: "Department with given ID not found in db",
      },
      400,
    );
  }

  const newUser: user = {
    tier: tier,
    name: name,
    address: address,
    dob: dob,
    gender: gender,
    email: email,
    phone: phone,
    bloodGroup: bloodGroup,
    allergies: allergies,
    password: password,
    qualification: qualification,
    departmentId: departmentId,
  };
  if (udid) newUser.udid = udid;
  if (password) newUser.password = password;
  if (qualification) newUser.qualification = qualification;
  if (hospitalId) newUser.hospitalId = hospitalId;
  const res = await createUser(newUser);
  if (res) {
    return c.json({ ...res }, res?.success ? 201 : 400);
  } else {
    return c.json(
      {
        success: false,
        message: "Staff User creation failed",
        error: "Staff User creation failed for some reason",
      },
      400,
    );
  }
});

admin.get("/getAllUsers", async (c) => {
  try {
    const users = await getAllUsers();
    return c.json(
      {
        success: true,
        users: users,
      },
      200,
    );
  } catch (error) {
    return c.json(
      {
        success: false,
        message: "Failed to fetch users",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      500,
    );
  }
});

admin.post("/getDoctorByHospitalId", async (c) => {
  const { hospitalId } = await c.req.json();
  const res = await getDoctorByHospitalId(hospitalId);
  return c.json({ ...res }, res.success ? 200 : 400);
});

export default admin;
