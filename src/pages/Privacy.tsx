import React from 'react';

const Privacy = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="bg-card/60 backdrop-blur-xl border border-border/60 rounded-3xl p-8 shadow-sm">
        <h1 className="text-3xl font-extrabold text-foreground mb-6">Privacy Policy</h1>
        
        <div className="space-y-6 text-foreground/80 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-foreground mb-2">1. Introduction</h2>
            <p>
              At Stack Fellows, accessible from <a href="https://www.stackfellows.com" className="text-primary hover:underline">www.stackfellows.com</a>, one of our main priorities is the privacy of our visitors and users. 
              This Privacy Policy document contains types of information that is collected and recorded by Stack Fellows and how we use it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-2">2. Information We Collect</h2>
            <p>
              We collect personal information that you provide to us when you register on the application, express an interest in obtaining information about us or our products and services, or otherwise when you contact us. This includes your name, email address, and optionally your WhatsApp number.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-2">3. Third-Party Data Sharing</h2>
            <p className="font-bold text-foreground bg-primary/10 p-3 rounded-lg border border-primary/20">
              We strictly DO NOT sell, trade, rent, or otherwise provide your Personal Information, Business Data, AI Training Data, or WhatsApp messages to any outside third parties. Your data remains completely private and secure within our ecosystem.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-2">4. How We Use Your Information</h2>
            <p>
              We use the information we collect in various ways, including to:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Provide, operate, and maintain our application.</li>
              <li>Improve, personalize, and expand our application.</li>
              <li>Understand and analyze how you use our application.</li>
              <li>Develop new products, services, features, and functionality.</li>
              <li>Communicate with you, either directly or through one of our partners, including for customer service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-2">5. Data Security</h2>
            <p>
              We use administrative, technical, and physical security measures to help protect your personal information. 
              Our WhatsApp connections use end-to-end encryption via the Signal Protocol. We do not store your private WhatsApp messages on our cloud servers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-2">6. Contact Us</h2>
            <p>
              If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us at <a href="mailto:info@stackfellows.com" className="text-primary hover:underline">info@stackfellows.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
