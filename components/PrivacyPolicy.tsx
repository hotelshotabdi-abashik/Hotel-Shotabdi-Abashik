import React from 'react';
import { Shield, Lock, Eye, FileText, Mail, Globe, Info } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <section className="bg-white min-h-screen pt-24 pb-20 px-6 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-hotel-primary/10 rounded-2xl mb-4 text-hotel-primary">
          <Shield size={32} />
        </div>
        <h1 className="text-4xl font-serif font-black text-gray-900 mb-4 tracking-tight">Privacy Policy</h1>
        <p className="text-gray-500 font-medium uppercase tracking-widest text-[10px]">Official Document for shotabdi-abashik.bd</p>
        <p className="text-gray-400 font-bold text-[9px] mt-2 italic">Last Updated: October 26, 2024</p>
      </div>

      <div className="prose prose-red max-w-none space-y-10 text-gray-600">
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex gap-4">
          <Info className="text-hotel-primary shrink-0" size={20} />
          <p className="text-xs leading-relaxed font-medium m-0">
            This Privacy Policy describes how <strong>Hotel Shotabdi Abashik</strong> ("we", "our", or "us") collects, uses, and shares your personal information when you visit or make a booking through <a href="https://shotabdi-abashik.bd" className="text-hotel-primary underline">https://shotabdi-abashik.bd</a>.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-3 border-b border-gray-100 pb-2">
            <Eye size={20} className="text-hotel-primary" /> 1. Information We Collect
          </h2>
          <p className="text-sm leading-relaxed">
            When you visit the site, we collect certain information about your device and interaction with the site. We also collect personal information when you authenticate via Google or fill out your profile:
          </p>
          <ul className="list-disc pl-5 text-sm space-y-3">
            <li><strong>Authentication Data (via Google OAuth 2.0):</strong> We collect your Google ID, primary email address, full name, and profile picture. This is used solely to create and secure your resident account.</li>
            <li><strong>Identity Verification Data:</strong> To comply with local law enforcement in Sylhet, Bangladesh, we collect your Legal Name, National ID (NID) number, and a digital image of your NID card.</li>
            <li><strong>Contact Information:</strong> We collect your mobile phone number and a secondary guardian/emergency contact number.</li>
            <li><strong>Usage Data:</strong> We may collect data on your booking history and interactions with our AI Concierge or Help Dex support.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-3 border-b border-gray-100 pb-2">
            <Lock size={20} className="text-hotel-primary" /> 2. How We Use Your Personal Information
          </h2>
          <p className="text-sm leading-relaxed">
            We use the Personal Information that we collect generally to fulfill any reservations placed through the Site. Additionally, we use this information to:
          </p>
          <ul className="list-disc pl-5 text-sm space-y-3">
            <li>Communicate with you regarding your stay;</li>
            <li>Screen our bookings for potential risk or fraud;</li>
            <li>Maintain a secure digital guest register for police verification;</li>
            <li>Provide you with information or advertising relating to our exclusive residential offers;</li>
            <li>Personalize your experience on the digital concierge.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-3 border-b border-gray-100 pb-2">
            <Shield size={20} className="text-hotel-primary" /> 3. Data Sharing and Disclosure
          </h2>
          <p className="text-sm leading-relaxed">
            We share your Personal Information with third parties to help us use your Personal Information, as described above:
          </p>
          <ul className="list-disc pl-5 text-sm space-y-3">
            <li><strong>Google Firebase:</strong> We use Firebase for authentication, database hosting, and notification delivery. You can read how Google uses your Personal Information here: <a href="https://www.google.com/intl/en/policies/privacy/" target="_blank" className="text-hotel-primary underline">https://www.google.com/intl/en/policies/privacy/</a>.</li>
            <li><strong>Compliance with Law:</strong> Finally, we may also share your Personal Information to comply with applicable laws and regulations, to respond to a subpoena, search warrant or other lawful request for information we receive.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-3 border-b border-gray-100 pb-2">
            <Globe size={20} className="text-hotel-primary" /> 4. Your Rights and Data Deletion
          </h2>
          <p className="text-sm leading-relaxed">
            You have the right to access personal information we hold about you and to ask that your personal information be corrected, updated, or deleted. 
          </p>
          <p className="text-sm leading-relaxed">
            If you wish to delete your account and all associated data, you may do so through the <strong>Manage Account</strong> section or by contacting us directly at <span className="text-hotel-primary font-black">hotelshotabdiabashik@gmail.com</span>. We will process your request within 7 business days.
          </p>
        </div>

        <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 mt-12 flex flex-col md:flex-row items-center gap-8">
           <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
             <Mail size={24} className="text-hotel-primary" />
           </div>
           <div>
              <h3 className="font-black text-gray-900 mb-1 uppercase text-[11px] tracking-widest">Contact Information</h3>
              <p className="text-[13px] leading-relaxed m-0">
                For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e-mail at:<br />
                <span className="text-hotel-primary font-black">hotelshotabdiabashik@gmail.com</span>
              </p>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-2">Sylhet, Bangladesh • Official Registry</p>
           </div>
        </div>
      </div>
    </section>
  );
};

export default PrivacyPolicy;