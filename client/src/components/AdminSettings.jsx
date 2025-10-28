import React from 'react';

const AdminSettings = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">System Settings</h2>
      
      <div className="space-y-6">
        {/* General Settings */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">General Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Site Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
                placeholder="Movie Booking"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
                placeholder="admin@example.com"
              />
            </div>
          </div>
        </div>

        {/* Booking Settings */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Booking Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Booking Time Limit (minutes)
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
                placeholder="15"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Maximum Tickets per Booking
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
                placeholder="10"
              />
            </div>
          </div>
        </div>

        {/* Email Settings */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Email Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                SMTP Server
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
                placeholder="smtp.example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                SMTP Port
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
                placeholder="587"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90">
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;