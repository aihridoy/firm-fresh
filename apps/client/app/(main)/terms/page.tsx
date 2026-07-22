import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern using the FarmFresh platform as a customer or farmer.",
};

const sections = [
  {
    title: "1. Using FarmFresh",
    body: "FarmFresh connects customers with local farmers selling fresh produce. By creating an account or placing an order you agree to these terms. You must provide accurate account information and keep your credentials secure.",
  },
  {
    title: "2. Orders and Payment",
    body: "Orders are placed directly with the farmer listing the product. Prices are set by farmers and shown at checkout, including any delivery charges. Payment is processed securely at the time of order.",
  },
  {
    title: "3. Delivery and Freshness",
    body: "Farmers aim to deliver produce within 24 hours of harvest where possible. Delivery times are estimates and may vary by location and availability.",
  },
  {
    title: "4. Cancellations and Refunds",
    body: "Pending orders can be cancelled from your bookings page. If a delivered product does not meet reasonable freshness standards, contact us within 24 hours of delivery and we will work with the farmer on a refund or replacement.",
  },
  {
    title: "5. Selling on FarmFresh",
    body: "Farmers are responsible for the accuracy of their listings, the quality of their produce, and fulfilling confirmed orders. Listings that misrepresent products may be removed.",
  },
  {
    title: "6. Acceptable Use",
    body: "Do not use the platform for anything unlawful, post misleading content, or attempt to disrupt the service. Accounts that violate these rules may be suspended.",
  },
  {
    title: "7. Changes to These Terms",
    body: "We may update these terms as the platform evolves. Continued use of FarmFresh after changes take effect constitutes acceptance of the updated terms.",
  },
];

export default function TermsPage() {
  return (
    <>
      <div className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
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
