import { getDb } from "./mongodb";
import { departmentSchema, type department } from "../schemas/department";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { type response } from "../schemas/response";

async function getDepartment(departmentId: string) {
  const db = await getDb();
  const hospital = await db.collection("hospitals").findOne(
    {
      departments: { $elemMatch: { _id: new ObjectId(departmentId) } },
    },
    {
      projection: { "departments.$": 1 },
    },
  );

  if (hospital && hospital.departments && hospital.departments.length > 0) {
    return {
      success: true,
      message: "Department found",
      department: hospital.departments[0],
    };
  } else {
    return {
      success: false,
      message: "Department not found",
      error: "Department with the given ID not found in any hospital",
    };
  }
}

async function getDepartmentByName(hospitalId: string, name: string) {
  const db = await getDb();
  const department = await db.collection("hospitals").findOne({
    _id: new ObjectId(hospitalId),
    departments: { $elemMatch: { name } },
  });
  if (department) {
    return department;
  }
}

async function createDepartment(newDepartment: department) {
  const db = await getDb();
  try {
    departmentSchema.parse(newDepartment);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        success: false,
        message: "Department object validation failed",
        error: err.errors,
      };
    }
  }
  const result = await db.collection("departments").insertOne(newDepartment);
  if (result) {
    return {
      success: false,
      message: "Department created successfully",
      department: newDepartment,
      result: {
        ...result,
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

async function updateDepartment(
  departmentId: string,
  newDepartment: department,
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
  const depobj = {
    ...existing,
    ...newDepartment,
  };
  try {
    departmentSchema.parse(depobj);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        success: false,
        message: "Department object validation failed",
        error: err.errors,
      };
    }
  }
  const result = await db
    .collection("hospitals")
    .updateOne({ _id: new ObjectId(departmentId) }, { $set: depobj });
  if (result) {
    return {
      success: true,
      message: "Department updated successfully",
      department: newDepartment,
      result: {
        ...result,
      },
    };
  } else {
    return {
      success: false,
      message: "Department update failed",
      error: "Department update failed for some reason",
    };
  }
}

export {
  getDepartment,
  getDepartmentByName,
  createDepartment,
  updateDepartment,
};
