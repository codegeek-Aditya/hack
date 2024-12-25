import { ObjectId } from "mongodb";
import { Consultation, Slot } from "../schemas/consultation";
import { getDb } from "./mongodb";
import { DateTime } from "luxon";
import { getHospital } from "./hospital";
import { getUser, getUserById } from "./user";
import { getDepartment } from "./department";
import Gemini from "gemini-ai";
import { error } from "console";

async function createConsultation(
  startTime: string,
  endTime: string,
  slotDuration: number,
  hospitalId: string,
  doctorId: string,
  recurring: boolean,
) {
  const db = await getDb();
  const hospital = await getHospital(hospitalId);
  const doctor = await getUserById(doctorId);
  if (!hospital) {
    return {
      success: false,
      message: "Hospital not found",
      error: "Hospital not found for the given ID",
    };
  }
  if (!doctor) {
    return {
      success: false,
      message: "Doctor not found",
      error: "Doctor not found for the given ID",
    };
  }
  const departmentRes = await getDepartment(doctor.departmentId);
  if (!departmentRes.success) {
    return {
      success: false,
      message: "Doctor's department not found",
      error: `Department not found for the ID ${doctor.departmentId} given in doctor's details`,
    };
  }
  const department = departmentRes.department ?? { name: "" };

  const startUTC = DateTime.fromISO(startTime).toUTC();
  const endUTC = DateTime.fromISO(endTime).toUTC();

  const slots: Slot[] = generateSlots(
    startUTC.toJSDate(),
    endUTC.toJSDate(),
    slotDuration,
  );

  const utcDateTime = DateTime.fromISO(startTime).toUTC();

  const newConsultation: Consultation = {
    hospitalId,
    hospitalName: hospital.name,
    doctorId,
    doctorName: doctor.name,
    speciality: department.name,
    dateTime: utcDateTime.toJSDate(),
    location: hospital.location,
    recurring,
    recurringConfig: {
      paused: false,
      frequency: "Daily",
      nextDateTime: utcDateTime.toJSDate(),
    },
    slots,
    slotDuration,
  };

  const result = await db
    .collection("consultations")
    .insertOne(newConsultation);
  if (result) {
    return {
      success: true,
      message: "Consultation created successfully",
      result: {
        ...result,
        consultation: newConsultation,
      },
    };
  } else {
    return {
      success: false,
      message: "Consultation creation failed",
      error: "Consultation creation failed for some reason",
    };
  }
}

async function analyseSymptoms(symptoms: string) {
  const gemini = new Gemini(process.env.GEMINI_API_KEY || "");
  const res = await gemini.ask(
    `${symptoms}
    These are symptoms that a patient is facing. Return the following required data in only this json, no text
    {"possibleAilment": "", "symptomKeywords":[] (2 or 3 keywords that summarize the input symptoms), "treatmentUrgency": (1-10), "transmittable": (0 or 1), "department": (General Surgery, Medicine, Pediatrics, Gynecology, Orthopedics, Dermatology, Radiology, ENT, Opthalmology, Cardiology, Radiology, Urology)}`,
    {
      temperature: 0.2,
      topP: 1,
    },
  );
  const match = res.match(/{([^}]*)}/);
  if (!match) {
    return {
      success: false,
      message: "Failed to analyse symptoms",
      error: "Gemini AI returned invalid response",
    };
  }
  const resjs = JSON.parse(match[0]);
  //const resjs = JSON.parse(res.replace("```json", "").replace("```", ""));
  if (
    resjs.possibleAilment === undefined ||
    resjs.symptomKeywords === undefined ||
    resjs.treatmentUrgency === undefined ||
    resjs.transmittable === undefined ||
    resjs.department === undefined
  ) {
    return {
      success: false,
      message: "Failed to analyse symptoms",
      error: "Gemini AI returned invalid response",
    };
  }
  return {
    success: true,
    message: "Symptoms analysed successfully!",
    result: resjs,
  };
}

async function findConsultation(
  symptoms: string,
  lat: number,
  long: number,
  date: string,
) {
  const symptomsRes = await analyseSymptoms(symptoms);
  if (!symptomsRes.success) {
    return {
      success: false,
      message: "Failed to find consultations",
      error: "Failed to analyse symptoms",
    };
  }
  console.log(symptomsRes);
  const department = symptomsRes.result.department;
  if (!department) {
    return {
      success: false,
      message: "Failed to find consultations",
      error: "Failed to find department from provided symptoms",
      result: symptomsRes,
    };
  }
  let reference: any;
  if (!date) {
    reference = new Date();
  } else {
    try {
      reference = DateTime.fromISO(date, { zone: "Asia/Kolkata" }).toUTC();
    } catch (error) {
      return {
        success: false,
        message: "Invalid date format",
        error: "Error converting provided date to UTC",
      };
    }
  }
  console.log(reference);
  const db = await getDb();
  const exists = await db.collection("consultations").findOne({
    speciality: department,
    dateTime: { $gt: reference },
  });

  if (!exists) {
    console.log("No consultations found for the given criteria.");
    return {
      success: false,
      message: "Consultations not found",
      error: "Consultations not found for the given speciality for given date",
    };
  }
  const result = await db
    .collection("consultations")
    .aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [long, lat],
          },
          distanceField: "distance",
          spherical: true,
          query: {
            speciality: department,
            dateTime: { $gt: reference },
          },
        },
      },
      {
        $lookup: {
          from: "hospitals",
          let: { hospitalId: { $toString: "$hospitalId" } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [{ $toString: "$_id" }, "$$hospitalId"],
                },
              },
            },
          ],
          as: "hospitalDetails",
        },
      },
      {
        $unwind: {
          path: "$hospitalDetails",
          preserveNullAndEmptyArrays: true, // Keep consultations even if hospital not found
        },
      },
      {
        $project: {
          _id: 1,
          hospitalId: 1,
          hospitalName: 1,
          doctorId: 1,
          doctorName: 1,
          speciality: 1,
          dateTime: 1,
          location: 1,
          recurring: 1,
          recurringConfig: 1,
          slots: 1,
          slotDuration: 1,
          distance: 1,
          hospitalRating: { $ifNull: ["$hospitalDetails.rating", null] },
        },
      },
    ])
    .toArray();
  if (result && result.length > 0) {
    return {
      success: true,
      message: "Consultations found",
      result: result,
      analysis: symptomsRes.result,
    };
  } else {
    return {
      success: false,
      message: "Consultations not found",
      error: "Consultations not found for the given speciality for given date",
    };
  }
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const R = 6371;
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2 - lat1);
  const Δλ = toRadians(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function generateSlots(start: Date, end: Date, duration: number): Slot[] {
  const slots: Slot[] = [];
  let currentTime = new Date(start);

  while (currentTime < end) {
    const nextTime = new Date(currentTime.getTime() + duration * 60000);
    slots.push({
      notified: false,
      elapsed: false,
      users: [],
      onlineCount: 0,
      startTime: new Date(currentTime),
      endTime: new Date(nextTime),
    });
    console.log("pushed to slots", {
      notified: false,
      elapsed: false,
      users: [],
      onlineCount: 0,
      startTime: new Date(currentTime).toISOString(),
      endTime: new Date(nextTime).toISOString(),
    });
    currentTime = nextTime;
  }

  return slots;
}

async function refreshConsultations() {
  const db = await getDb();
  const currentDate = new Date();

  const consultations = await db.collection("consultations").find({}).toArray();

  for (const consultation of consultations) {
    const updatedSlots = [];

    // Process slots for notifications and elapsed status
    for (const slot of consultation.slots) {
      const slotStartTime = new Date(slot.startTime);
      const slotEndTime = new Date(slot.endTime);

      // Check for slots about to start within one hour
      if (
        !slot.notified &&
        slotStartTime > currentDate &&
        slotStartTime <= new Date(currentDate.getTime() + 60 * 60 * 1000)
      ) {
        // Notify users of the upcoming slot
        const userIdsToNotify = slot.users.map(
          (user: { userId: any }) => user.userId,
        );
        await notify(userIdsToNotify);
        slot.notified = true;
      }

      // Mark slots that have already passed
      if (slotEndTime <= currentDate) {
        slot.elapsed = true;
      }

      updatedSlots.push(slot);
    }

    // Update the consultation with the modified slots
    await db
      .collection("consultations")
      .updateOne({ _id: consultation._id }, { $set: { slots: updatedSlots } });

    // Handle recurring consultations
    if (consultation.recurring) {
      const recurringConfig = consultation.recurringConfig;
      if (!recurringConfig.paused && recurringConfig.nextDateTime) {
        const nextDate = new Date(recurringConfig.nextDateTime);

        if (nextDate <= currentDate) {
          const newStart = nextDate;
          const newEnd = new Date(
            newStart.getTime() +
              consultation.slotDuration * consultation.slots.length * 60000,
          );
          const newSlots = generateSlots(
            newStart,
            newEnd,
            consultation.slotDuration,
          );

          // Insert the new consultation
          await db.collection("consultations").insertOne({
            ...consultation,
            _id: undefined, // Let MongoDB generate a new ID
            dateTime: newStart,
            slots: newSlots,
          });

          // Update the nextDateTime in the recurringConfig
          let nextFrequencyDate;
          switch (recurringConfig.frequency) {
            case "Daily":
              nextFrequencyDate = new Date(
                newStart.getTime() + 24 * 60 * 60 * 1000,
              );
              break;
            case "Weekly":
              nextFrequencyDate = new Date(
                newStart.getTime() + 7 * 24 * 60 * 60 * 1000,
              );
              break;
            case "Monthly":
              nextFrequencyDate = new Date(
                newStart.setMonth(newStart.getMonth() + 1),
              );
              break;
            default:
              nextFrequencyDate = null;
          }

          await db
            .collection("consultations")
            .updateOne(
              { _id: consultation._id },
              { $set: { "recurringConfig.nextDateTime": nextFrequencyDate } },
            );
        }
      }
    }
  }
}

async function sortConsultationSlotUsers(
  consultationId: string,
  slotIndex: number,
) {
  const db = await getDb();

  // Fetch the specific consultation by its ID
  const consultation = await db.collection("consultations").findOne({
    _id: new ObjectId(consultationId),
  });

  if (!consultation) {
    return {
      success: false,
      message: "Consultation not found",
    };
  }

  // Validate slot index
  if (slotIndex < 0 || slotIndex >= consultation.slots.length) {
    return {
      success: false,
      message: "Invalid slot index",
    };
  }

  // Sort users in the specified slot based on priority
  consultation.slots[slotIndex].users.sort(
    (a: { priority: number }, b: { priority: number }) =>
      a.priority - b.priority,
  );

  // Update the consultation in the database with the sorted users
  await db
    .collection("consultations")
    .updateOne(
      { _id: new ObjectId(consultationId) },
      { $set: { slots: consultation.slots } },
    );

  return {
    success: true,
    message: "Slot users sorted successfully",
  };
}

function calculateNextDate(currentDateISO: string, frequency: string): string {
  const nextDate = DateTime.fromISO(currentDateISO).setZone("Asia/Kolkata");
  let updatedDate: DateTime;

  switch (frequency) {
    case "Daily":
      updatedDate = nextDate.plus({ days: 1 });
      break;
    case "Weekly":
      updatedDate = nextDate.plus({ weeks: 1 });
      break;
    case "Monthly":
      updatedDate = nextDate.plus({ months: 1 });
      break;
    case "Yearly":
      updatedDate = nextDate.plus({ years: 1 });
      break;
    default:
      updatedDate = nextDate;
  }
  return updatedDate.toISO() ?? currentDateISO;
}

function notify(users: { userId: string; priority: number }[]) {
  console.log("Notifying users:", users);
}

async function diagnosedPatient(consultationId: string, patientId: string) {
  const db = await getDb();

  const consultation = await db.collection("consultations").findOne({
    _id: new ObjectId(consultationId),
    "slots.users.userId": patientId,
  });

  console.log(consultation);

  if (!consultation) {
    return {
      success: false,
      message: "Patient not found in consultation",
      error: "Could not find patient in any slot of the consultation",
    };
  }

  const slotIndex = consultation.slots.findIndex(
    (slot: { users: { userId: string }[] }) =>
      slot.users.some((user) => user.userId === patientId),
  );

  const result = await db.collection("consultations").updateOne(
    {
      _id: new ObjectId(consultationId),
      "slots.users.userId": patientId,
    },
    {
      $set: {
        [`slots.${slotIndex}.users.$[userElem].diagnosed`]: true,
      },
    },
    {
      arrayFilters: [{ "userElem.userId": patientId }],
    },
  );

  if (result.modifiedCount > 0) {
    return {
      success: true,
      message: "Patient diagnosed status initialized successfully",
    };
  }

  return {
    success: false,
    message: "Failed to initialize patient diagnosed status",
    error: "Database update failed",
  };
}

async function createDiagnosis(
  consultationId: string,
  patientId: string,
  hospitalId: string,
  diagnosis: string,
  meds: { consumableId: string; qty: number; notes: string }[],
) {
  const db = await getDb();

  const medsWithNames = await Promise.all(
    meds.map(async (med) => {
      const consumable = await db
        .collection("inventory")
        .findOne({ _id: new ObjectId(med.consumableId) });
      await db
        .collection("inventory")
        .updateOne(
          { _id: new ObjectId(med.consumableId) },
          { $inc: { quantity: -med.qty } },
        );
      return {
        ...med,
        name: consumable?.name || "Unknown",
      };
    }),
  );

  const resulty = diagnosedPatient(consultationId, patientId);

  console.log(resulty);

  const diagnosisObj = {
    consultationId,
    patientId,
    diagnosis,
    meds: medsWithNames,
  };
  const result = await db.collection("diagnosis").insertOne(diagnosisObj);
  if (result) {
    return {
      success: true,
      message: "Diagnosis added successfully",
      result: {
        ...result,
        diagnosis: diagnosisObj,
      },
    };
  } else {
    return {
      success: false,
      message: "Diagnosis addition failed",
      error: "Diagnosis addition failed for some reason",
    };
  }
}

async function getDiagnosis(consultationId: string, userId: string) {
  const db = await getDb();
  const result = await db
    .collection("diagnosis")
    .findOne({ consultationId: consultationId, userId: userId });
  if (result) {
    return {
      success: true,
      message: "Diagnosis found",
      result: result,
    };
  } else {
    return {
      success: false,
      message: "Diagnosis not found",
      error: "Diagnosis not found for the given consultation ID & user ID",
    };
  }
}

async function forceSort(consultationId: string) {
  try {
    const db = await getDb();
    const consultation = await db
      .collection("consultations")
      .findOne({ _id: new ObjectId(consultationId) });

    if (!consultation) {
      return {
        success: false,
        message: "Consultation not found",
        error: "Consultation not found for the given ID",
      };
    }

    const sortedSlots = consultation.slots.map((slot: { users: any }) => {
      const sortedUsers = [...slot.users].sort(
        (a, b) => b.priority - a.priority,
      );
      return {
        ...slot,
        users: sortedUsers,
      };
    });

    const result = await db
      .collection("consultations")
      .updateOne(
        { _id: new ObjectId(consultationId) },
        { $set: { slots: sortedSlots } },
      );

    return {
      success: true,
      message: "Forced sort successful",
      result,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to force sort",
      error: error,
    };
  }
}

async function getConsultation(consultationId: string) {
  const db = await getDb();
  const result = await db
    .collection("consultations")
    .findOne({ _id: new ObjectId(consultationId) });
  if (result) {
    return {
      success: true,
      message: "Consultation found",
      result: result,
    };
  } else {
    return {
      success: false,
      message: "Consultation not found",
      error: "Consultation not found for the given ID",
    };
  }
}

async function getConsultationsinHospital(hospitalId: string) {
  const db = await getDb();
  const result = await db
    .collection("consultations")
    .find({ hospitalId })
    .toArray();

  if (result && result.length > 0) {
    const userIds = new Set<string>();
    result.forEach((consultation) => {
      consultation.slots.forEach((slot: { users: { userId: string }[] }) => {
        slot.users.forEach((user) => {
          userIds.add(user.userId);
        });
      });
    });

    // Fetch all users in one query
    const users = await db
      .collection("users")
      .find({
        _id: { $in: Array.from(userIds).map((id) => new ObjectId(id)) },
      })
      .toArray();

    // Create a map for quick user lookup
    const userMap = new Map(users.map((user) => [user._id.toString(), user]));

    // Add user names to each slot's users
    const consultationsWithNames = result.map((consultation) => ({
      ...consultation,
      slots: consultation.slots.map(
        (slot: { users: { userId: string }[] }) => ({
          ...slot,
          users: slot.users.map((user) => ({
            ...user,
            name: userMap.get(user.userId.toString())?.name || "Unknown User",
          })),
        }),
      ),
    }));

    return {
      success: true,
      message: "Consultations found!",
      result: consultationsWithNames,
    };
  } else {
    return {
      success: false,
      message: "Consultations not found",
      error: "Consultations not found for the given hospital ID!",
    };
  }
}

async function getUpcomingPatients(doctorId: string) {
  const db = await getDb();

  const consultations = await db
    .collection("consultations")
    .find({ doctorId, dateTime: { $gt: new Date() } })
    .toArray();

  if (!consultations || consultations.length === 0) {
    return {
      success: false,
      message: "No consultations found!",
      error: "No consultations found for this doctor",
    };
  }

  const patients = [];
  const userIds = new Set<string>();

  for (const consultation of consultations) {
    consultation.slots.forEach((slot: { users: { userId: string }[] }) => {
      slot.users.forEach((user: { userId: string; diagnosed?: boolean }) => {
        if (!user.diagnosed) {
          userIds.add(user.userId);
        }
      });
    });
  }

  console.log(userIds);

  const users = await db
    .collection("users")
    .find({
      _id: {
        $in: Array.from(userIds).map((id) => new ObjectId(id.toString())),
      },
    })
    .toArray();

  const userMap = new Map(users.map((user) => [user._id.toString(), user]));
  console.log(userMap);

  for (const consultation of consultations) {
    const consultationId = consultation._id;
    const dateTime = consultation.dateTime;

    for (const slot of consultation.slots) {
      for (const userr of slot.users) {
        if (!userr.diagnosed) {
          console.log(userMap.get(userr.userId.toString()));
          const user = userMap.get(userr.userId.toString());
          patients.push({
            consultationId,
            dateTime,
            userId: userr.userId,
            symptomKeywords: userr.symptomKeywords,
            possibleAilment: userr.possibleAilment,
            name: user?.name || "Unknown User",
            user: user,
          });
        }
      }
    }
  }

  if (patients.length === 0) {
    return {
      success: false,
      message: "No patients found for past consultations",
      error: "No patients found for past consultations",
    };
  }

  return { success: true, message: "Upcoming patients found!", patients };
}

async function getPastPatients(doctorId: string) {
  const db = await getDb();

  // Find consultations that are either past OR have diagnosed patients
  const consultations = await db
    .collection("consultations")
    .find({
      doctorId,
      $or: [
        { dateTime: { $lt: new Date() } },
        { "slots.users.diagnosed": true },
      ],
    })
    .toArray();

  if (!consultations || consultations.length === 0) {
    return {
      success: false,
      message: "No past consultations found!",
      error: "No past consultations found for this doctor",
    };
  }

  const patients = [];
  const userIds = new Set<string>();

  // Collect diagnosed patients and past consultation patients
  for (const consultation of consultations) {
    const isPastConsultation = new Date(consultation.dateTime) < new Date();

    consultation.slots.forEach(
      (slot: { users: { userId: string; diagnosed?: boolean }[] }) => {
        slot.users.forEach((user) => {
          // Include user if consultation is past OR user is diagnosed
          if (isPastConsultation || user.diagnosed) {
            userIds.add(user.userId);
          }
        });
      },
    );
  }

  // Fetch all users in one query
  const users = await db
    .collection("users")
    .find({
      _id: { $in: Array.from(userIds).map((id) => new ObjectId(id)) },
    })
    .toArray();

  // Create a map for quick user lookup
  const userMap = new Map(users.map((user) => [user._id.toString(), user]));

  for (const consultation of consultations) {
    const consultationId = consultation._id;
    const dateTime = consultation.dateTime;
    const isPastConsultation = new Date(dateTime) < new Date();

    for (const slot of consultation.slots) {
      for (const user of slot.users) {
        // Include user if consultation is past OR user is diagnosed
        if (isPastConsultation || user.diagnosed) {
          const userDetails = userMap.get(user.userId.toString());
          patients.push({
            consultationId,
            dateTime,
            userId: user.userId,
            name: userDetails?.name || "Unknown User",
            symptomKeywords: user.symptomKeywords,
            possibleAilment: user.possibleAilment,
            diagnosed: user.diagnosed || false,
            user: userDetails,
          });
        }
      }
    }
  }

  if (patients.length === 0) {
    return {
      success: false,
      message: "No patients found for past consultations",
      error: "No patients found for past consultations",
    };
  }

  return {
    success: true,
    message: "Past patients found!",
    patients,
  };
}

export {
  getConsultation,
  createConsultation,
  findConsultation,
  generateSlots,
  refreshConsultations,
  notify,
  createDiagnosis,
  getDiagnosis,
  getUpcomingPatients,
  getPastPatients,
  getConsultationsinHospital,
  forceSort,
};
