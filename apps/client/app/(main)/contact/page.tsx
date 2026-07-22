import type { Metadata } from "next";
import Contact from "@/components/Contact";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the FarmFresh team by email, phone, or visit us in Dhaka.",
};

const channels = [
  { icon: "fa-envelope", title: "Email", detail: "info@farmfresh.com", href: "mailto:info@farmfresh.com" },
  { icon: "fa-phone", title: "Phone", detail: "+880 1700-000000", href: "tel:+8801700000000" },
  { icon: "fa-map-marker-alt", title: "Office", detail: "Dhaka, Bangladesh", href: null },
];

export default function ContactPage() {
  return (
    <>
      <div className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Questions, feedback, or partnership ideas? We&apos;d love to hear from you.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {channels.map((channel) => (
            <div
              key={channel.title}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 text-center"
            >
              <div className="bg-primary-100 dark:bg-primary-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className={`fas ${channel.icon} text-primary-600 dark:text-primary-400`}></i>
              </div>
              <h2 className="font-semibold text-gray-900 dark:text-white mb-1">{channel.title}</h2>
              {channel.href ? (
                <a
                  href={channel.href}
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                >
                  {channel.detail}
                </a>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">{channel.detail}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <Contact />
    </>
  );
}
