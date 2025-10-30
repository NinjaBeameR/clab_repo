import { useState, useEffect } from 'react';
import { Monitor, Users, Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { computerService, studentService, allocationService } from '../services/api';
import type { ComputerWithCount, StudentWithComputer } from '../lib/database.types';

type Section = 'A' | 'B' | 'C';

interface StudentForm {
  name: string;
  studentId: string;
  section: Section | '';
}

export default function ModifyTab() {
  const [computers, setComputers] = useState<ComputerWithCount[]>([]);
  const [students, setStudents] = useState<StudentWithComputer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Computer management
  const [showAddComputer, setShowAddComputer] = useState(false);
  const [newComputerName, setNewComputerName] = useState('');
  const [newComputerLocation, setNewComputerLocation] = useState('');

  // Student allocation form (2 students)
  const [selectedComputerId, setSelectedComputerId] = useState('');
  const [student1, setStudent1] = useState<StudentForm>({ name: '', studentId: '', section: '' });
  const [student2, setStudent2] = useState<StudentForm>({ name: '', studentId: '', section: '' });

  // Edit student
  const [editingStudent, setEditingStudent] = useState<StudentWithComputer | null>(null);
  const [editForm, setEditForm] = useState<StudentForm>({ name: '', studentId: '', section: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [computersData, studentsData] = await Promise.all([
        computerService.getAll(),
        studentService.getAll()
      ]);
      setComputers(computersData);
      setStudents(studentsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  // Computer Management
  const handleAddComputer = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!newComputerName.trim()) {
      setError('Computer name is required');
      return;
    }

    try {
      setLoading(true);
      await computerService.create(newComputerName.trim(), newComputerLocation.trim() || undefined);
      setSuccess('Computer added successfully!');
      setNewComputerName('');
      setNewComputerLocation('');
      setShowAddComputer(false);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to add computer');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComputer = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}? This will remove all student allocations.`)) {
      return;
    }

    clearMessages();
    try {
      setLoading(true);
      await computerService.delete(id);
      setSuccess('Computer deleted successfully!');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete computer');
    } finally {
      setLoading(false);
    }
  };

  // Student Allocation (2 students at once)
  const handleAllocateStudents = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    // Validation
    if (!selectedComputerId) {
      setError('Please select a computer');
      return;
    }

    const hasStudent1 = student1.name && student1.studentId && student1.section;
    const hasStudent2 = student2.name && student2.studentId && student2.section;

    if (!hasStudent1 && !hasStudent2) {
      setError('Please enter at least one student');
      return;
    }

    try {
      setLoading(true);

      // Add student 1
      if (hasStudent1) {
        const newStudent1 = await studentService.create(
          student1.name.trim(),
          student1.studentId.trim(),
          student1.section
        );
        await allocationService.create(newStudent1.id, selectedComputerId);
      }

      // Add student 2
      if (hasStudent2) {
        const newStudent2 = await studentService.create(
          student2.name.trim(),
          student2.studentId.trim(),
          student2.section
        );
        await allocationService.create(newStudent2.id, selectedComputerId);
      }

      setSuccess('Students allocated successfully!');
      setStudent1({ name: '', studentId: '', section: '' });
      setStudent2({ name: '', studentId: '', section: '' });
      setSelectedComputerId('');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to allocate students');
    } finally {
      setLoading(false);
    }
  };

  // Edit Student
  const handleEditStudent = (student: StudentWithComputer) => {
    setEditingStudent(student);
    setEditForm({
      name: student.name,
      studentId: student.student_id,
      section: student.section || ''
    });
    clearMessages();
  };

  const handleSaveEdit = async () => {
    if (!editingStudent) return;
    clearMessages();

    if (!editForm.name || !editForm.studentId || !editForm.section) {
      setError('All fields are required');
      return;
    }

    try {
      setLoading(true);
      await studentService.update(
        editingStudent.id,
        editForm.name.trim(),
        editForm.studentId.trim(),
        editForm.section
      );
      setSuccess('Student updated successfully!');
      setEditingStudent(null);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to update student');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}? This will remove their allocation.`)) {
      return;
    }

    clearMessages();
    try {
      setLoading(true);
      await studentService.delete(id);
      setSuccess('Student deleted successfully!');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete student');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAllocation = async (studentId: string, studentName: string) => {
    if (!confirm(`Remove ${studentName} from their assigned computer?`)) {
      return;
    }

    clearMessages();
    try {
      setLoading(true);
      await allocationService.deleteByStudentId(studentId);
      setSuccess('Allocation removed successfully!');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to remove allocation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Computer Management Section */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Monitor size={24} className="text-blue-600" />
              Manage Computers
            </h2>
            <p className="text-sm text-gray-600 mt-1">Add or remove computers</p>
          </div>
          <button
            onClick={() => setShowAddComputer(!showAddComputer)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            Add Computer
          </button>
        </div>

        {showAddComputer && (
          <form onSubmit={handleAddComputer} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Computer Name *
                </label>
                <input
                  type="text"
                  value={newComputerName}
                  onChange={(e) => setNewComputerName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Computer 1"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location (Optional)
                </label>
                <input
                  type="text"
                  value={newComputerLocation}
                  onChange={(e) => setNewComputerLocation(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Lab A"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                Save Computer
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddComputer(false);
                  setNewComputerName('');
                  setNewComputerLocation('');
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {computers.map((computer) => (
            <div key={computer.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{computer.name}</h3>
                  {computer.location && (
                    <p className="text-sm text-gray-600">{computer.location}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">{computer.student_count} students</p>
                </div>
                <button
                  onClick={() => handleDeleteComputer(computer.id, computer.name)}
                  className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors"
                  title="Delete computer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Student Allocation Section (2 students) */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users size={24} className="text-green-600" />
            Allocate Students to Computer
          </h2>
          <p className="text-sm text-gray-600 mt-1">Add up to 2 students at once</p>
        </div>

        <form onSubmit={handleAllocateStudents} className="space-y-6">
          {/* Computer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Computer *
            </label>
            <select
              value={selectedComputerId}
              onChange={(e) => setSelectedComputerId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="">Choose a computer...</option>
              {computers.map((computer) => (
                <option key={computer.id} value={computer.id}>
                  {computer.name} {computer.location ? `- ${computer.location}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Student 1 */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-3">Student 1</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={student1.name}
                  onChange={(e) => setStudent1({ ...student1, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Student name"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Roll Number
                </label>
                <input
                  type="text"
                  value={student1.studentId}
                  onChange={(e) => setStudent1({ ...student1, studentId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Roll number"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section
                </label>
                <select
                  value={student1.section}
                  onChange={(e) => setStudent1({ ...student1, section: e.target.value as Section | '' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">Select...</option>
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                </select>
              </div>
            </div>
          </div>

          {/* Student 2 */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-semibold text-gray-900 mb-3">Student 2</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={student2.name}
                  onChange={(e) => setStudent2({ ...student2, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Student name"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Roll Number
                </label>
                <input
                  type="text"
                  value={student2.studentId}
                  onChange={(e) => setStudent2({ ...student2, studentId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Roll number"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section
                </label>
                <select
                  value={student2.section}
                  onChange={(e) => setStudent2({ ...student2, section: e.target.value as Section | '' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">Select...</option>
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Allocating...' : 'Allocate Students'}
          </button>
        </form>
      </div>

      {/* Existing Students Management */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users size={24} className="text-purple-600" />
            Manage Existing Students
          </h2>
          <p className="text-sm text-gray-600 mt-1">Edit or delete student records</p>
        </div>

        {students.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            No students yet. Add students using the form above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll Number</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Computer</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    {editingStudent?.id === student.id ? (
                      <>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={editForm.studentId}
                            onChange={(e) => setEditForm({ ...editForm, studentId: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={editForm.section}
                            onChange={(e) => setEditForm({ ...editForm, section: e.target.value as Section | '' })}
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                          >
                            <option value="">Select...</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600">{student.computer_name || '-'}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={handleSaveEdit}
                            className="text-green-600 hover:text-green-800 p-1 hover:bg-green-50 rounded mr-2"
                            title="Save"
                          >
                            <Save size={16} />
                          </button>
                          <button
                            onClick={() => setEditingStudent(null)}
                            className="text-gray-600 hover:text-gray-800 p-1 hover:bg-gray-50 rounded"
                            title="Cancel"
                          >
                            <X size={16} />
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 text-sm text-gray-900">{student.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{student.student_id}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {student.section || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {student.computer_name ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {student.computer_name}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">Not assigned</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleEditStudent(student)}
                            className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded mr-2"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          {student.computer_name && (
                            <button
                              onClick={() => handleRemoveAllocation(student.id, student.name)}
                              className="text-orange-600 hover:text-orange-800 p-1 hover:bg-orange-50 rounded mr-2"
                              title="Remove allocation"
                            >
                              <X size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteStudent(student.id, student.name)}
                            className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
