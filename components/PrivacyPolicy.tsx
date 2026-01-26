
import React from 'react';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <section className="bg-white min-h-screen pt-24 pb-20 px-6 max-w-4xl mx-auto">
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-hotel-primary/10 rounded-2xl mb-4 text-hotel-primary">
          <Shield size={32} />
        </div>
        <h1 className="text-4xl font-serif font-black text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-gray-500 font-medium uppercase tracking-widest text-[10px]">Last Updated: May 20, 2024</p>
      </div>

      <div className="prose prose-red max-w-none space-y-8 text-gray-600">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-hotel-primary flex items-center gap-2">
            <Eye size={20} /> 1. Information We Collect
          </h2>
          <p className="text-sm leading-relaxed">
            Shotabdi Residential collects minimal information necessary to provide our services. When you use Google Sign-In, we collect your:
          </p>
          <ul className="list-disc pl-5 text-sm space-y-2">
            <li>Email address (used for account identification and communication).</li>
            <li>Full name and profile picture (used to personalize your experience on our platform).</li>
            <li>Usage data, such as your interactions with our AI Concierge to improve service quality.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-hotel-primary flex items-center gap-2">
            <Lock size={20} /> 2. How We Use Your Data
          </h2>
          <p className="text-sm leading-relaxed">
            Your data is used strictly for:
          </p>
          <ul className="list-disc pl-5 text-sm space-y-2">
            <li>Authentication and security of your account.</li>
            <li>Processing room availability requests and bookings.</li>
            <li>Personalizing our AI Concierge responses.</li>
            <li>Improving our website performance and user experience.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-hotel-primary flex items-center gap-2">
            <Shield size={20} /> 3. Data Sharing and Disclosure
          </h2>
          <p className="text-sm leading-relaxed">
            We <strong>do not sell</strong> your personal data to third parties. We only share information with third-party services (like Google Firebase for authentication) as required to operate our platform. We may disclose information if required by law in Bangladesh.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-hotel-primary flex items-center gap-2">
            <FileText size={20} /> 4. Your Rights
          </h2>
          <p className="text-sm leading-relaxed">
            You have the right to access, update, or request the deletion of your personal data at any time. You can do this by contacting our support team or managing your profile settings.
          </p>
        </div>

        <div className="p-6 bg-hotel-muted rounded-2xl border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-2">Contact Us</h3>
          <p className="text-sm">
            For any privacy-related concerns, please email us at:<br />
            <span className="text-hotel-primary font-black">hotelshotabdiabashik@gmail.com</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default PrivacyPolicy;