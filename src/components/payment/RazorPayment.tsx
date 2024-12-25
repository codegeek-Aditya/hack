import React from "react";
import Script from "next/script";
import { useUser } from "~/hooks/useUser";
import { useToast } from "~/hooks/use-toast";
import { useRazorpay } from "~/hooks/useRazorPay";

interface RazorpayPaymentProps {
  amount: number;
  onSuccess: (response: any) => void;
  onFailure: (error: string) => void;
  children: React.ReactNode;
}

const RazorpayPayment: React.FC<RazorpayPaymentProps> = ({
  amount,
  onSuccess,
  onFailure,
  children,
}) => {
  const { toast } = useToast();
  const { user } = useUser();

  const { initializePayment, loading, error } = useRazorpay({
    amount,
    onSuccess: async (response: any) => {
      console.log(response);
      toast({
        description: "Order placed successfully",
      });
      onSuccess(response);
    },
    onFailure: (error: any) => {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Payment failed: " + error,
      });
      onFailure(error);
    },
    user,
  });

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <div onClick={initializePayment}>{children}</div>
    </>
  );
};

export default RazorpayPayment;
