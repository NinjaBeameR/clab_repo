import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { studentService, allocationService } from '../services/api';
import type { StudentWithComputer } from '../lib/database.types';

interface AllocateStudentModalProps {
  computerId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AllocateStudentModal({ computerId, onClose, onSuccess }: AllocateStudentModalProps) {
  const [students, setStudents] = useState<StudentWithComputer[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await studentService.getAll();
      setStudents(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudentId) {
      setError('Please select a student');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await allocationService.create(selectedStudentId, computerId);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to allocate student');
    } finally {
      setSubmitting(false);
    }
  };

  const availableStudents = students.filter(s => !s.computer_id || s.computer_id === computerId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Allocate Existing Student</h2>
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

          {loading ? (
            <div className="text-center py-8 text-gray-600">Loading students...</div>
          ) : availableStudents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No students available for allocation</p>
              <p className="text-sm text-gray-500">All students are already allocated to computers</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <label htmlFor="student" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Student *
                </label>
                <select
                  id="student"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={submitting}
                >
                  <option value="">Choose a student...</option>
                  {availableStudents.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.student_id})
                      {student.computer_name && ` - Currently at ${student.computer_name}`}
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
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  {submitting ? 'Allocating...' : 'Allocate Student'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
