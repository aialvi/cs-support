import { useState } from 'react';
import {
  PencilSquareIcon,
  FolderIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { __ } from '@wordpress/i18n';

export default function CreateTicket() {
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    priority: 'normal',
    description: '',
    status: 'NEW',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch('/wp-json/cs-support/v1/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': CS_SUPPORT_HELPDESK_CREATE_TICKET_CONFIG.nonce,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log(data);

      if (data.success) {
        setMessage(__('Ticket created successfully!', 'cs-support'));
        setFormData({
          subject: '',
          category: '',
          priority: 'normal',
          description: '',
        });
      } else {
        setMessage(__('Failed to create ticket. Please try again.', 'cs-support'));
      }
    } catch (error) {
      setMessage(__('An error occurred. Please try again.', 'cs-support'), error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div class='h-screen bg-gray-100 '>
      <div className='h-[calc(100vh-var(--wp-admin--admin-bar--height)-100px)] max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-5 mb-0 pb-0'>
        <form
          onSubmit={handleSubmit}
          className='max-w-3xl h-fit space-y-1 p-8 mt-3 rounded-md flex flex-col gap-1 bg-white shadow-md'
        >
          <h1 className='text-2xl font-semibold pb-2'>{__('Create a new ticket', 'cs-support')}</h1>
          <div className='flex items-center w-full space-x-2 mt-3 my-2'>
            <PencilSquareIcon className='h-5 w-5' />
            <label htmlFor='subject' className='block text-sm font-medium'>
              {__('Subject', 'cs-support')}
            </label>
          </div>
          <input
            type='text'
            name='subject'
            id='subject'
            required
            value={formData.subject}
            onChange={handleChange}
            className='block min-w-full max-h-12 h-12 grow py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6 rounded-md shadow-sm border-gray-300'
          />

          <div className='flex items-center space-x-2 mt-5 mb-2 w-full'>
            <FolderIcon className='h-5 w-5' />
            <label htmlFor='category' className='block text-sm font-medium'>
              {__('Category', 'cs-support')}
            </label>
          </div>
          <select
            name='category'
            id='category'
            required
            value={formData.category}
            onChange={handleChange}
            className='block min-w-full min-h-12 h-12 grow py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6 rounded-md shadow-sm border-gray-300'
          >
            <option value=''>{__('Select a category', 'cs-support')}</option>
            <option value='technical'>{__('Technical', 'cs-support')}</option>
            <option value='billing'>{__('Billing', 'cs-support')}</option>
            <option value='general'>{__('General', 'cs-support')}</option>
          </select>

          <div className='flex items-center space-x-2 mt-5 mb-1 w-full'>
            <ExclamationTriangleIcon className='h-5 w-5' />
            <label htmlFor='priority' className='block text-sm font-medium'>
              {__('Priority', 'cs-support')}
            </label>
          </div>
          <select
            name='priority'
            id='priority'
            required
            value={formData.priority}
            onChange={handleChange}
            className='block min-w-full min-h-12 h-12 grow py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6 rounded-md shadow-sm border-gray-300'
          >
            <option value='low'>{__('Low', 'cs-support')}</option>
            <option value='normal'>{__('Normal', 'cs-support')}</option>
            <option value='high'>{__('High', 'cs-support')}</option>
            <option value='urgent'>{__('Urgent', 'cs-support')}</option>
          </select>

          <div className='flex items-center w-full space-x-2 mt-5 mb-2'>
            <DocumentTextIcon className='h-5 w-5' />
            <label htmlFor='description' className='block text-sm font-medium'>
              {__('Description', 'cs-support')}
            </label>
          </div>
          <textarea
            name='description'
            id='description'
            required
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className='block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline min-h-25 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:-outline-offset-2 focus:outline-emerald-600 sm:text-sm/6'
          />

          {message && (
            <div
              className={`p-4 rounded-md ${
                message.includes('success')
                  ? 'bg-green-50 text-green-800'
                  : 'bg-red-50 text-red-800'
              }`}
            >
              {message}
            </div>
          )}

          <button
            type='submit'
            disabled={isSubmitting}
            className='inline-flex justify-center rounded-md border border-transparent bg-gray-800 py-2 px-4 mt-5 mb-2 text-sm font-medium shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 text-white'
          >
            {isSubmitting ? __('Creating...', 'cs-support') : __('Create Ticket', 'cs-support')}
          </button>
        </form>
      </div>
    </div>
  );
}
