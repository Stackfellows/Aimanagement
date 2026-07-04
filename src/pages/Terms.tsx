import React from 'react';

const Terms = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="bg-card/60 backdrop-blur-xl border border-border/60 rounded-3xl p-8 shadow-sm">
        <h1 className="text-3xl font-extrabold text-foreground mb-6">Terms and Conditions</h1>
        
        <div className="space-y-6 text-foreground/80 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-foreground mb-2">1. Introduction</h2>
            <p>
              Welcome to Stack Fellows. By accessing and using our application, you accept and agree to be bound by the terms and provisions of this agreement. 
              These terms apply to all visitors, users, and others who access or use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-2">2. Company Information</h2>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Company Name:</strong> Stack Fellows</li>
              <li><strong>Website:</strong> <a href="https://www.stackfellows.com" className="text-primary hover:underline">www.stackfellows.com</a></li>
              <li><strong>Email:</strong> <a href="mailto:info@stackfellows.com" className="text-primary hover:underline">info@stackfellows.com</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-2">3. Use of Service</h2>
            <p>
              You agree not to use the service for any unlawful purpose or any purpose prohibited under this clause. You agree not to use the service in any way that could damage the service or general business of Stack Fellows.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-2">4. AI and Automated Services</h2>
            <p>
              Our application utilizes AI agents and automated services (including WhatsApp and Email bots). You are responsible for configuring the rules and training data for these agents. Stack Fellows is not liable for any messages sent by the AI agents on your behalf.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-2">5. Modifications</h2>
            <p>
              Stack Fellows reserves the right to revise these terms of service for its application at any time without notice. By using this application you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
