import { getDb } from "./mongodb";
import { hospitalSchema, type hospital } from "../schemas/hospital";
import { departmentSchema, type department } from "../schemas/department";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { getDepartmentByName } from "./department";

async function getAllHospitals() {
  const db = await getDb();
  const hospitals = await db.collection("hospitals").find().toArray();
  if (hospitals) {
    return hospitals;
  }
}

async function getNearbyHospitals(lat: number, long: number) {
  const db = await getDb();
  const hospitals = await db
    .collection("hospitals")
    .find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [long, lat],
          },
          //$maxDistance: 5000, // Optional: limit to 5km
        },
      },
    })
    .limit(10)
    .toArray();
  if (hospitals) {
    return hospitals;
  }
}

async function getHospital(id: string) {
  const db = await getDb();
  try {
    const objid = new ObjectId(id);
    const hospital = await db.collection("hospitals").findOne({ _id: objid });
    if (hospital) {
      return hospital;
    }
  } catch (err) {
    return;
  }
}

async function getDepartment(id: string) {
  const db = await getDb();
  try {
    const objid = new ObjectId(id);
    const hospital = await db.collection("hospitals").findOne({
      departments: {
        $elemMatch: { _id: objid },
      },
    });
    if (hospital) {
      return hospital.departments.find((dep: any) =>
        dep._id.equals(new ObjectId(objid)),
      );
    }
  } catch (err) {
    return;
  }
}

async function createHospital(newHospital: hospital) {
  const db = await getDb();
  const existing = await db
    .collection("hospitals")
    .findOne({ name: newHospital.name });
  if (existing) {
    return {
      success: false,
      message: "Hospital with name already exists",
      error: "Hospital with given name already exists in db",
    };
  }
  const hosobj = {
    ...newHospital,
    cases: [],
  };
  try {
    hospitalSchema.parse(hosobj);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        success: false,
        message: "Hospital object validation failed",
        error: err.errors,
      };
    }
  }
  const result = await db.collection("hospitals").insertOne(hosobj);
  if (result) {
    return {
      success: true,
      message: "Hospital created successfully",
      response: {
        ...result,
        hospital: hosobj,
      },
    };
  } else {
    return {
      success: false,
      message: "Hospital creation failed",
      error: "Hospital creation failed for some reason",
    };
  }
}

async function createDepartment(hospitalId: string, newDepartment: department) {
  const db = await getDb();
  const existing = await getDepartmentByName(hospitalId, newDepartment.name);
  if (existing) {
    return {
      success: false,
      message: "Department with this name in this hospital already exists!",
      error:
        "Department with given name already exists in given hospital in db",
    };
  }
  try {
    departmentSchema.parse(newDepartment);
  } catch (err) {
    if (err instanceof z.ZodError) {
      const res = {
        success: false,
        message: "Department object validation failed!",
        error: err.errors,
      };
      return res;
    }
  }
  const final = {
    _id: new ObjectId(),
    ...newDepartment,
  };
  const result = await db
    .collection<hospital>("hospitals")
    .updateOne(
      { _id: new ObjectId(hospitalId) },
      { $push: { departments: final } },
    );
  if (result) {
    return {
      success: true,
      message: "Department created successfully!",
      result: {
        ...result,
        department: final,
      },
    };
  } else {
    return {
      success: false,
      message: "Department creation failed",
      error: "Department creation failed for some reason",
    };
  }
}

async function updateHospital(hospitalId: string, newHospital: any) {
  const db = await getDb();
  const existing = await getHospital(hospitalId);
  if (!existing) {
    return {
      val: false,
      message: "Hospital not found",
    };
  }
  const hosobj = {
    ...existing,
    ...newHospital,
  };
  try {
    hospitalSchema.parse(hosobj);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        val: false,
        message: "Hospital object validation failed",
        errors: err.errors,
      };
    }
  }
  const result = await db
    .collection("hospitals")
    .updateOne({ _id: new ObjectId(hospitalId) }, { $set: hosobj });
  if (result) {
    return {
      val: true,
      ...result,
    };
  }
}

async function addBeds(departmentId: string, qty: number) {
  const db = await getDb();
  const existing = await getDepartment(departmentId);
  if (!existing) {
    return {
      success: false,
      message: "Department not found",
      error: "Department with given ID not found in db",
    };
  }
  const newBeds = existing.beds.concat(Array(qty).fill(0));
  const result = await db
    .collection("hospitals")
    .updateOne(
      { departments: { $elemMatch: { _id: new ObjectId(departmentId) } } },
      { $set: { "departments.$.beds": newBeds } },
    );
  if (result) {
    return {
      success: true,
      message: "Beds added successfully!",
      result: {
        ...result,
        beds: newBeds,
      },
    };
  } else {
    return {
      success: false,
      message: "Beds addition failed",
      error: "Beds addition failed for some reason",
    };
  }
}

async function getBeds(departmentId: string) {
  const db = await getDb();
  const existing = await getDepartment(departmentId);
  if (!existing) {
    return {
      success: false,
      message: "Department not found",
      error: "Department with given ID not found in db",
      id: departmentId,
    };
  }
  return {
    success: true,
    message: "Beds found",
    beds: existing.beds,
  };
}

async function getBedStatus(departmentId: string, bedPos: number) {
  const db = await getDb();
  const existing = await getDepartment(departmentId);
  if (!existing) {
    return {
      success: false,
      message: "Department not found",
      error: "Department with given ID not found in db",
    };
  }
  if (existing.beds[bedPos] == 0) {
    return {
      success: true,
      message: "Bed is vacant",
    };
  } else if (existing.beds[bedPos] == 1) {
    return {
      success: true,
      message: "Bed is occupied",
    };
  } else {
    return {
      success: false,
      message: "Bed not found...?",
    };
  }
}

async function setBedStatus(
  departmentId: string,
  bedPos: number,
  status: boolean,
) {
  const db = await getDb();
  const existing = await getDepartment(departmentId);
  if (!existing) {
    return {
      success: false,
      message: "Department not found",
      error: "Department with given ID not found in db",
    };
  }
  const newBeds = existing.beds;
  newBeds[bedPos] = status ? 1 : 0;
  const result = await db
    .collection("hospitals")
    .updateOne(
      { departments: { $elemMatch: { _id: new ObjectId(departmentId) } } },
      { $set: { "departments.$.beds": newBeds } },
    );
  if (result) {
    return {
      success: true,
      message: "Bed status updated successfully",
      updatedBeds: newBeds,
      result: {
        ...result,
      },
    };
  } else {
    return {
      success: false,
      message: "Bed status update failed",
      error: "Bed status update failed for some reason",
    };
  }
}

export {
  getAllHospitals,
  getHospital,
  createDepartment,
  createHospital,
  updateHospital,
  addBeds,
  getBeds,
  getBedStatus,
  setBedStatus,
  getNearbyHospitals,
};
