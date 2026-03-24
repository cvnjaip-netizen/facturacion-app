'use client';

import { Trash2 } from 'lucide-react';
import { useState } from 'react';

interface DeleteButtonProps {
  onConfirm: () => void;
  itemName?: string;
  loading?: boolean;
}

export default function DeleteButton({ onConfirm, itemName = 'este elemento', loading = false }: DeleteButtonProps) {
  const [showDialog, setShowDialog] = useState(false);

  const handleDelete = () => {
    onConfirm();
    setShowDialog(false);
  };

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        disabled={loading}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
      >
        <Trash2 size={16} />
        Eliminar
      </button>

      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900">Confirmar eliminación</h3>
            <p className="text-gray-600 mt-2">
              ¿Estás seguro de que deseas eliminar {itemName}? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowDialog(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
