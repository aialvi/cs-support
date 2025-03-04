import { useState } from 'react';
import { Cog6ToothIcon, EnvelopeIcon, UserGroupIcon, BellIcon } from '@heroicons/react/24/outline';

export default function Settings() {
  const [settings, setSettings] = useState({
    general: {
      defaultPriority: 'normal',
      allowGuestTickets: false,
      ticketsPerPage: 10,
    },
    notifications: {
      adminNewTicket: true,
      adminNewReply: true,
      userNewReply: true,
      emailTemplate: 'default',
    },
    roles: {
      canCreateTickets: ['administrator', 'editor', 'author'],
      canManageTickets: ['administrator'],
      canViewAllTickets: ['administrator', 'editor'],
    },
    email: {
      fromName: 'Support System',
      fromEmail: 'support@example.com',
      replyTo: 'support@example.com',
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');

    try {
      const response = await fetch(CS_SUPPORT_HELPDESK_SETTINGS_CONFIG.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': CS_SUPPORT_HELPDESK_SETTINGS_CONFIG.nonce,
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (data.success) {
        setSaveMessage('Settings saved successfully!');
      } else {
        setSaveMessage('Failed to save settings. Please try again.');
      }
    } catch (error) {
      setSaveMessage('An error occurred while saving settings.');
      console.error('Settings save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Support Helpdesk Settings</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* General Settings */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Cog6ToothIcon className="h-6 w-6 text-gray-500 mr-2" />
              <h2 className="text-xl font-semibold">General Settings</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Default Priority</label>
                <select
                  value={settings.general.defaultPriority}
                  onChange={(e) => handleChange('general', 'defaultPriority', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowGuestTickets"
                  checked={settings.general.allowGuestTickets}
                  onChange={(e) => handleChange('general', 'allowGuestTickets', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="allowGuestTickets" className="ml-2 block text-sm text-gray-900">
                  Allow guest ticket submissions
                </label>
              </div>
            </div>
          </div>

          {/* Email Settings */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-4">
              <EnvelopeIcon className="h-6 w-6 text-gray-500 mr-2" />
              <h2 className="text-xl font-semibold">Email Settings</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">From Name</label>
                <input
                  type="text"
                  value={settings.email.fromName}
                  onChange={(e) => handleChange('email', 'fromName', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">From Email</label>
                <input
                  type="email"
                  value={settings.email.fromEmail}
                  onChange={(e) => handleChange('email', 'fromEmail', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-4">
              <BellIcon className="h-6 w-6 text-gray-500 mr-2" />
              <h2 className="text-xl font-semibold">Notification Settings</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="adminNewTicket"
                  checked={settings.notifications.adminNewTicket}
                  onChange={(e) => handleChange('notifications', 'adminNewTicket', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="adminNewTicket" className="ml-2 block text-sm text-gray-900">
                  Notify admin on new ticket
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="userNewReply"
                  checked={settings.notifications.userNewReply}
                  onChange={(e) => handleChange('notifications', 'userNewReply', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="userNewReply" className="ml-2 block text-sm text-gray-900">
                  Notify users on new replies
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-end space-x-4">
            {saveMessage && (
              <p className={`text-sm ${saveMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                {saveMessage}
              </p>
            )}
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex justify-center rounded-md border border-transparent bg-gray-800 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}