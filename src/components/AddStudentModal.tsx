import { useState } from 'react';
import { X } from 'lucide-react';
import { studentService, allocationService } from '../services/api';

interface AddStudentModalProps {
  computerId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddStudentModal({ computerId, onClose, onSuccess }: AddStudentModalProps) {
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [section, setSection] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Student name is required');
      return;
    }

    if (!studentId.trim()) {
      setError('Student ID is required');
      return;
    }

    if (!section) {
      setError('Please select a section');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const student = await studentService.create(
        name.trim(),
        studentId.trim(),
        section || undefined
      );
      if (computerId) {
        await allocationService.create(student.id, computerId);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to add student');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add New Student</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Student Name *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., John Doe"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={submitting}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-2">
              Student ID *
            </label>
            <input
              type="text"
              id="studentId"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="e.g., S12345"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={submitting}
            />
          </div>

          <div className="mb-6">
            <div className="block text-sm font-medium text-gray-700 mb-2">Section *</div>
            <div className="flex items-center gap-6">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="section"
                  value="A"
                  checked={section === 'A'}
                  onChange={() => setSection('A')}
                  disabled={submitting}
                />
                <span className="text-sm text-gray-700">A</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="section"
                  value="B"
                  checked={section === 'B'}
                  onChange={() => setSection('B')}
                  disabled={submitting}
                />
                <span className="text-sm text-gray-700">B</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="section"
                  value="C"
                  checked={section === 'C'}
                  onChange={() => setSection('C')}
                  disabled={submitting}
                />
                <span className="text-sm text-gray-700">C</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting ? 'Adding...' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
