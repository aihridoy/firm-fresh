import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Help Center",
  description: "Answers to common questions about ordering, delivery, payments, and selling on FarmFresh.",
};

const customerFaqs = [
  {
    q: "How do I place an order?",
    a: "Browse products, add items to your cart, and check out. You'll need a free account to complete your order.",
  },
  {
    q: "How fresh is the produce?",
    a: "Most produce is harvested within 24 hours of delivery. Each product page shows the harvest date when available.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We support secure online card payments through our checkout. Your payment details are never stored on our servers.",
  },
  {
    q: "Can I cancel or change my order?",
    a: "You can cancel pending orders from the My Bookings page. Once an order is confirmed by the farmer, contact us for changes.",
  },
  {
    q: "How do I track my order?",
    a: "Go to My Bookings to see the status of every order: pending, confirmed, shipped, or delivered.",
  },
];

const farmerFaqs = [
  {
    q: "How do I start selling on FarmFresh?",
    a: "Register a free account and choose Farmer during sign-up. Once registered, you can add products right away.",
  },
  {
    q: "How do I add and manage products?",
    a: "Use Add Product to list new produce with photos, price, and stock. Manage Listings lets you edit, publish, or remove products.",
  },
  {
    q: "How do I receive orders?",
    a: "Orders for your products appear in your dashboard. Confirm them to start the delivery process.",
  },
  {
    q: "Are there any fees to sell?",
    a: "Listing products is free. You sell directly to customers at your own prices.",
  },
];

function FaqList({ faqs }: { faqs: { q: string; a: string }[] }) {
  return (
    <div className="space-y-4">
      {faqs.map((faq) => (
        <details
          key={faq.q}
          className="group bg-white dark:bg-gray-800 rounded-lg shadow-md open:shadow-lg transition"
        >
          <summary className="flex items-center justify-between cursor-pointer px-6 py-4 font-medium text-gray-900 dark:text-white">
            {faq.q}
            <i className="fas fa-chevron-down text-sm text-gray-400 group-open:rotate-180 transition-transform"></i>
          </summary>
          <p className="px-6 pb-4 text-gray-600 dark:text-gray-400">{faq.a}</p>
        </details>
      ))}
    </div>
  );
}

export default function HelpCenterPage() {
  return (
    <>
      <div className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Answers to the most common questions about buying and selling on FarmFresh
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            <i className="fas fa-shopping-basket text-primary-600 dark:text-primary-400 mr-3"></i>
            For Customers
          </h2>
          <FaqList faqs={customerFaqs} />
        </section>

        <section id="farmers" className="mb-12 scroll-mt-24">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            <i className="fas fa-tractor text-primary-600 dark:text-primary-400 mr-3"></i>
            For Farmers
          </h2>
          <FaqList faqs={farmerFaqs} />
        </section>

        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Still need help?</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Our team is happy to answer anything not covered here.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </>
  );
}
