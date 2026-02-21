import { CheckCircle, XCircle } from "lucide-react";

interface AuthPopupProps {
  message: string;
  type: "success" | "error";
}

export function AuthPopup({ message, type }: AuthPopupProps) {
  return (
    <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-5">
      <div
        className={`flex items-center gap-3 px-5 py-4 rounded-lg shadow-lg text-white ${
          type === "success" ? "bg-green-600" : "bg-red-600"
        }`}
      >
        {type === "success" ? (
          <CheckCircle className="size-5" />
        ) : (
          <XCircle className="size-5" />
        )}
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}
