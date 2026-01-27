import React from 'react';
import { Gavel, Info, AlertCircle, CheckCircle } from 'lucide-react';

const TermsOfService: React.FC = () => {
  return (
    <section className="bg-white min-h-screen pt-24 pb-20 px-6 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-hotel-primary/10 rounded-2xl mb-4 text-hotel-primary">
          <Gavel size={32} />
        </div>
        <h1 className="text-4xl font-serif font-black text-gray-900 mb-4">Terms of Service</h1>
        <p className="text-gray-500 font-medium uppercase tracking-widest text-[10px]">Last Updated: May 20, 2024</p>
      </div>

      <div className="prose prose-red max-w-none space-y-8 text-gray-600">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-hotel-primary flex items-center gap-2">
            <Info size={20} /> 1. Acceptance of Terms
          </h2>
          <p className="text-sm leading-relaxed">
            By accessing or using the Hotel Shotabdi Residential website and services, you agree to be bound by these Terms of Service and all applicable laws and regulations in Bangladesh. If you do not agree with any of these terms, you are prohibited from using this site.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-hotel-primary flex items-center gap-2">
            <CheckCircle size={20} /> 2. Booking and Registration
          </h2>
          <p className="text-sm leading-relaxed">
            All guests are required to register with a valid Google Account and provide accurate identity information (including NID) as per local regulations. We reserve the right to cancel bookings that contain fraudulent or incomplete information.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-hotel-primary flex items-center gap-2">
            <AlertCircle size={20} /> 3. Limitation of Liability
          </h2>
          <p className="text-sm leading-relaxed">
            The materials on our website are provided 'as is'. Hotel Shotabdi Residential makes no warranties, expressed or implied. In no event shall the hotel be liable for any damages arising out of the use or inability to use the digital services.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-hotel-primary flex items-center gap-2">
            <Gavel size={20} /> 4. Governing Law
          </h2>
          <p className="text-sm leading-relaxed">
            These terms and conditions are governed by and construed in accordance with the laws of Bangladesh. You irrevocably submit to the exclusive jurisdiction of the courts in Sylhet, Bangladesh for any legal matters.
          </p>
        </div>

        <div className="mt-12 p-8 border-2 border-dashed border-hotel-primary/20 rounded-[2.5rem]">
          <p className="text-xs text-center font-bold text-gray-400 italic">
            "Your comfort and safety are our highest priorities. We reserve the right to modify these terms at any time as our services evolve."
          </p>
        </div>
      </div>
    </section>
  );
};

export default TermsOfService;