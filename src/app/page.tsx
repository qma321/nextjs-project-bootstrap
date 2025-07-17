export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Field Services GPS Tracker
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Streamline your field operations with GPS-based check-in/out system 
            and automated wage calculations for your employees.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                GPS Check In/Out
              </h2>
              <p className="text-gray-600 mb-6">
                Employees can easily check in and out of job locations using their device's GPS. 
                Accurate location tracking ensures proper time and attendance records.
              </p>
              <a 
                href="/check-in-out"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Start Check In/Out
              </a>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-green-600 rounded-full"></div>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Wage Calculator
              </h2>
              <p className="text-gray-600 mb-6">
                Calculate daily, weekly, and monthly wages based on recorded work hours. 
                Get detailed breakdowns and work session reports.
              </p>
              <a 
                href="/wages"
                className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Calculate Wages
              </a>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Check In</h3>
              <p className="text-gray-600">
                Employees check in at job locations using GPS coordinates for accurate tracking.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Work & Check Out</h3>
              <p className="text-gray-600">
                Complete work tasks and check out when finished to record total work time.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Calculate Wages</h3>
              <p className="text-gray-600">
                Automatically calculate wages based on hours worked and hourly rates.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              Demo Version Notice
            </h3>
            <p className="text-yellow-700">
              This is a demonstration version. In production, data would be stored in a secure database 
              and include user authentication, advanced reporting, and administrative features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
