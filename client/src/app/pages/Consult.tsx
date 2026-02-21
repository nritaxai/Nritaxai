import { CPAContact } from "../components/CPAContact";

export function Consult() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Render as page content instead of modal */}
        <div className="max-w-2xl mx-auto">
          <CPAContact onClose={() => window.history.back()} />
        </div>
      </div>
    </div>
  );
}
