import Link from "next/link";

export default function JoinFarmerCTA() {
  return (
    <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Grow Your Business with FarmFresh</h2>
        <p className="text-xl text-primary-100 mb-8">
          Join 500+ farmers already selling fresh produce directly to customers
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="?auth=register"
            className="bg-white text-primary-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition"
          >
            Register as Farmer
          </Link>
          <Link
            href="/about-us"
            className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-primary-600 transition"
          >
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
}
