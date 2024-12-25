import { ObjectId, PullOperator, PushOperator } from "mongodb";
import { Case, caseSchema } from "../schemas/case";
import { getDb } from "./mongodb";
import { z } from "zod";
import { getDepartment, getDepartmentByName } from "./department";
import { getBeds, getHospital, setBedStatus } from "./hospital";
import { calculateAge, getUserById } from "./user";

async function getAllCase() {
  const db = await getDb();
  const Cases = await db.collection("cases").find().toArray();
  if (Cases) {
    return Cases;
  }
}

async function getCaseById(id: ObjectId) {
  const db = await getDb();
  const cases = await db.collection("cases").findOne({ _id: id });
  if (cases) {
    return cases;
  }
}

async function createCase(
  newCase: Case,
  illness_severity: number,
  transmittable: number,
  doctorOffset: number,
) {
  const db = await getDb();
  const user = await getUserById(newCase.userId);
  if (!user) {
    return {
      success: false,
      message: "User not found",
      error: "User with the given ID not found",
    };
  }
  const disabled = user.udid.length < 18 ? 0 : 1;
  //const department = await getDepartmentByName(newCase.hospitalId);
  /*if (!department) {
    return {
      success: false,
      message: "Department not found",
      error: "Department with the given speciality not found in the hospital",
    };
  }*/

  const url = `${process.env.ML_URL}/bed_priority`;
  const payload = {
    illness_severity: illness_severity,
    age: calculateAge(user.dob),
    transmittable: transmittable,
    disabled: disabled,
    patient_rating: user.rating,
    doctor_offset: doctorOffset,
    waiting_period: 0,
  };
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json();

  const departmentRes = await getDepartment(newCase.departmentId);
  const department = departmentRes.department;

  const bedsRes = await getBeds(newCase.departmentId.toString());
  const beds = bedsRes.beds;

  const bedIndex = beds.indexOf(0);
  if (bedIndex !== -1) {
    await setBedStatus(newCase.departmentId, bedIndex.toString(), true);
  } else {
    department.waitlist.push({
      userId: newCase.userId,
      priority: data.priority,
    });
    department.waitlist.sort((a: any, b: any) => a.priority - b.priority);
    await db.collection("hospitals").updateOne(
      { "departments._id": newCase.departmentId },
      {
        $set: {
          "departments.$.waitlist": department.waitlist,
        },
      },
    );
  }

  const caseObj: Case = {
    hospitalId: newCase.hospitalId,
    departmentId: newCase.departmentId,
    userId: newCase.userId,
    bedIndex: newCase.bedIndex,
    userName: newCase.userName,
    ailment: newCase.ailment,
    documents: newCase.documents,
    prescriptions: newCase.prescriptions,
    doctorId: newCase.doctorId,
    doctorName: newCase.doctorName,
    resolved: newCase.resolved,
    admittedAt: newCase.admittedAt,
    dischargedAt: newCase.dischargedAt,
  };

  try {
    caseSchema.parse(caseObj);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        val: false,
        message: "Case object validation failed",
        errors: err.errors,
      };
    }
  }
  const result = await db
    .collection("cases")
    .insertOne(caseObj)
    /*.then(async (data) => {
      await updateHopitalAndUsers(
        newCase.departmentId,
        newCase.userId.toString(),
        data.insertedId.toString(),
      );
      return data;
    })*/
    .catch((err) => {
      return {
        val: false,
        message: "Case creation failed",
        error: err,
      };
    });

  if (result) {
    return {
      success: true,
      message: "Case created successfully!",
      ...result,
    };
  }
}

async function updateHopitalAndUsers(
  departmentId: string,
  userId: string,
  caseId: string,
) {
  const db = await getDb();
  const hospital = await db.collection("hospitals").updateOne(
    {
      "departments._id": new ObjectId(departmentId),
    },
    {
      $push: {
        "departments.$.cases": new ObjectId(caseId),
      } as PushOperator<unknown>,
    },
  );
  if (hospital.modifiedCount !== 0) {
    try {
      await db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        {
          $push: {
            cases: new ObjectId(caseId),
          } as PushOperator<unknown>,
        },
      );
    } catch (err) {
      return {
        val: false,
        message: "User case field update failed",
        error: err,
      };
    }
  }
}

async function deleteCaseById(id: ObjectId) {
  const db = await getDb();
  const result = await db
    .collection("users")
    .deleteOne({ _id: id })
    .then(async (data) => {
      if (data.deletedCount === 1) {
        const updated = await db.collection("cases").updateOne(
          { "prescription._id": id },
          {
            $pull: {
              prescription: {
                _id: id,
              },
            } as PullOperator<unknown>,
          },
        );
        return {
          val: true,
          updated,
        };
      }
    });
  if (result) {
    return result;
  }
}

export { getAllCase, getCaseById, createCase, deleteCaseById };
