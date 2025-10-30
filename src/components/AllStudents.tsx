import { useState, useEffect } from 'react';
import { ArrowLeft, UserPlus, Trash2, Users, ArrowRightLeft } from 'lucide-react';
import { studentService, allocationService } from '../services/api';
import type { StudentWithComputer } from '../lib/database.types';
import AddStudentModal from './AddStudentModal';
import ReassignStudentModal from './ReassignStudentModal';

interface AllStudentsProps {
  onBack: () => void;
}

export default function AllStudents({ onBack }: AllStudentsProps) {
  const [students, setStudents] = useState<StudentWithComputer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [reassignStudent, setReassignStudent] = useState<StudentWithComputer | null>(null);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await studentService.getAll();
      setStudents(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleDeleteStudent = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This will remove their allocation.`)) {
      return;
    }

    try {
      await studentService.delete(id);
      await loadStudents();
    } catch (err: any) {
      setError(err.message || 'Failed to delete student');
    }
  };

  const handleRemoveAllocation = async (studentId: string, studentName: string) => {
    if (!confirm(`Remove ${studentName} from their current computer?`)) {
      return;
    }

    try {
      await allocationService.deleteByStudentId(studentId);
      await loadStudents();
    } catch (err: any) {
      setError(err.message || 'Failed to remove allocation');
    }
  };

  const handleSuccess = () => {
    setShowAddModal(false);
    setReassignStudent(null);
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
            <h1 className="text-3xl font-bold text-gray-900">All Students</h1>
            <p className="text-gray-600 mt-2">{students.length} total student{students.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <UserPlus size={20} />
            Add Student
          </button>
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
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No students yet</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first student</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Student
          </button>
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
                  Class
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Section
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Computer
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{student.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{student.student_id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Class {student.class}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{student.section || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {student.computer_name ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {student.computer_name}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                        Not assigned
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      {student.computer_name ? (
                        <>
                          <button
                            onClick={() => setReassignStudent(student)}
                            className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded transition-colors"
                            title="Reassign student"
                          >
                            <ArrowRightLeft size={18} />
                          </button>
                          <button
                            onClick={() => handleRemoveAllocation(student.id, student.name)}
                            className="text-orange-600 hover:text-orange-800 p-2 hover:bg-orange-50 rounded transition-colors"
                            title="Remove allocation"
                          >
                            <ArrowRightLeft size={18} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setReassignStudent(student)}
                          className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded transition-colors"
                          title="Assign to computer"
                        >
                          <ArrowRightLeft size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteStudent(student.id, student.name)}
                        className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition-colors"
                        title="Delete student"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <AddStudentModal
          computerId=""
          onClose={() => setShowAddModal(false)}
          onSuccess={handleSuccess}
        />
      )}

      {reassignStudent && (
        <ReassignStudentModal
          student={reassignStudent}
          onClose={() => setReassignStudent(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
