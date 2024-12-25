import { getDb } from "./mongodb";
import { userSchema, type user } from "../schemas/user";
import { z } from "zod";
import { ObjectId } from "mongodb";
import Gemini from "gemini-ai";
import { error } from "console";

async function getUser(phone: string) {
  const db = await getDb();
  const user = await db.collection("users").findOne({ phone });
  if (user) {
    return user;
  }
}

async function getUserById(id: string) {
  const db = await getDb();
  const user = await db.collection("users").findOne({ _id: new ObjectId(id) });
  if (user) {
    return user;
  }
}

async function getDoctorByHospitalId(hospitalId: string) {
  const db = await getDb();
  const users = await db
    .collection("users")
    .find({ hospitalId: hospitalId, tier: 1 })
    .toArray();
  if (users && users.length > 0) {
    return {
      success: true,
      message: "Doctors found!",
      doctors: users,
    };
  } else {
    return {
      success: true,
      message: "Doctors not found!",
      error: "Doctors not found for given hospital Id",
    };
  }
}

export async function getAllUsers() {
  const db = await getDb();
  try {
    const users = await db.collection("users").find({}).toArray();
    return users.map((user) => ({
      ...user,
      _id: user._id.toString(),
    }));
  } catch (error) {
    throw new Error("Failed to fetch users");
  }
}

async function createUser(newUser: user) {
  const db = await getDb();
  const existing = await getUser(newUser.phone);
  if (existing) {
    return {
      success: false,
      message: "User with phone number already exists!",
    };
  }
  try {
    userSchema.parse(newUser);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        success: false,
        message: "User object validation failed!",
        error: err.errors,
      };
    }
  }
  const result = await db.collection("users").insertOne(newUser);
  if (result) {
    return {
      success: true,
      message: "User created successfully!",
      result: {
        ...result,
        user: newUser,
      },
    };
  }
}

async function login(phone: string) {
  const user = await getUser(phone);
  if (!user) {
    return {
      success: false,
      message: "User not found",
      error: "User with given phone not found in db",
    };
  } else {
    /*if (user.tier > 0) {
      return {
        success: false,
        message: "Staff user should login through staff login!",
        error: "Staff login needs to login using email ID and password",
      };
    }*/
    const otpId = "id"; //await sendOtp(inputPhone);
    if (otpId) {
      return {
        success: true,
        message: "Login successful & OTP sent to Whatsapp!",
        otpId: otpId,
        user: user,
      };
    } else {
      return {
        success: false,
        message: "Login successful but OTP could not be sent!",
        error: "OTP sending failed for some reason",
      };
    }
  }
}

async function getStaff(email: string) {
  const db = await getDb();
  const staff = await db
    .collection("users")
    .findOne({ email, tier: { $gt: 0 } });
  if (staff) {
    return staff;
  }
}

async function loginStaff(email: string, password: string) {
  const staff = await getStaff(email);
  if (!staff) {
    return {
      success: false,
      message: "Staff with specified email not found!",
    };
  }
  if (staff.password === password) {
    return {
      success: true,
      message: "Staff login successful",
      user: staff,
    };
  }
}

async function createStaff(newUser: user) {
  const db = await getDb();
  const existing = await getUser(newUser.email);
  if (existing) {
    return {
      success: false,
      message: "Staff User with that email already exists!",
    };
  }
  try {
    userSchema.parse(newUser);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        success: false,
        message: "Staff User object validation failed!",
        error: err.errors,
      };
    }
  }
  const result = await db.collection("users").insertOne(newUser);
  if (result) {
    return {
      success: true,
      message: "Staff User created successfully!",
      result: {
        ...result,
        user: newUser,
      },
    };
  }
}

function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  // Adjust age if birthday hasn't occurred this year
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

async function bookAppointment(
  consultationId: string,
  slotIndex: number,
  userId: string,
  symptomKeywords: string[],
  possibleAilment: string,
  illness_severity: number,
  transmittable: boolean,
  online: boolean,
) {
  const userRes = await getUserById(userId);
  if (!userRes) return { success: false, message: "User not found" };
  const user = userRes;
  let disabled = 1;
  if (!user.udid || user.udid === "") {
    disabled = 0;
  }

  const url = `${process.env.ML_URL}/opd_priority`;
  const payload = {
    illness_severity: illness_severity,
    age: calculateAge(user.dob),
    transmittable: transmittable,
    disabled: disabled,
    patient_rating: user.rating,
  };

  console.log(payload);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return {
        success: false,
        message: "Failed to analyse symptoms",
        error: "Failed to analyse symptoms",
      };
    }
    const result = await response.json();
    console.log(result);
    const priority = result.priority;
    const db = await getDb();
    const consultation = await db
      .collection("consultations")
      .findOne({ _id: new ObjectId(consultationId) });

    if (!consultation)
      return { success: false, message: "Consultation not found" };

    const slot = consultation.slots[slotIndex];
    if (slot.users.length >= 5) return { success: false, message: "Slot full" };

    if (online && slot.onlineCount >= 3)
      return { success: false, message: "Online booking limit reached" };

    slot.users.push({
      userId,
      priority,
      symptomKeywords: symptomKeywords,
      possibleAilment,
      diagnosed: false,
    });

    slot.users.sort((a: any, b: any) => b.priority - a.priority);

    const res = await db.collection("consultations").updateOne(
      { _id: new ObjectId(consultationId) },
      {
        $set: {
          [`slots.${slotIndex}.users`]: slot.users,
          [`slots.${slotIndex}.onlineCount`]: online
            ? (slot.onlineCount || 0) + 1
            : slot.onlineCount,
        },
      },
    );

    if (res.modifiedCount > 0) {
      return {
        success: true,
        message: "Booking successful!",
      };
    } else {
      return {
        success: false,
        message: "Failed to book slot",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to book slot",
    };
  }
}

async function hasUserBookedAppointment(
  userId: string,
  referenceDate: Date = new Date(),
) {
  const db = await getDb();
  const appointment = await db.collection("consultations").findOne({
    "slots.users.userId": userId,
    "slots.startTime": { $gt: referenceDate },
  });

  if (!appointment) {
    return {
      success: false,
      message: "User has not booked any upcoming appointments",
    };
  }

  return {
    success: true,
    message: "User has booked an upcoming appointment",
  };
}

async function getUpcomingAppointments(
  userId: string,
  referenceDate: Date = new Date(),
) {
  const db = await getDb();
  const res = await db
    .collection("consultations")
    .aggregate([
      {
        $match: {
          "slots.users.userId": userId,
        },
      },
      {
        $unwind: "$slots",
      },
      {
        $match: {
          "slots.users.userId": userId,
          "slots.startTime": { $gt: referenceDate },
        },
      },
      {
        $addFields: {
          userPosition: {
            $add: [
              {
                $indexOfArray: ["$slots.users.userId", userId],
              },
              1,
            ],
          },
        },
      },
      {
        $project: {
          consultationId: "$_id",
          hospitalName: 1,
          doctorName: 1,
          speciality: 1,
          dateTime: 1,
          slotStartTime: "$slots.startTime",
          slotEndTime: "$slots.endTime",
          slotUsers: "$slots.users",
          onlineCount: "$slots.onlineCount",
          userPosition: 1,
        },
      },
    ])
    .toArray();

  if (!res || res.length === 0) {
    return {
      success: false,
      message: "No upcoming appointments found",
    };
  }

  return {
    success: true,
    message: "Upcoming appointments found",
    appointments: res,
  };
}

async function getPastAppointments(
  userId: string,
  referenceDate: Date = new Date(),
) {
  const db = await getDb();
  const res = await db
    .collection("consultations")
    .aggregate([
      {
        $match: {
          "slots.users.userId": userId,
        },
      },
      {
        $unwind: "$slots",
      },
      {
        $match: {
          "slots.users.userId": userId,
          "slots.startTime": { $lte: referenceDate },
        },
      },
      {
        $lookup: {
          from: "users",
          let: { userId: { $toObjectId: userId } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$userId"] },
              },
            },
            {
              $project: {
                name: 1,
              },
            },
          ],
          as: "userInfo",
        },
      },
      {
        $project: {
          consultationId: "$_id",
          hospitalName: 1,
          doctorName: 1,
          speciality: 1,
          dateTime: 1,
          slotStartTime: "$slots.startTime",
          slotEndTime: "$slots.endTime",
          slotUsers: "$slots.users",
          onlineCount: "$slots.onlineCount",
          userName: { $arrayElemAt: ["$userInfo.name", 0] },
        },
      },
    ])
    .toArray();

  if (!res || res.length === 0) {
    return {
      success: false,
      message: "No past appointments found",
    };
  }
  return {
    success: true,
    message: "Past appointments found",
    appointments: res,
  };
}

function randomInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export {
  getUser,
  getUserById,
  getDoctorByHospitalId,
  login,
  createUser,
  getStaff,
  loginStaff,
  createStaff,
  bookAppointment,
  hasUserBookedAppointment,
  getUpcomingAppointments,
  getPastAppointments,
  calculateAge,
};
