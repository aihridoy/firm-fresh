import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How FarmFresh collects, uses, and protects your personal information.",
};

const sections = [
  {
    title: "1. Information We Collect",
    body: "When you create an account we collect your name, email address, phone number, and delivery address. Farmers additionally provide farm details such as farm name, location, and specialization. We also record the orders you place and the products you list.",
  },
  {
    title: "2. How We Use Your Information",
    body: "Your information is used to process orders, connect customers with farmers, deliver produce, and send order updates. If you subscribe to our newsletter we use your email to share new farmers, seasonal produce, and offers.",
  },
  {
    title: "3. Payment Information",
    body: "Payments are handled by a secure third-party payment processor. FarmFresh never stores your card details on its servers.",
  },
  {
    title: "4. Sharing",
    body: "We share only what is needed to fulfil an order: farmers see the delivery details for orders of their products, and customers see farmer and farm information shown on listings. We do not sell your personal data to third parties.",
  },
  {
    title: "5. Data Security",
    body: "Passwords are stored hashed, connections are encrypted, and access to personal data is restricted. No system is perfectly secure, so please use a strong, unique password.",
  },
  {
    title: "6. Your Choices",
    body: "You can update your profile information at any time from your account, or delete your account entirely, which removes your personal data from the platform.",
  },
  {
    title: "7. Contact",
    body: "Questions about this policy? Email us at info@farmfresh.com and we will respond as soon as we can.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <div className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xl text-primary-100">Last updated: July 2026</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{section.title}</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
