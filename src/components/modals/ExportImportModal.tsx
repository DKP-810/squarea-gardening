import React, { useRef, useState } from 'react'
import { X, Download, Upload, CheckCircle, AlertCircle } from 'lucide-react'
import { exportGarden, importGarden } from '../../utils/exportImport'

interface Props {
  onClose: () => void
}

export function ExportImportModal({ onClose }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleExport() {
    try {
      await exportGarden()
      setStatus('success')
      setMessage('Garden exported successfully!')
    } catch {
      setStatus('error')
      setMessage('Export failed.')
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await importGarden(file)
      setStatus('success')
      setMessage('Garden imported! Reload to see all changes.')
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'Import failed.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Export / Import</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <button onClick={handleExport} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left">
            <Download size={18} className="text-green-600 shrink-0" />
            <div>
              <div className="text-sm font-medium text-gray-900">Export Garden</div>
              <div className="text-xs text-gray-500">Download as JSON backup</div>
            </div>
          </button>

          <button
            onClick={() => fileRef.current?.click()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left"
          >
            <Upload size={18} className="text-blue-600 shrink-0" />
            <div>
              <div className="text-sm font-medium text-gray-900">Import Garden</div>
              <div className="text-xs text-gray-500">Restore from JSON backup (replaces all data)</div>
            </div>
          </button>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />

          {status !== 'idle' && (
            <div className={`flex items-center gap-2 text-sm p-3 rounded-lg ${status === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {status === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {message}
            </div>
          )}
        </div>

        <div className="flex justify-end p-5 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
