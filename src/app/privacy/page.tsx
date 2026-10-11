export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-950 py-16 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold text-white mb-2">Privacy Policy</h1>
        <p className="text-gray-400 text-xs mb-8">Last revised: October 2025</p>

        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 space-y-6 text-sm text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-white mb-2">1. Information Collection</h2>
            <p>
              We collect customer name, email address, and optional phone numbers solely to issue digital movie tickets, manage seat reservations, and notify patrons of showtime changes.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-2">2. Security & Passwords</h2>
            <p>
              All account passwords are encrypted using one-way bcrypt cryptographic hashes before database storage. User authentication utilizes secure HTTP-only cookies to protect against cross-site scripting (XSS).
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-2">3. Payment Information</h2>
            <p>
              CineBook operates in academic demonstration mode and does not collect, store, or transmit live credit card numbers, CVVs, or UPI PINs.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
