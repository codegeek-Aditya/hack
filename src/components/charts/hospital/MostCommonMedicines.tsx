"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

const commonMedicinesData = [
  {
    id: "1",
    name: "Amoxicillin",
    quantity: 1500,
    patients: 425,
    lastRestocked: "2024-03-15",
  },
  {
    id: "2",
    name: "Lisinopril",
    quantity: 2200,
    patients: 380,
    lastRestocked: "2024-03-14",
  },
  {
    id: "3",
    name: "Metformin",
    quantity: 1800,
    patients: 290,
    lastRestocked: "2024-03-14",
  },
  {
    id: "4",
    name: "Omeprazole",
    quantity: 950,
    patients: 210,
    lastRestocked: "2024-03-13",
  },
];

export function MostCommonMedicinesHospital() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Medicine Name</TableHead>
          <TableHead>Total Quantity </TableHead>
          <TableHead>Total Patients</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {commonMedicinesData.map((medicine) => (
          <TableRow key={medicine.id}>
            <TableCell>{medicine.name}</TableCell>
            <TableCell>{medicine.quantity}</TableCell>
            <TableCell>{medicine.patients}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
