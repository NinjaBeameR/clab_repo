import { useState, useEffect } from 'react';
import { Monitor, Users } from 'lucide-react';
import { computerService, studentService } from '../services/api';
import type { ComputerWithCount, Student } from '../lib/database.types';

type Section = 'A' | 'B' | 'C';

export default function ListTab() {
  const [computers, setComputers] = useState<ComputerWithCount[]>([]);
  const [selectedComputer, setSelectedComputer] = useState<ComputerWithCount | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadComputers();
  }, []);

  useEffect(() => {
    if (selectedComputer && selectedSection) {
      loadStudentsByComputerAndSection();
    }
  }, [selectedComputer, selectedSection]);

  const loadComputers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await computerService.getAll();
      // Sort computers naturally (Computer 1, Computer 2, ..., Computer 10, Computer 20)
      const sorted = data.sort((a, b) => {
        const regex = /(\d+)/g;
        const aParts = a.name.split(regex);
        const bParts = b.name.split(regex);
        
        for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
          const aPart = aParts[i];
          const bPart = bParts[i];
          
          if (aPart !== bPart) {
            const aNum = parseInt(aPart);
            const bNum = parseInt(bPart);
            
            if (!isNaN(aNum) && !isNaN(bNum)) {
              return aNum - bNum;
            }
            return aPart.localeCompare(bPart);
          }
        }
        return aParts.length - bParts.length;
      });
      setComputers(sorted);
    } catch (err: any) {
      setError(err.message || 'Failed to load computers');
    } finally {
      setLoading(false);
    }
  };

  const loadStudentsByComputerAndSection = async () => {
    if (!selectedComputer || !selectedSection) return;

    try {
      setLoading(true);
      setError(null);
      const allStudents = await studentService.getByComputerId(selectedComputer.id);
      const filtered = allStudents.filter(s => s.section === selectedSection);
      setStudents(filtered);
    } catch (err: any) {
      setError(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleComputerSelect = (computer: ComputerWithCount) => {
    setSelectedComputer(computer);
    setSelectedSection(null);
    setStudents([]);
  };

  const handleSectionSelect = (section: Section) => {
    setSelectedSection(section);
  };

  const handleBack = () => {
    if (selectedSection) {
      setSelectedSection(null);
      setStudents([]);
    } else if (selectedComputer) {
      setSelectedComputer(null);
      setSelectedSection(null);
      setStudents([]);
    }
  };

  if (loading && computers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading computers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span 
          className={selectedComputer ? "cursor-pointer hover:text-blue-600" : "font-medium text-gray-900"}
          onClick={() => !selectedComputer || handleBack()}
        >
          Computers
        </span>
        {selectedComputer && (
          <>
            <span>→</span>
            <span 
              className={selectedSection ? "cursor-pointer hover:text-blue-600" : "font-medium text-gray-900"}
              onClick={() => selectedSection && handleBack()}
            >
              {selectedComputer.name}
            </span>
          </>
        )}
        {selectedSection && (
          <>
            <span>→</span>
            <span className="font-medium text-gray-900">Section {selectedSection}</span>
          </>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Computer List */}
      {!selectedComputer && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Select a Computer</h2>
            <p className="text-gray-600 mt-1">Choose a computer to view its allocated students</p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search computers by name..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {computers.length === 0 ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <Monitor size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No computers available</h3>
              <p className="text-gray-600">Add computers from the Modify tab to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {computers
                .filter(computer => 
                  computer.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((computer) => (
                <button
                  key={computer.id}
                  onClick={() => handleComputerSelect(computer)}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all border border-gray-200 p-6 text-left hover:border-blue-400"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Monitor size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{computer.name}</h3>
                      {computer.location && (
                        <p className="text-sm text-gray-500">{computer.location}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Students</span>
                    <span className="font-semibold text-blue-600">{computer.student_count}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Section Selection */}
      {selectedComputer && !selectedSection && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Select Section</h2>
            <p className="text-gray-600 mt-1">Choose a section to view students in {selectedComputer.name}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['A', 'B', 'C'] as Section[]).map((section) => (
              <button
                key={section}
                onClick={() => handleSectionSelect(section)}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all border-2 border-gray-200 p-8 hover:border-blue-400"
              >
                <div className="text-center">
                  <div className="text-5xl font-bold text-blue-600 mb-2">Section {section}</div>
                  <p className="text-gray-600">Click to view students</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Students List */}
      {selectedComputer && selectedSection && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedComputer.name} - Section {selectedSection}
            </h2>
            <p className="text-gray-600 mt-1">
              {students.length} student{students.length !== 1 ? 's' : ''} allocated
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-lg text-gray-600">Loading students...</div>
            </div>
          ) : students.length === 0 ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No students allocated</h3>
              <p className="text-gray-600">
                No students are assigned to {selectedComputer.name} in Section {selectedSection}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roll Number
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Section
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student, index) => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{index + 1}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{student.student_id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          Section {student.section}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
