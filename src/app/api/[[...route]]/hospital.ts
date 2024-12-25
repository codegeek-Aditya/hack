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
  getHospital,
} from "../utils/hospital";
import { type hospital } from "../schemas/hospital";
import { type department } from "../schemas/department";
import { location } from "../schemas/location";
import {
  createConsultation,
  createDiagnosis,
  findConsultation,
  forceSort,
  getConsultation,
  getConsultationsinHospital,
  getDiagnosis,
  getPastPatients,
  getUpcomingPatients,
  refreshConsultations,
} from "../utils/consultation";
import { reviewPatient } from "../utils/review";
import { createTransaction } from "../utils/transactions";
import { transaction } from "../schemas/transaction";

type Variables = JwtVariables;

const JWT_SECRET = process.env.JWT_SECRET || "";

const hospital = new Hono<{ Variables: Variables }>();

hospital.use("*", jwt({ secret: JWT_SECRET }));

hospital.get("/", (c) => {
  const payload = c.get("jwtPayload");
  return c.json({
    message: "Hospital route hit!",
    payload: payload,
  });
});

hospital.post("/getHospital", async (c) => {
  const { hospitalId } = await c.req.json();
  const res = await getHospital(hospitalId);
  if (res) {
    return c.json({
      success: true,
      message: "Hospital found!",
      hospital: res,
    });
  } else {
    return c.json(
      {
        success: false,
        message: "Hospital not found!",
        error: "Hospital not found",
      },
      404,
    );
  }
});

hospital.get("/getAll", async (c) => {
  const hospitals = await getAllHospitals();
  return c.json({
    hospitals: hospitals,
  });
});

hospital.post("/getNearby", async (c) => {
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

hospital.post("/create", async (c) => {
  const body = await c.req.json();
  if (
    !body.name ||
    !body.address ||
    !body.lat ||
    !body.long ||
    !body.director ||
    !body.email ||
    !body.phone ||
    !body.departments ||
    !body.inventory ||
    !body.equipments
  ) {
    return c.json(
      {
        success: false,
        message: "Invalid hospital creation request!",
        error:
          "Hospital name (string), address (string), latitude (number), longitude (number), director (string), email (string), phone (string), departments (array), inventory (array), equipments (array) are required",
      },
      400,
    );
  }
  const loc: location = {
    type: "Point",
    coordinates: [body.long, body.lat],
  };
  const newHospital: hospital = {
    name: body.name,
    address: body.address,
    location: loc,
    director: body.director,
    email: body.email,
    phone: body.phone,
    departments: body.departments,
    inventory: body.inventory,
    rating: 5,
  };
  const res = await createHospital(newHospital);
  return c.json({ ...res }, res.success ? 201 : 400);
});

hospital.post("/createDepartment", async (c) => {
  const { hospitalId, name, location, hod, beds, doctors, bedqty } =
    await c.req.json();
  if (
    !hospitalId ||
    !name ||
    !location ||
    typeof hospitalId !== "string" ||
    typeof name !== "string" ||
    typeof location !== "string"
  ) {
    return c.json(
      {
        success: false,
        message: "Invalid department creation request",
        error:
          "Hospital ID (string), name (string) & location (string) are required",
      },
      400,
    );
  }
  const newDepartment: department = {
    name: name,
    location: location,
    hod: hod,
    beds: beds ?? [],
    doctors: doctors ?? [],
  };
  const res = await createDepartment(hospitalId, newDepartment);
  /*if (res.success && bedqty) {
    const result = res.result;
    const bedsRes = await addBeds(res.result.insertedId, bedqty);
    if (!bedsRes.success) {
      return c.json(
        {
          result: res,
          error: "Beds addition failed",
        },
        400,
      );
    }
  }*/
  return c.json({ ...res }, res.success ? 201 : 400);
});

hospital.post("/updateHospital", async (c) => {
  const body = await c.req.json();
  const hospitalId = body.hospitalId;
  const update = body.update;
  if (!hospitalId || !update) {
    return c.json({ error: "Invalid hospital update req" }, 400);
  } else {
    const res = await updateHospital(hospitalId, update);
    if (!res) {
      return c.json({ error: "Hospital update failed" }, 404);
    } else {
      if (res.val === false) {
        return c.json({ result: res, error: "Hospital update failed" }, 404);
      } else {
        return c.json(
          { message: "Hospital updated successfully", result: res },
          200,
        );
      }
    }
  }
});

hospital.post("/addBeds", async (c) => {
  const { departmentId, qty } = await c.req.json();
  if (!departmentId || !qty) {
    return c.json(
      {
        success: false,
        message: "Invalid beds addition request!",
        error: "Department ID (string) & quantity (number) required.",
      },
      400,
    );
  } else {
    const res = await addBeds(departmentId, qty);
    return c.json({ ...res }, res.success ? 201 : 400);
  }
});

hospital.get("/getBeds/:departmentId", async (c) => {
  const departmentId = c.req.param("departmentId");
  if (!departmentId) {
    return c.json(
      {
        success: false,
        message: "Invalid bed info request!",
        error: "Invalid bed info request, department id required.",
      },
      400,
    );
  } else {
    const res = await getBeds(departmentId);
    return c.json({ ...res }, res.success ? 200 : 404);
  }
});

hospital.post("/setBedStatus", async (c) => {
  const body = await c.req.json();
  const departmentId = body.departmentId;
  const bedPos = body.bedPos;
  const status = body.status;
  if (!departmentId || !bedPos || !status) {
    return c.json(
      {
        success: false,
        message: "Invalid bed status request!",
        error:
          "Department ID (number), bed position (number), current status (bool) required.",
      },
      400,
    );
  } else {
    const res = await setBedStatus(departmentId, bedPos, status);
    return c.json({ ...res }, res.success ? 201 : 400);
  }
});

hospital.post("/consultation/create", async (c) => {
  const { hospitalId, doctorId, recurring, slotDuration, startTime, endTime } =
    await c.req.json();

  const res = await createConsultation(
    startTime,
    endTime,
    slotDuration,
    hospitalId,
    doctorId,
    recurring,
  );

  return c.json({ ...res }, res.success ? 201 : 400);
});

hospital.post("/consultation/refresh", async (c) => {
  await refreshConsultations();

  return c.json({ success: true });
});

hospital.post("/consultation/find", async (c) => {
  const body = await c.req.json();
  const { symptoms, lat, long, date } = body;

  if (!symptoms || !lat || !long || !date) {
    return c.json(
      {
        success: false,
        message: "Invalid consultation find request!",
        error:
          "symptoms (string), lat (number), long (number), date (ISO string) required.",
      },
      400,
    );
  }

  const res = await findConsultation(symptoms, lat, long, date);
  return c.json({ ...res }, res.success ? 200 : 404);
});

hospital.post("/consultation/createDiagnosis", async (c) => {
  const {
    consultationId,
    userId,
    hospitalId,
    diagnosis,
    meds = [],
    amount,
    patientName,
  } = await c.req.json();
  if (!consultationId || !userId || !diagnosis || !hospitalId) {
    return c.json(
      {
        success: false,
        message: "Invalid diagnosis request!",
        error:
          "Invalid diagnosis request, consultation ID, user ID & diagnosis required.",
      },
      400,
    );
  } else {
    const res = await createDiagnosis(
      consultationId,
      userId,
      hospitalId,
      diagnosis,
      meds,
    );
    if (res.success) {
      const newTransaction: transaction = {
        diagnosisId: res.result?.insertedId.toString() ?? "",
        hospitalId: hospitalId,
        amount: amount,
        approved: false,
        patientId: userId,
        patientName: patientName,
      };
      const res2 = await createTransaction(newTransaction);
      return c.json({ ...res2 }, res2.success ? 201 : 400);
    }
  }
});

hospital.post("/consultation/getDiagnosis", async (c) => {
  const body = await c.req.json();
  const consultationId = body.consultationId;
  const userId = body.userId;
  if (!consultationId || !userId) {
    return c.json(
      {
        success: false,
        message: "Invalid diagnosis request!",
        error: "Consultation ID (string) & user ID (string) required.",
      },
      400,
    );
  } else {
    const res = await getDiagnosis(consultationId, userId);
    return c.json({ ...res }, res.success ? 200 : 404);
  }
});

hospital.post("/consultation/getUpcomingPatients", async (c) => {
  const { doctorId } = await c.req.json();
  if (!doctorId) {
    return c.json(
      {
        success: false,
        message: "Invalid upcoming patients request!",
        error: "Doctor ID (string) required.",
      },
      400,
    );
  } else {
    const res = await getUpcomingPatients(doctorId);
    return c.json({ ...res }, res.success ? 200 : 404);
  }
});

hospital.post("/consultation/getPastPatients", async (c) => {
  const { doctorId } = await c.req.json();
  if (!doctorId) {
    return c.json(
      {
        success: false,
        message: "Invalid past patients request!",
        error: "Doctor ID (string) required.",
      },
      400,
    );
  } else {
    const res = await getPastPatients(doctorId);
    return c.json({ ...res }, res.success ? 200 : 404);
  }
});

hospital.post("/consultation/getConsultationsinHospital", async (c) => {
  const { hospitalId } = await c.req.json();
  if (!hospitalId) {
    return c.json(
      {
        success: false,
        message: "Invalid consultations request!",
        error: "Hospital ID (string) required.",
      },
      400,
    );
  } else {
    const res = await getConsultationsinHospital(hospitalId);
    return c.json({ ...res }, res.success ? 200 : 404);
  }
});

hospital.post("/consultation/forceSort", async (c) => {
  const { consultationId } = await c.req.json();

  if (!consultationId) {
    return c.json({ success: false, message: "Invalid request" });
  }

  const res = await forceSort(consultationId);

  return c.json({ ...res }, res.success ? 201 : 400);
});

hospital.post("/consultation/get", async (c) => {
  const { consultationId } = await c.req.json();

  if (!consultationId) {
    return c.json(
      {
        success: false,
        message: "Invalid consultation request!",
        error: "Consultation ID (string) required.",
      },
      400,
    );
  }

  const res = await getConsultation(consultationId);

  return c.json({ ...res }, res.success ? 200 : 404);
});

hospital.post("/reviewPatient", async (c) => {
  const body = await c.req.json();
  const { ratedBy, userId, rating, review } = body;

  const res = await reviewPatient(ratedBy, userId, rating, review);
  return c.json({ ...res }, res.success ? 201 : 400);
});

export default hospital;
