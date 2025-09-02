import Link from "next/link";

const blogPosts = [
  {
    title: "7 Tips for the Job Interview",
    description:
      "Here, It's always a good idea to find out what the business's purpose is. How do they make money? What products and services are they known for? What is their mission, vision, etc.? Also, think about how the department you're part of contributes to the business and how it can contribute to the business's purpose. Check out the profile of [...]",
  },
  {
    title: "What is a Resume and What Should It Contain?",
    description:
      "CV is an abbreviation for Curriculum Vitae, which means 'course of life.' A CV summarizes your work experience, education, and skills. It should be considered an appendix to your actual application and is a very important part of it. If you don't send one, you can be sure that many companies won't [...]",
  },
  {
    title: "Avoid Stress as a Job Seeker",
    description:
      "The pandemic has created even more unpredictability for job seekers. That's why it's more important than ever to create a daily routine and cherish its energy. Job hunting during a pandemic can be risky and stressful. For many months, several industries have been severely impacted by restrictions and closures, and many have also experienced […]",
  },
];

const BlogPost = ({ title, description }) => {
  return (
    <div className="border-l-4 border-[#5E3FA6] pl-4">
      <Link
        href="/blog/job-interview-tips"
        className="text-[#5E3FA6] hover:text-[#4A2F85] transition-colors"
      >
        <h3 className="font-semibold underline text-[#FC5895]">{title}</h3>
      </Link>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
    </div>
  );
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container max-w-screen-md mx-auto py-2">
        {/* Seek and you shall find! */}
        <div className="bg-[#5E3FA6] rounded-lg shadow-lg p-4 mb-4 text-white">
          <h1 className="text-2xl font-bold mb-3">Seek and you shall find!</h1>
          <p className="text-sm text-white/90 mb-4">
            Our website is an easy-to-use web application for applying to
            various companies and government agencies. You can find jobs, open
            positions, and scholarships.
          </p>
          <div className="relative">
            <input
              type="text"
              placeholder="Search for jobs, calls or scholarships"
              className="w-full px-2 py-2 rounded-lg text-sm text-[#5E3FA6] placeholder-[#5E3FA6] bg-gray-300/90 border-none outline-none"
            />
          </div>
        </div>

        {/* Blank gray block */}
        <div className="bg-gray-400/50 rounded-sm w-full h-48 p-4 mb-4"></div>

        {/* Guides block */}
        <div className="mb-4">
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-16 h-12 bg-gray-200 rounded border flex items-center justify-center">
                  <span className="text-gray-400 text-xs">📄</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-[#5E3FA6] text-2xl font-semibold">
                    Guide to
                  </h3>
                  <Link
                    href="/guides"
                    className="text-[#5E3FA6] text-sm font-semibold hover:underline"
                  >
                    ...See more
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/guides"
              className="w-full inline-block px-6 py-2 rounded-md bg-[#E1F3EB] border-2 border-[#6AC79A] text-[#6AC79A] font-semibold hover:bg-[#D4EDDE] transition-colors"
            >
              See all guides
            </Link>
          </div>
        </div>

        {/* Welcome block */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-white border-2 border-[#5E3FA6] rounded-full flex items-center justify-center">
              <span className="text-[#5E3FA6] text-3xl font-semibold">?</span>
            </div>
            <h2 className="text-2xl font-semibold text-[#5E3FA6]">
              Welcome to Apoyoalempleo.com
            </h2>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-[#FC5895]">
              The leading employment guide.
            </h3>

            <p className="text-sm text-gray-600">
              We support your career with multiple job guides for multiple
              companies, calls, applications, scholarships, and internships!
            </p>

            <p className="text-sm text-gray-600">
              You can select your country from the menu below, or you can use
              the search functions above. Simply press Enter and you will find
              various job guides and articles on employment support options. Our
              list of job guides is constantly expanding to include more and
              more job guides.
            </p>

            <div className="mt-4">
              <h4 className="font-semibold text-[#FC5895] mb-2">
                Our employment guides consist of the following 6 steps:
              </h4>
              <ul className="space-y-1 ml-4 text-sm text-gray-600">
                <li>• About the company / call / scholarship</li>
                <li>• Job offers</li>
                <li>• Profile description</li>
                <li>• Requirements</li>
                <li>• Interview process / required documents</li>
                <li>• How to apply</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/guides"
              className="w-full inline-block px-6 py-2 rounded-md bg-[#E1F3EB] border-3 border-[#6AC79A] text-[#6AC79A] font-semibold"
            >
              All employment guides
            </Link>
          </div>
        </div>

        {/* Blog and new block */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-white border-2 border-[#5E3FA6] rounded-full flex items-center justify-center">
              <span className="text-[#5E3FA6] text-4xl font-semibold">☆</span>
            </div>
            <h2 className="text-2xl font-semibold text-[#5E3FA6]">
              Blog and news
            </h2>
          </div>

          <div className="space-y-4">
            {blogPosts.map((post, index) => (
              <BlogPost key={index} {...post} />
            ))}
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/blog"
              className="w-full inline-block px-6 py-2 rounded-md bg-[#E1F3EB] border-3 border-[#6AC79A] text-[#6AC79A] font-semibold"
            >
              All articles
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
