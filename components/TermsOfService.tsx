import React from 'react';
import { Gavel, Info, AlertCircle, CheckCircle, ShieldAlert, Scale, UserCheck } from 'lucide-react';

const TermsOfService: React.FC = () => {
  return (
    <section className="bg-white min-h-screen pt-24 pb-20 px-6 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-hotel-primary/10 rounded-2xl mb-4 text-hotel-primary">
          <Gavel size={32} />
        </div>
        <h1 className="text-4xl font-serif font-black text-gray-900 mb-4 tracking-tight">Terms of Service</h1>
        <p className="text-gray-500 font-medium uppercase tracking-widest text-[10px]">Official Registry Terms for shotabdi-abashik.bd</p>
        <p className="text-gray-400 font-bold text-[9px] mt-2 italic">Last Updated: October 26, 2024</p>
      </div>

      <div className="prose prose-red max-w-none space-y-10 text-gray-600">
        <div className="space-y-4">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-3 border-b border-gray-100 pb-2">
            <Scale size={20} className="text-hotel-primary" /> 1. Agreement to Terms
          </h2>
          <p className="text-sm leading-relaxed">
            By accessing or using the services provided at <strong>https://shotabdi-abashik.bd</strong>, you agree to comply with and be bound by these Terms of Service. These terms apply to all visitors, residents, and others who access the digital registry or make reservations.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-3 border-b border-gray-100 pb-2">
            <UserCheck size={20} className="text-hotel-primary" /> 2. Resident Registration & Verification
          </h2>
          <p className="text-sm leading-relaxed">
            Hotel Shotabdi Abashik operates as a verified residential facility. To use the digital booking features, you must:
          </p>
          <ul className="list-disc pl-5 text-sm space-y-3">
            <li>Register with a valid Google Account via the OAuth 2.0 system.</li>
            <li>Provide accurate legal identification (NID Number and Document Scan).</li>
            <li>Be at least 18 years of age or accompanied by a verified legal guardian.</li>
            <li>Maintain the confidentiality of your account access credentials.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-3 border-b border-gray-100 pb-2">
            <CheckCircle size={20} className="text-hotel-primary" /> 3. Booking and Cancellation
          </h2>
          <p className="text-sm leading-relaxed">
            Reservations made through this platform are considered "Requests" until verified by the Registry Admin. 
          </p>
          <ul className="list-disc pl-5 text-sm space-y-3">
            <li>We reserve the right to reject any booking request that fails identity verification.</li>
            <li>The 25% discount is applied automatically for verified residents.</li>
            <li>Cancellations should be requested at least 24 hours prior to check-in to ensure registry clearance.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-3 border-b border-gray-100 pb-2">
            <ShieldAlert size={20} className="text-hotel-primary" /> 4. Prohibited Conduct
          </h2>
          <p className="text-sm leading-relaxed">
            Users agree not to engage in any activity that:
          </p>
          <ul className="list-disc pl-5 text-sm space-y-3">
            <li>Violates any local, state, or international laws of Bangladesh.</li>
            <li>Includes submitting fraudulent identification or documents.</li>
            <li>Attempts to bypass or interfere with the site's security features.</li>
            <li>Uses the Help Dex or Concierge features to transmit harassment or spam.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-3 border-b border-gray-100 pb-2">
            <AlertCircle size={20} className="text-hotel-primary" /> 5. Limitation of Liability
          </h2>
          <p className="text-sm leading-relaxed">
            In no event shall Hotel Shotabdi Abashik, its owners, or developers (Fuad Ahmed) be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the digital services, including but not limited to loss of data or service interruptions.
          </p>
        </div>

        <div className="mt-12 p-10 border-2 border-dashed border-hotel-primary/20 rounded-[3rem] bg-gray-50/50">
          <div className="flex items-center gap-4 mb-4">
            <Scale className="text-hotel-primary" size={24} />
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter m-0">Governing Law</h3>
          </div>
          <p className="text-xs text-gray-500 font-bold italic leading-relaxed m-0">
            "These terms are governed by and construed in accordance with the laws of Bangladesh. Any disputes arising from these terms will be subject to the exclusive jurisdiction of the courts in Sylhet, Bangladesh."
          </p>
        </div>

        <div className="text-center pt-8">
           <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em]">Official Digital Registry Hub</p>
           <p className="text-[9px] text-gray-300 font-bold mt-2">© 2024 HOTEL SHOTABDI ABASHIK. ALL RIGHTS RESERVED.</p>
        </div>
      </div>
    </section>
  );
};

export default TermsOfService;