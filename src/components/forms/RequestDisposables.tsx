"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select } from "~/components/ui/select";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useApi } from "~/hooks/useApi";

import { useInventory } from "~/hooks/useInventory";
import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "~/hooks/use-toast";
import { useCreateDisposable } from "~/hooks/useDisposableStatus";

interface PatientDisposablesFormProps {
  onClose: () => void;
}

export function PatientDisposablesForm({
  onClose,
}: PatientDisposablesFormProps) {
  const [patientName, setPatientName] = useState("");
  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [hazardType, setHazardType] = useState(""); // New state for hazard type
  const { stockInventory } = useInventory();

  const disposableOptions = stockInventory.map((item) => ({
    _id: item._id,
    name: item.name,
    category:
      item.tag === "Medical Disposable"
        ? "Medical Disposable"
        : item.tag === "Medical Equipment"
          ? "Medical Equipment"
          : "Pharmaceutical",
    stock: item.quantity,
    label: item.name, // Fix: Use 'name' for label
    value: item._id, // Fix: Use '_id' for value
    quantity:
      item.quantity > 0
        ? item.quantity < 100
          ? "Low Stock"
          : "In Stock"
        : "Out of Stock",
  }));

  const api = useApi();
  const queryClient = useQueryClient();
  const { mutate } = useCreateDisposable();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = {
      userName: patientName,
      itemId,
      quantity: Number(quantity),
      hazardType,
    };

    mutate(formData, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="patientName">Patient Name</Label>
        <Input
          id="patientName"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="disposableSelect">Select Disposable</Label>
        <Select onValueChange={setItemId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a disposable" />
          </SelectTrigger>
          <SelectContent>
            {disposableOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="hazardTypeSelect">Hazard Type</Label>
        <Select onValueChange={setHazardType}>
          <SelectTrigger>
            <SelectValue placeholder="Select hazard type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hazardous">Hazardous</SelectItem>
            <SelectItem value="non-hazardous">Non-Hazardous</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity</Label>
        <Input
          id="quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
      </div>

      <Button type="submit" className="w-full">
        Submit
      </Button>
    </form>
  );
}
