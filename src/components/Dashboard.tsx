import { useState, useEffect } from 'react';
import { Monitor, Plus, Trash2 } from 'lucide-react';
import { computerService } from '../services/api';
import type { ComputerWithCount } from '../lib/database.types';
import AddComputerModal from './AddComputerModal';

interface DashboardProps {
  onSelectComputer: (computerId: string, computerName: string) => void;
}

export default function Dashboard({ onSelectComputer }: DashboardProps) {
  const [computers, setComputers] = useState<ComputerWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadComputers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await computerService.getAll();
      setComputers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load computers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComputers();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This will remove all student allocations.`)) {
      return;
    }

    try {
      await computerService.delete(id);
      await loadComputers();
    } catch (err: any) {
      setError(err.message || 'Failed to delete computer');
    }
  };

  const handleAddSuccess = () => {
    setShowAddModal(false);
    loadComputers();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading computers...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Computer Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage student allocations across all computers</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          <Plus size={20} />
          Add Computer
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {computers.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <Monitor size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No computers yet</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first computer</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Computer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {computers.map((computer) => (
            <div
              key={computer.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
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
                  <button
                    onClick={() => handleDelete(computer.id, computer.name)}
                    className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors"
                    title="Delete computer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Students Allocated</span>
                    <span className="font-semibold text-blue-600">{computer.student_count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((computer.student_count / 10) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => onSelectComputer(computer.id, computer.name)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  View Students
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <AddComputerModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}
    </div>
  );
}
