export default function SelectRepoView() {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl shadow-lg border border-gray-800 p-16 text-center transition-all duration-300 hover:shadow-indigo-500/5 animate-fadeIn">
      <div className="mx-auto h-24 w-24 text-indigo-400 rounded-full bg-indigo-900/30 border border-indigo-700 flex items-center justify-center mb-4">
        <svg
          className="h-12 w-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M20 7l-8-4-8 4m16 0l-8 4m-8-4l8 4m8 0l-8 4-8-4"
          ></path>
        </svg>
      </div>
      <h3 className="text-xl font-medium text-gray-100">Select a Repository</h3>
      <p className="mt-2 text-gray-400 max-w-md mx-auto">
        Choose a repository from the list to get started with generating a
        professional README.
      </p>
    </div>
  );
}
