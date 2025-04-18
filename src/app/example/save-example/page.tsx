'use client';

import React, { useEffect, useState } from 'react';
import { useDataSave } from '@/hooks/useDataSave';
import SaveButton from '@/components/SaveButton';
import { dataApi } from '@/services/api';

// 範例資料介面
interface ExampleData {
  id: string;
  title: string;
  description: string;
  status: string;
  date: string;
  items: {
    id: string;
    name: string;
    value: number;
  }[];
}

// 模擬初始資料
const mockInitialData: ExampleData = {
  id: '123',
  title: '範例資料',
  description: '這是一個展示資料保存功能的範例',
  status: 'active',
  date: '2023-01-01',
  items: [
    { id: 'item1', name: '項目一', value: 100 },
    { id: 'item2', name: '項目二', value: 200 },
    { id: 'item3', name: '項目三', value: 300 },
  ],
};

const SaveExamplePage: React.FC = () => {
  // 模擬加載資料
  const [initialData, setInitialData] = useState<ExampleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 使用 useDataSave hook 管理資料
  const {
    data,
    setData,
    isDirty,
    saveData,
    resetData,
    isSaving,
    error
  } = useDataSave<ExampleData>({
    initialData,
    async onSave(updatedData) {
      // 使用 dataApi 保存資料
      await dataApi.updateData('EXAMPLE_UPDATE_DATA', updatedData);
    }
  });

  // 模擬載入資料
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // 模擬 API 請求延遲
        await new Promise(resolve => setTimeout(resolve, 1000));
        setInitialData(mockInitialData);
      } catch (error) {
        console.error('載入資料失敗:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // 處理表單欄位變更
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (!data) return;

    const { name, value } = e.target;
    setData({
      ...data,
      [name]: value,
    });
  };

  // 處理子項目變更
  const handleItemChange = (itemId: string, value: number) => {
    if (!data) return;

    setData({
      ...data,
      items: data.items.map(item => 
        item.id === itemId ? { ...item, value } : item
      ),
    });
  };

  if (isLoading) {
    return <div className="p-4">載入中...</div>;
  }

  if (!data) {
    return <div className="p-4">無法載入資料</div>;
  }

  return (
    <div className="max-w-2xl mx-auto my-8 p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">資料編輯範例</h1>
        <div className="flex gap-2">
          <button
            onClick={resetData}
            disabled={!isDirty}
            className={`px-4 py-2 rounded-md ${
              !isDirty
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            取消
          </button>
          <SaveButton
            isDirty={isDirty}
            isSaving={isSaving}
            onSave={saveData}
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error.message}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            標題
          </label>
          <input
            type="text"
            name="title"
            value={data.title}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            描述
          </label>
          <textarea
            name="description"
            value={data.description}
            onChange={handleChange}
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            狀態
          </label>
          <select
            name="status"
            value={data.status}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="active">啟用</option>
            <option value="inactive">停用</option>
            <option value="pending">等待中</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            日期
          </label>
          <input
            type="date"
            name="date"
            value={data.date}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">項目列表</h3>
          <div className="space-y-3">
            {data.items.map(item => (
              <div key={item.id} className="flex items-center gap-3">
                <span className="w-24">{item.name}:</span>
                <input
                  type="number"
                  value={item.value}
                  onChange={(e) => handleItemChange(item.id, Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="text-lg font-medium mb-2">資料預覽</h3>
        <pre className="bg-gray-100 p-3 rounded-md overflow-auto text-sm">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-700">
          <strong>是否有變更:</strong> {isDirty ? '是' : '否'}<br />
          <strong>保存中:</strong> {isSaving ? '是' : '否'}
        </p>
      </div>
    </div>
  );
};

export default SaveExamplePage; 