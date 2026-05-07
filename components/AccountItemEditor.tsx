'use client'

import { useState } from 'react'
import { AccountItem, StatementType, DEFAULT_ACCOUNT_ITEMS } from '@/lib/accountItems'

interface Props {
  items: AccountItem[]
  onChange: (items: AccountItem[]) => void
}

export default function AccountItemEditor({ items, onChange }: Props) {
  const [newLabel, setNewLabel] = useState('')
  const [newType, setNewType] = useState<StatementType>('bs')
  const [newCategory, setNewCategory] = useState('')
  const [activeTab, setActiveTab] = useState<StatementType>('bs')

  const filtered = items.filter(i => i.statementType === activeTab)

  const handleAdd = () => {
    if (!newLabel.trim()) return
    const newItem: AccountItem = {
      id: 'custom_' + Date.now(),
      label: newLabel.trim(),
      statementType: newType,
      category: newCategory.trim() || 'カスタム',
      isDefault: false,
    }
    onChange([...items, newItem])
    setNewLabel('')
    setNewCategory('')
  }

  const handleRemove = (id: string) => {
    onChange(items.filter(i => i.id !== id))
  }

  const handleReset = () => {
    if (confirm('科目をデフォルトに戻しますか？')) {
      onChange(DEFAULT_ACCOUNT_ITEMS)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">抽出科目の設定</h3>
        <button onClick={handleReset} className="text-xs text-gray-500 border border-gray-300 rounded-lg px-3 py-1 hover:bg-gray-100">
          デフォルトに戻す
        </button>
      </div>
      <div className="flex border-b border-gray-200">
        {(['bs', 'pl', 'cf'] as StatementType[]).map(type => (
          <button
            key={type}
            onClick={() => setActiveTab(type)}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${activeTab === type ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="p-3 max-h-64 overflow-y-auto">
        {filtered.map(item => (
          <div key={item.id} className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0">
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{item.category}</span>
            <span className="flex-1 text-sm text-gray-800">{item.label}</span>
            {!item.isDefault && (
              <button onClick={() => handleRemove(item.id)} className="text-red-400 hover:text-red-600 text-xs">削除</button>
            )}
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <p className="text-xs font-medium text-gray-600 mb-2">科目を追加</p>
        <div className="flex gap-2">
          <select
            value={newType}
            onChange={e => setNewType(e.target.value as StatementType)}
            className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-400"
          >
            <option value="bs">B/S</option>
            <option value="pl">P/L</option>
            <option value="cf">C/F</option>
          </select>
          <input
            type="text"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            placeholder="カテゴリ"
            className="w-24 text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-400"
          />
          <input
            type="text"
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            placeholder="科目名（例：のれん）"
            className="flex-1 text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-400"
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <button
            onClick={handleAdd}
            className="text-xs bg-blue-600 text-white rounded-lg px-3 py-1.5 hover:bg-blue-700"
          >
            追加
          </button>
        </div>
      </div>
    </div>
  )
}
