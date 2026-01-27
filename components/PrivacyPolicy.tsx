import React from 'react';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <section className="bg-white min-h-screen pt-24 pb-20 px-6 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-hotel-primary/10 rounded-2xl mb-4 text-hotel-primary">
          <Shield size={32} />
        </div>
        <h1 className="text-4xl font-serif font-black text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-gray-500 font-medium uppercase tracking-widest text-[10px]">Effective Date: May 20, 2024</p>
      </div>

      <div className="prose prose-red max-w-none space-y-8 text-gray-600">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-hotel-primary flex items-center gap-2">
            <Eye size={20} /> 1. Information We Collect
          </h2>
          <p className="text-sm leading-relaxed">
            Hotel Shotabdi Residential collects minimal information necessary to provide our hospitality and digital services. When you use Google Sign-In, we access:
          </p>
          <ul className="list-disc pl-5 text-sm space-y-2">
            <li><strong>Email address:</strong> Used for account identification and direct communication regarding bookings.</li>
            <li><strong>Profile Information:</strong> Your name and profile picture to personalize your dashboard and booking records.</li>
            <li><strong>Identity Details:</strong> User-provided data such as Phone Number and NID (National ID) for local security compliance.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-hotel-primary flex items-center gap-2">
            <Lock size={20} /> 2. How We Use Your Data
          </h2>
          <p className="text-sm leading-relaxed">
            Your personal data is used exclusively for:
          </p>
          <ul className="list-disc pl-5 text-sm space-y-2">
            <li>Securing your account through Google OAuth 2.0.</li>
            <li>Processing and validating room reservation requests.</li>
            <li>Contacting you in case of emergency or booking updates.</li>
            <li>Ensuring compliance with local law enforcement regulations regarding guest registration.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-hotel-primary flex items-center gap-2">
            <Shield size={20} /> 3. Data Protection & Sharing
          </h2>
          <p className="text-sm leading-relaxed">
            We implement industry-standard security measures to protect your data. <strong>We do not sell, trade, or rent your personal information</strong> to third parties. We only share data with Google (Firebase) for the technical operation of the application.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-hotel-primary flex items-center gap-2">
            <FileText size={20} /> 4. Your Rights
          </h2>
          <p className="text-sm leading-relaxed">
            You have the right to access, update, or request the deletion of your account and associated data. You can manage your profile through the "Manage Account" section or contact us directly.
          </p>
        </div>

        <div className="p-8 bg-hotel-muted rounded-[2rem] border border-gray-100 mt-12">
          <h3 className="font-black text-gray-900 mb-2 uppercase text-[11px] tracking-widest">Contact Data Protection Officer</h3>
          <p className="text-[13px] leading-relaxed">
            For any privacy-related inquiries or data requests, please contact us at:<br />
            <span className="text-hotel-primary font-black">hotelshotabdiabashik@gmail.com</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default PrivacyPolicy;