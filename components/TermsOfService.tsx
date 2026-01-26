
import React from 'react';
import { Gavel, Info, AlertCircle, CheckCircle } from 'lucide-react';

const TermsOfService: React.FC = () => {
  return (
    <section className="bg-white min-h-screen pt-24 pb-20 px-6 max-w-4xl mx-auto">
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
            By accessing or using the Shotabdi Abashik website, you agree to be bound by these Terms of Service and all applicable laws and regulations in Bangladesh.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-hotel-primary flex items-center gap-2">
            <CheckCircle size={20} /> 2. Use License
          </h2>
          <p className="text-sm leading-relaxed">
            Permission is granted to temporarily view the materials (information or software) on our website for personal, non-commercial transitory viewing only.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-hotel-primary flex items-center gap-2">
            <AlertCircle size={20} /> 3. Disclaimer
          </h2>
          <p className="text-sm leading-relaxed">
            The materials on our website are provided on an 'as is' basis. Shotabdi Abashik makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-hotel-primary flex items-center gap-2">
            <Gavel size={20} /> 4. Governing Law
          </h2>
          <p className="text-sm leading-relaxed">
            Any claim relating to Shotabdi Abashik's website shall be governed by the laws of Bangladesh without regard to its conflict of law provisions.
          </p>
        </div>

        <div className="mt-12 p-8 border-2 border-dashed border-hotel-primary/20 rounded-3xl">
          <p className="text-xs text-center font-medium italic">
            "Your comfort and trust are our highest priorities. We reserve the right to update these terms as our services evolve."
          </p>
        </div>
      </div>
    </section>
  );
};

export default TermsOfService;
