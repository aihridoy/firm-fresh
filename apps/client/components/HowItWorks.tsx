const steps = [
  {
    number: 1,
    icon: "fa-search",
    title: "Browse & Choose",
    description: "Explore fresh produce from local farmers near you",
  },
  {
    number: 2,
    icon: "fa-shopping-cart",
    title: "Order & Pay",
    description: "Place your order with secure and easy checkout",
  },
  {
    number: 3,
    icon: "fa-truck",
    title: "Fresh Delivery",
    description: "Get farm-fresh produce delivered to your door",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-16 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            From farm to your table in three simple steps
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Dotted connector line (desktop only) */}
          <div className="hidden md:block absolute top-8 left-[16.66%] right-[16.66%] border-t-2 border-dashed border-primary-300 dark:border-primary-700"></div>

          {steps.map((step) => (
            <div key={step.number} className="relative text-center">
              <div className="relative z-10 bg-primary-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className={`fas ${step.icon} text-2xl text-white`}></i>
                <span className="absolute -top-1 -right-1 bg-white dark:bg-gray-800 border-2 border-primary-600 text-primary-600 dark:text-primary-400 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">
                  {step.number}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
