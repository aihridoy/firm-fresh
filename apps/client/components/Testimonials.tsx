const testimonials = [
  {
    name: "Farhana Ahmed",
    review:
      "The vegetables arrived the same day they were harvested — you can really taste the difference. My family won't shop anywhere else now.",
  },
  {
    name: "Rakib Hasan",
    review:
      "I love knowing exactly which farm my food comes from. The mangoes and honey are fresher than anything I've found in the market.",
  },
  {
    name: "Nusrat Jahan",
    review:
      "Ordering is simple and delivery is always on time. Supporting local farmers while getting farm-fresh produce is a win-win.",
  },
];

export default function Testimonials() {
  return (
    <section className="py-16 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">What Our Customers Say</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Real experiences from customers who choose farm-fresh every day
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
            >
              <i className="fas fa-quote-left text-2xl text-primary-300 dark:text-primary-700 mb-4"></i>
              <div className="flex text-yellow-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <i key={i} className="fas fa-star text-sm"></i>
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">{testimonial.review}</p>
              <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
