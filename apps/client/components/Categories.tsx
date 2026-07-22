import Link from "next/link";

const CATEGORIES = [
  {
    slug: "vegetables",
    label: "Vegetables",
    icon: "fa-carrot",
    box: "bg-green-100 dark:bg-green-900 group-hover:bg-green-200 dark:group-hover:bg-green-800",
    text: "text-green-600 dark:text-green-400",
  },
  {
    slug: "fruits",
    label: "Fruits",
    icon: "fa-apple-alt",
    box: "bg-red-100 dark:bg-red-900 group-hover:bg-red-200 dark:group-hover:bg-red-800",
    text: "text-red-600 dark:text-red-400",
  },
  {
    slug: "grains",
    label: "Grains",
    icon: "fa-seedling",
    box: "bg-yellow-100 dark:bg-yellow-900 group-hover:bg-yellow-200 dark:group-hover:bg-yellow-800",
    text: "text-yellow-600 dark:text-yellow-400",
  },
  {
    slug: "dairy",
    label: "Dairy",
    icon: "fa-cheese",
    box: "bg-blue-100 dark:bg-blue-900 group-hover:bg-blue-200 dark:group-hover:bg-blue-800",
    text: "text-blue-600 dark:text-blue-400",
  },
  {
    slug: "honey",
    label: "Honey",
    icon: "fa-jar",
    box: "bg-purple-100 dark:bg-purple-900 group-hover:bg-purple-200 dark:group-hover:bg-purple-800",
    text: "text-purple-600 dark:text-purple-400",
  },
  {
    slug: "herbs",
    label: "Herbs",
    icon: "fa-leaf",
    box: "bg-orange-100 dark:bg-orange-900 group-hover:bg-orange-200 dark:group-hover:bg-orange-800",
    text: "text-orange-600 dark:text-orange-400",
  },
];

export default function Categories() {
  return (
    <section className="py-16 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Shop by Category</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover fresh, locally-sourced produce across various categories
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {CATEGORIES.map((category) => (
            <Link key={category.slug} href={`/products?category=${category.slug}`} className="group cursor-pointer">
              <div className={`${category.box} rounded-2xl p-6 text-center transition`}>
                <i className={`fas ${category.icon} text-3xl ${category.text} mb-3`}></i>
                <h3 className="font-semibold text-gray-900 dark:text-white">{category.label}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
