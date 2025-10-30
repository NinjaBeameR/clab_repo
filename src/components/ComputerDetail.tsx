import { useState, useEffect } from 'react';
import { ArrowLeft, UserPlus, Trash2, Users } from 'lucide-react';
import { studentService, allocationService } from '../services/api';
import type { Student } from '../lib/database.types';
import AddStudentModal from './AddStudentModal';
import AllocateStudentModal from './AllocateStudentModal';

interface ComputerDetailProps {
  computerId: string;
  computerName: string;
  onBack: () => void;
}

export default function ComputerDetail({ computerId, computerName, onBack }: ComputerDetailProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [selectedSections, setSelectedSections] = useState<Record<string, boolean>>({ A: true, B: true, C: true });

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await studentService.getByComputerId(computerId);
      setStudents(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [computerId]);

  const handleRemoveStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`Remove ${studentName} from ${computerName}?`)) {
      return;
    }

    try {
      await allocationService.deleteByStudentId(studentId);
      await loadStudents();
    } catch (err: any) {
      setError(err.message || 'Failed to remove student');
    }
  };

  const handleSuccess = () => {
    setShowAddModal(false);
    setShowAllocateModal(false);
    loadStudents();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading students...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{computerName}</h1>
            <p className="text-gray-600 mt-2">{students.length} student{students.length !== 1 ? 's' : ''} allocated</p>
            <div className="mt-3 flex items-center gap-3 text-sm text-gray-700">
              <div className="font-medium">Filter Sections:</div>
              {(['A','B','C'] as const).map(s => (
                <label key={s} className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!selectedSections[s]}
                    onChange={() => setSelectedSections(prev => ({ ...prev, [s]: !prev[s] }))}
                  />
                  <span>{s}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAllocateModal(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 transition-colors shadow-md"
            >
              <UserPlus size={20} />
              Allocate Existing
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              <UserPlus size={20} />
              Add New Student
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {students.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No students allocated</h3>
          <p className="text-gray-600 mb-4">Add students to this computer to get started</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowAllocateModal(true)}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Allocate Existing Student
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add New Student
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Section
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students
                .filter(student => {
                  const sec = student.section || '';
                  return !!selectedSections[sec] || (sec === '' && (selectedSections['A'] || selectedSections['B'] || selectedSections['C']));
                })
                .map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{student.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{student.student_id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{student.section || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleRemoveStudent(student.id, student.name)}
                      className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition-colors"
                      title="Remove student"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <AddStudentModal
          computerId={computerId}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleSuccess}
        />
      )}

      {showAllocateModal && (
        <AllocateStudentModal
          computerId={computerId}
          onClose={() => setShowAllocateModal(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
