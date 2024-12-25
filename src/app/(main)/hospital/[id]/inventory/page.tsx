"use client";

import React, { use, useState } from "react";
import { Button } from "~/components/ui/button";
import { GoPlus } from "react-icons/go";
import { DataTable } from "~/components/DataTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { BsCart3 } from "react-icons/bs";
import Image from "next/image";
import { useOrderStock, useStock } from "~/hooks/useOrderStock";
import { useApi } from "~/hooks/useApi";
import { toast } from "~/hooks/use-toast";
import { Select } from "~/components/ui/select";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useInventory } from "~/hooks/useInventory";
import { useUser } from "~/hooks/useUser";
import { useQueryClient } from "@tanstack/react-query";
import { PatientDisposablesForm } from "~/components/forms/RequestDisposables";
import {
  useDisposable,
  useUpdateDisposable2,
  useUpdateDisposable1,
} from "~/hooks/useDisposableStatus";
import { InventoryPredictor } from "~/components/charts/hospital/InventoryPredictor";

const InventoryPage = () => {
  const [stockSort, setStockSort] = React.useState("All");
  const [stockSortOptions, setStockSortOptions] = React.useState([
    { label: "All", value: "All" },
    { label: "Medical Disposable", value: "Medical Disposable" },
    { label: "Medical Equipment", value: "Medical Equipment" },
    { label: "Pharmaceutical", value: "Pharmaceutical" },
  ]);
  const api = useApi();
  const { stockInventory } = useInventory();
  const { stock } = useStock();
  const updateDisposable1 = useUpdateDisposable1();
  const updateDisposable2 = useUpdateDisposable2();

  const inventoryData = stockInventory.map((item) => ({
    _id: item._id,
    name: item.name,
    category:
      item.tag === "Medical Disposable"
        ? "Medical Disposable"
        : item.tag === "Medical Equipment"
          ? "Medical Equipment"
          : "Pharmaceutical",
    stock: item.quantity,
    quantity:
      item.quantity > 0
        ? item.quantity < 100
          ? "Low Stock"
          : "In Stock"
        : "Out of Stock",
  }));

  const availableMedicines = stock.map((item) => ({
    id: item._id,
    name: item.name,
    description: `${item.quantity >= 10 ? `${item.quantity}mg` : `${item.quantity * 1000}g`} tablets | Box of ${[8, 12, 16, 24][Math.floor(Math.random() * 4)]}`,
    price: item.price,
    image: item.imgUrl || "/default-image.png",
  }));

  const { disposables } = useDisposable();
  console.log("disposables", disposables);

  const requests = disposables.map((disposable: any) => ({
    _id: disposable._id,
    patientName: disposable.userName,
    disposables: disposable.itemName,
    quantity: disposable.quantity,
    status: (() => {
      // All possible combinations of isCollected, isHazardous, isDisposed
      if (
        disposable.isCollected &&
        disposable.isHazardous &&
        disposable.isDisposed
      ) {
        return "disposed";
      }
      if (
        disposable.isCollected &&
        disposable.isHazardous &&
        !disposable.isDisposed
      ) {
        return "collected but not disposed";
      }
      if (
        disposable.isCollected &&
        !disposable.isHazardous &&
        disposable.isDisposed
      ) {
        return "disposed";
      }
      if (
        disposable.isCollected &&
        !disposable.isHazardous &&
        !disposable.isDisposed
      ) {
        return "collected";
      }
      if (
        !disposable.isCollected &&
        disposable.isHazardous &&
        disposable.isDisposed
      ) {
        return "disposed";
      }
      if (
        !disposable.isCollected &&
        disposable.isHazardous &&
        !disposable.isDisposed
      ) {
        return "in use";
      }
      if (
        !disposable.isCollected &&
        !disposable.isHazardous &&
        disposable.isDisposed
      ) {
        return "disposed";
      }
      if (
        !disposable.isCollected &&
        !disposable.isHazardous &&
        !disposable.isDisposed
      ) {
        return "not collected";
      }
    })(),
  }));

  const inventoryColumns = [
    { header: "Name", accessorKey: "name" },
    { header: "Category", accessorKey: "category" },
    { header: "Stock", accessorKey: "stock" },
    { header: "Quantity", accessorKey: "quantity" },
  ];
  const requestColumns = [
    { header: "Patient Name", accessorKey: "patientName" },
    { header: "Disposables", accessorKey: "disposables" },
    { header: "Quantity", accessorKey: "quantity" },
    { header: "Status", accessorKey: "status" },
  ];

  const [cart, setCart] = React.useState<
    Array<{
      id: string;
      name: string;
      description: string;
      quantity: number;
      price: number;
      image: string;
    }>
  >([]);

  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredMedicines = availableMedicines.filter((medicine) =>
    medicine.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const addToCart = (medicine: (typeof availableMedicines)[0]) => {
    setCart((prev: any) => {
      const existing = prev.find((item: any) => item.id === medicine.id);
      if (existing) {
        return prev.map((item: any) =>
          item.id === medicine.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { ...medicine, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item,
      ),
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const [isCartOpen, setIsCartOpen] = React.useState(false);

  const isInCart = (medicineId: string) =>
    cart.some((item) => item.id === medicineId);
  const getCartItem = (medicineId: string) =>
    cart.find((item) => item.id === medicineId);
  const { user } = useUser();

  const { mutate: orderStock, isSuccess } = useOrderStock();

  const handleOrder = () => {
    orderStock(cart);
    if (isSuccess) {
      setCart([]);
      setIsCartOpen(false);
    }
  };

  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="flex w-full flex-col gap-4 px-6 py-4">
      {/* Header */}
      <div className="header mt-2 flex w-full justify-between">
        <div>
          <h2 className="text-2xl font-bold">Inventory</h2>
          <p className="ml-[-1px] text-sm text-muted-foreground">
            Manage your hospital&apos;s inventory
          </p>
        </div>
      </div>

      <Tabs defaultValue="inventory" className="w-full">
        <div className="flex items-center justify-between border-b">
          <TabsList className="h-auto bg-transparent p-0">
            <TabsTrigger
              value="inventory"
              className="relative h-10 rounded-none bg-transparent px-4 pb-3 pt-2 font-medium before:absolute before:bottom-0 before:left-0 before:right-0 before:h-[2px] before:bg-primary before:opacity-0 before:transition-opacity data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:before:opacity-100"
            >
              Inventory
            </TabsTrigger>
            <TabsTrigger
              value="orderStock"
              className="relative h-10 rounded-none bg-transparent px-4 pb-3 pt-2 font-medium before:absolute before:bottom-0 before:left-0 before:right-0 before:h-[2px] before:bg-primary before:opacity-0 before:transition-opacity data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:before:opacity-100"
            >
              Order Stock
            </TabsTrigger>
            <TabsTrigger
              value="requests"
              className="relative h-10 rounded-none bg-transparent px-4 pb-3 pt-2 font-medium before:absolute before:bottom-0 before:left-0 before:right-0 before:h-[2px] before:bg-primary before:opacity-0 before:transition-opacity data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:before:opacity-100"
            >
              Your Requests
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="inventory" className="mt-4">
          <div className="flex justify-between gap-4">
            <div className="w-[70%]">
              <DataTable
                data={inventoryData}
                columns={inventoryColumns}
                showViewButton
                searchKey="name"
                searchPlaceholder="Search medicine name"
              sortOptions={[
                {
                  label: "Medical Disposable",
                  value: "Medical Disposable",
                  sortKey: "category",
                },
                {
                  label: "Medical Equipment",
                  value: "Medical Equipment",
                  sortKey: "category",
                },
                {
                  label: "Pharmaceutical",
                  value: "Pharmaceutical",
                  sortKey: "category",
                },
                {
                  label: "Expired",
                  value: "Expired",
                  sortKey: "cycle",
                },
                {
                  label: "Disposed",
                  value: "Disposed",
                  sortKey: "cycle",
                },
                {
                  label: "Used",
                  value: "Used",
                  sortKey: "cycle",
                },
                {
                  label: "In Stock Only",
                  value: "In Stock Only",
                  sortKey: "status",
                },
                {
                  label: "Low Stock Only",
                  value: "Low Stock Only",
                  sortKey: "status",
                },
                {
                  label: "Out of Stock Only",
                  value: "Out of Stock Only",
                  sortKey: "status",
                },
                {
                  label: "Stock: High to Low",
                  value: "stockDesc",
                  sortKey: "stock",
                  sortOrder: "desc",
                },
                {
                  label: "Stock: Low to High",
                  value: "stockAsc",
                  sortKey: "stock",
                  sortOrder: "asc",
                },
                {
                  label: "Name: A to Z",
                  value: "nameAsc",
                  sortKey: "name",
                  sortOrder: "asc",
                },
                {
                  label: "Name: Z to A",
                  value: "nameDesc",
                  sortKey: "name",
                  sortOrder: "desc",
                },
              ]}
              viewDialogContent={(row) => (
                <div className="space-y-2">
                  <p>
                    <span className="font-semibold">Name:</span> {row.name}
                  </p>
                  <p>
                    <span className="font-semibold">Category:</span>
                    {row.category}
                  </p>
                  <p>
                    <span className="font-semibold">Stock:</span> {row.stock}
                  </p>
                  <p>
                    {/* <span className="font-semibold">Batch:</span> {row.batch} */}
                  </p>

                  <p>
                    {/* <span className="font-semibold">Cycle:</span> {row.cycle} */}
                  </p>
                </div>
              )}
            />
            </div>
            <div className="w-[30%]">
              <InventoryPredictor />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="orderStock">
          <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="mb-4 flex justify-between">
                <div className="flex items-center gap-4">
                  <Input
                    placeholder="Search medicines..."
                    className="max-w-xs"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Select onValueChange={(value) => setStockSort(value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      {stockSortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-xl font-bold">
                    Total: ₹{total.toFixed(2)}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="relative"
                    onClick={() => setIsCartOpen(true)}
                  >
                    <BsCart3 className="h-5 w-5" />
                    {cart.length > 0 && (
                      <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
                        {cart.length}
                      </span>
                    )}
                  </Button>
                </div>
              </div>

              <div className="scrollbar flex max-h-[calc(100vh-300px)] flex-col gap-4 overflow-y-auto pr-2">
                {filteredMedicines.map((medicine) => {
                  const cartItem = getCartItem(medicine.id);
                  return (
                    <Card key={medicine.id} className="p-4">
                      <div className="flex items-center gap-6">
                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                          <Image
                            height={400}
                            width={400}
                            src={medicine.image}
                            alt={medicine.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-start justify-between">
                            <h3 className="text-lg font-medium">
                              {medicine.name}
                            </h3>
                            <p className="text-lg font-semibold text-primary">
                              ₹{medicine.price}
                            </p>
                          </div>
                          <p className="mb-3 text-sm text-muted-foreground">
                            {medicine.description}
                          </p>
                          {!cartItem ? (
                            <Button
                              onClick={() => addToCart(medicine)}
                              variant="outline"
                              className="h-9 px-4"
                            >
                              Add to Cart
                            </Button>
                          ) : (
                            <div className="flex w-fit items-center gap-2 rounded-md border">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-none"
                                onClick={() =>
                                  updateQuantity(
                                    medicine.id,
                                    cartItem.quantity - 1,
                                  )
                                }
                              >
                                -
                              </Button>
                              <span className="w-12 text-center font-medium">
                                {cartItem.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-none"
                                onClick={() =>
                                  updateQuantity(
                                    medicine.id,
                                    cartItem.quantity + 1,
                                  )
                                }
                              >
                                +
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Your Cart</DialogTitle>
                </DialogHeader>

                <div className="scrollbar max-h-[60vh] overflow-y-auto pr-2">
                  {cart.length === 0 ? (
                    <div className="py-6 text-center text-muted-foreground">
                      Your cart is empty
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 rounded-lg border p-4"
                        >
                          <div className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                            <Image
                              height={400}
                              width={400}
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex items-start justify-between">
                              <h3 className="font-medium">{item.name}</h3>
                              <p className="text-sm font-medium">
                                ₹{(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                            <p className="mb-2 text-sm text-muted-foreground">
                              {item.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 rounded-md border">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-none"
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity - 1)
                                  }
                                >
                                  -
                                </Button>
                                <span className="w-8 text-center text-sm">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-none"
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity + 1)
                                  }
                                >
                                  +
                                </Button>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                ₹{item.price} each
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-4 border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                  <Button onClick={handleOrder} className="w-full" size="lg">
                    Place Order
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>

        <TabsContent value="requests">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <GoPlus className="mr-2 h-4 w-4" />
                Add Disposables
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Patient Disposables</DialogTitle>
              </DialogHeader>
              <PatientDisposablesForm onClose={() => setIsOpen(false)} />
            </DialogContent>
          </Dialog>
          <div className="mt-4 gap-4">
            <DataTable
              data={requests}
              columns={requestColumns}
              showViewButton
              showActions={true}
              searchKey="patientName"
              searchPlaceholder="search request"
              actionItems={[
                {
                  label: "mark as disposed",
                  onClick: async (row) => {
                    await updateDisposable1.mutateAsync({
                      id: row._id as string,
                      isDisposed: true,
                    });
                  },
                  dialogContent: null,
                },
                {
                  label: "mark as collected",
                  onClick: async (row) => {
                    await updateDisposable2.mutateAsync({
                      id: row._id as string,
                      isCollected: true,
                    });
                  },
                  dialogContent: null,
                },
              ]}
              rowClassName={(row) =>
                row.status === "collected but not disposed" ? "bg-red-100" : ""
              }
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryPage;
