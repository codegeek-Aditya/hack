import { useState } from "react";

export const useRazorpay = ({ amount, onSuccess, onFailure, user }: any) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const initializePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/transactions/create-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: amount,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
          }),
        },
      );

      if (!response.ok) throw new Error("Failed to create order");

      const data = await response.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount * 100,
        currency: "INR",
        name: process.env.NEXT_PUBLIC_COMPANY_NAME,
        description: "Product Purchase",
        order_id: data.id,
        handler: async function (response: any) {
          try {
            const validationResponse = await fetch(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/transactions/validate-payment`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(response),
              },
            );

            if (!validationResponse.ok)
              throw new Error("Payment validation failed");

            const validationData = await validationResponse.json();
            onSuccess(validationData);
          } catch (error: any) {
            onFailure(error.message);
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: "8928937191",
        },
        theme: { color: "#F37254" },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (error: any) {
      setError(error.message);
      onFailure(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { initializePayment, loading, error };
};
