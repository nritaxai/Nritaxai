import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export function Checkout() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("Preparing payment...");
  const API = import.meta.env.VITE_API_URL;

  const plan = searchParams.get("plan");

  useEffect(() => {
    const startPayment = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setStatus("Please login to continue subscription checkout.");
        return;
      }

      try {
        const { data } = await axios.post(
          `${API}/api/subscription/create-subscription`,
          { plan },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY,
          subscription_id: data.id,
          name: "NRITAX.AI",
          description: `Plan: ${plan}`,
          handler: function () {
            alert("Payment successful!");
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } catch (error: any) {
        console.error(error.response?.data || error);
        setStatus(error.response?.data?.message || "Payment failed");
      }
    };

    if (plan) startPayment();
  }, [plan]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1>{status}</h1>
    </div>
  );
}
