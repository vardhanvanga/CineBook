import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-950 py-16 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold text-white text-center mb-2">Contact Customer Support</h1>
        <p className="text-gray-400 text-sm text-center mb-10">We're here to help with your ticket queries and theatre bookings</p>

        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-xl space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-gray-800 text-center">
            <div className="p-4 bg-gray-800/40 rounded-2xl">
              <Mail className="w-5 h-5 text-purple-400 mx-auto mb-2" />
              <span className="text-xs text-gray-400 block">Email Us</span>
              <span className="text-xs font-bold text-white">support@cinebook.com</span>
            </div>
            <div className="p-4 bg-gray-800/40 rounded-2xl">
              <Phone className="w-5 h-5 text-purple-400 mx-auto mb-2" />
              <span className="text-xs text-gray-400 block">Toll-Free</span>
              <span className="text-xs font-bold text-white">1800-419-CINE</span>
            </div>
            <div className="p-4 bg-gray-800/40 rounded-2xl">
              <MapPin className="w-5 h-5 text-purple-400 mx-auto mb-2" />
              <span className="text-xs text-gray-400 block">Headquarters</span>
              <span className="text-xs font-bold text-white">HITEC City, Hyderabad</span>
            </div>
          </div>

          <div className="text-xs text-gray-400 leading-relaxed text-center">
            For urgent ticket inquiries or show cancellations, please quote your <strong>Booking Reference</strong> when reaching out to support.
          </div>
        </div>
      </div>
    </div>
  );
}
