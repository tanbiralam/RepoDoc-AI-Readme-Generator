export default function DashboardFooter() {
  return (
    <footer className="mt-auto py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-gray-800 pt-6">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} GitHub README Generator. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
