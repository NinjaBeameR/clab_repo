import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { computerService, allocationService } from '../services/api';
import type { Computer, StudentWithComputer } from '../lib/database.types';

interface ReassignStudentModalProps {
  student: StudentWithComputer;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReassignStudentModal({ student, onClose, onSuccess }: ReassignStudentModalProps) {
  const [computers, setComputers] = useState<Computer[]>([]);
  const [selectedComputerId, setSelectedComputerId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComputers();
  }, []);

  const loadComputers = async () => {
    try {
      setLoading(true);
      const data = await computerService.getAll();
      setComputers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load computers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedComputerId) {
      setError('Please select a computer');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await allocationService.create(student.id, selectedComputerId);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to reassign student');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {student.computer_name ? 'Reassign' : 'Assign'} Student
          </h2>
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

          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Student</div>
            <div className="font-semibold text-gray-900">{student.name}</div>
            <div className="text-sm text-gray-600">{student.student_id}</div>
            {student.computer_name && (
              <div className="text-sm text-blue-600 mt-2">
                Currently assigned to: {student.computer_name}
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-600">Loading computers...</div>
          ) : computers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No computers available</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <label htmlFor="computer" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Computer *
                </label>
                <select
                  id="computer"
                  value={selectedComputerId}
                  onChange={(e) => setSelectedComputerId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={submitting}
                >
                  <option value="">Choose a computer...</option>
                  {computers.map((computer) => (
                    <option key={computer.id} value={computer.id}>
                      {computer.name}
                      {computer.location && ` - ${computer.location}`}
                    </option>
                  ))}
                </select>
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
                  {submitting ? 'Assigning...' : student.computer_name ? 'Reassign' : 'Assign'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
