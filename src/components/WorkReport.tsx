import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ReportItem, LaborResource, MaterialResource, ToolResource } from '@/services/api';

interface Material {
  id: string;
  code: string;
  name: string;
  quantity: number;
}

interface Tool {
  id: string;
  code: string;
  name: string;
  quantity: number;
}

interface LaborHour {
  id: string;
  staffId: string;
  staffName: string;
  hours: number;
}

interface WorkReportProps {
  workOrderId: string;
  onCompleteStatusChange?: (isComplete: boolean) => void;
  initialReportItems?: ReportItem[];
  resources?: {
    labor?: LaborResource[];
    materials?: MaterialResource[];
    tools?: ToolResource[];
  };
}

const WorkReport: React.FC<WorkReportProps> = ({ workOrderId, onCompleteStatusChange, initialReportItems, resources }) => {
  const { language } = useLanguage();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [laborHours, setLaborHours] = useState<LaborHour[]>([]);
  const [reportItems, setReportItems] = useState<ReportItem[]>([]);
  const [newMaterial, setNewMaterial] = useState({ code: '', name: '', quantity: 1 });
  const [newTool, setNewTool] = useState({ code: '', name: '', quantity: 1 });
  const [newLabor, setNewLabor] = useState({ staffId: '', staffName: '', hours: 1 });
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [showAddTool, setShowAddTool] = useState(false);
  const [showAddLabor, setShowAddLabor] = useState(false);
  const [customMaterial, setCustomMaterial] = useState(false);
  const [customTool, setCustomTool] = useState(false);
  const [customLabor, setCustomLabor] = useState(false);

  // 模擬材料列表
  const materialList = [
    { code: 'M001', name: '螺絲' },
    { code: 'M002', name: '螺帽' },
    { code: 'M003', name: '墊片' },
    { code: 'M004', name: '電線' },
    { code: 'M005', name: '接頭' }
  ];

  // 模擬工具列表
  const toolList = [
    { code: 'T001', name: '扳手' },
    { code: 'T002', name: '螺絲刀' },
    { code: 'T003', name: '鉗子' },
    { code: 'T004', name: '捶子' },
    { code: 'T005', name: '電鑽' }
  ];

  // 模擬人員列表
  const staffList = [
    { id: 'S001', name: '張三' },
    { id: 'S002', name: '李四' },
    { id: 'S003', name: '王五' },
    { id: 'S004', name: '趙六' }
  ];

  // 文字翻譯對照表
  const translations = {
    resource: {
      zh: '資源',
      en: 'Resource'
    },
    laborHours: {
      zh: '施工人員工時',
      en: 'Labor Hours'
    },
    materials: {
      zh: '材料',
      en: 'Materials'
    },
    tools: {
      zh: '工具',
      en: 'Tools'
    },
    add: {
      zh: '新增',
      en: 'Add'
    },
    cancel: {
      zh: '取消',
      en: 'Cancel'
    },
    confirm: {
      zh: '確認',
      en: 'Confirm'
    },
    code: {
      zh: '代號',
      en: 'Code'
    },
    name: {
      zh: '名稱',
      en: 'Name'
    },
    quantity: {
      zh: '數量',
      en: 'Quantity'
    },
    hours: {
      zh: '工時',
      en: 'Hours'
    },
    action: {
      zh: '操作',
      en: 'Action'
    },
    remove: {
      zh: '移除',
      en: 'Remove'
    },
    selectStaff: {
      zh: '選擇人員',
      en: 'Select Staff'
    },
    customInput: {
      zh: '自訂輸入',
      en: 'Custom Input'
    },
    selectMaterial: {
      zh: '選擇材料',
      en: 'Select Material'
    },
    selectTool: {
      zh: '選擇工具',
      en: 'Select Tool'
    },
    noLaborRecords: {
      zh: '無施工人員工時記錄',
      en: 'No labor hours records'
    },
    noMaterialRecords: {
      zh: '無材料記錄',
      en: 'No material records'
    },
    noToolRecords: {
      zh: '無工具記錄',
      en: 'No tool records'
    },
    reportItems: {
      zh: '報告項目',
      en: 'Report Items'
    },
    completed: {
      zh: '已完成',
      en: 'Completed'
    },
    noReportItems: {
      zh: '無報告項目',
      en: 'No report items'
    }
  };

  const t = (key: keyof typeof translations) => {
    return translations[key][language];
  };

  // 初始化報告項目
  useEffect(() => {
    if (initialReportItems && initialReportItems.length > 0) {
      setReportItems(initialReportItems);
    }
  }, [initialReportItems]);

  // 初始化資源數據
  useEffect(() => {
    if (resources) {
      // 如果API返回了labor資源，將其轉換為laborHours格式並設置
      if (resources.labor && resources.labor.length > 0) {
        const laborData = resources.labor.map(labor => ({
          id: labor.id,
          staffId: labor.laborCode,
          staffName: labor.name,
          hours: labor.hours
        }));
        setLaborHours(laborData);
      }

      // 如果API返回了materials資源，將其轉換為materials格式並設置
      if (resources.materials && resources.materials.length > 0) {
        const materialsData = resources.materials.map(material => ({
          id: material.id,
          code: material.itemNum,
          name: material.name,
          quantity: Math.abs(Math.floor(material.quantity))
        }));
        setMaterials(materialsData);
      }

      // 如果API返回了tools資源，將其轉換為tools格式並設置
      if (resources.tools && resources.tools.length > 0) {
        const toolsData = resources.tools.map(tool => ({
          id: tool.id,
          code: tool.toolCode,
          name: tool.name,
          quantity: Math.abs(Math.floor(tool.quantity))
        }));
        setTools(toolsData);
      }
    }
  }, [resources]);

  // 載入暫存的資料
  useEffect(() => {
    const savedData = localStorage.getItem(`workReport_${workOrderId}`);
    if (savedData && (!resources || Object.keys(resources).length === 0)) {
      try {
        const parsedData = JSON.parse(savedData);
        setMaterials(parsedData.materials || []);
        setTools(parsedData.tools || []);
        setLaborHours(parsedData.laborHours || []);
      } catch (error) {
        console.error('Error parsing saved data:', error);
      }
    }
  }, [workOrderId, resources]);

  // 當資料變更時，儲存到 localStorage
  useEffect(() => {
    const dataToSave = {
      materials,
      tools,
      laborHours
    };
    localStorage.setItem(`workReport_${workOrderId}`, JSON.stringify(dataToSave));

    // 檢查是否有任何資源被填寫
    const isComplete = 
      (materials.length > 0 || tools.length > 0 || laborHours.length > 0) &&
      (reportItems.length === 0 || reportItems.every(item => item.completed));
    
    onCompleteStatusChange?.(isComplete);
  }, [materials, tools, laborHours, reportItems, workOrderId, onCompleteStatusChange]);

  // 處理報告項目狀態變更
  const handleReportItemStatusChange = (id: string, completed: boolean) => {
    setReportItems(items => 
      items.map(item =>
        item.id === id ? { ...item, completed } : item
      )
    );
  };

  const handleAddMaterial = () => {
    if (newMaterial.code.trim() && (newMaterial.name.trim() || customMaterial) && newMaterial.quantity > 0) {
      const id = `material_${Date.now()}`;
      setMaterials([...materials, { id, ...newMaterial, quantity: Math.abs(Math.floor(newMaterial.quantity)) }]);
      setNewMaterial({ code: '', name: '', quantity: 1 });
      setShowAddMaterial(false);
      setCustomMaterial(false);
    }
  };

  const handleAddTool = () => {
    if (newTool.code.trim() && (newTool.name.trim() || customTool) && newTool.quantity > 0) {
      const id = `tool_${Date.now()}`;
      setTools([...tools, { id, ...newTool, quantity: Math.abs(Math.floor(newTool.quantity)) }]);
      setNewTool({ code: '', name: '', quantity: 1 });
      setShowAddTool(false);
      setCustomTool(false);
    }
  };

  const handleAddLabor = () => {
    if (newLabor.staffId.trim() && (newLabor.staffName.trim() || customLabor) && newLabor.hours > 0) {
      const id = `labor_${Date.now()}`;
      setLaborHours([...laborHours, { id, ...newLabor }]);
      setNewLabor({ staffId: '', staffName: '', hours: 1 });
      setShowAddLabor(false);
      setCustomLabor(false);
    }
  };

  const handleRemoveMaterial = (id: string) => {
    setMaterials(materials.filter(item => item.id !== id));
  };

  const handleRemoveTool = (id: string) => {
    setTools(tools.filter(item => item.id !== id));
  };

  const handleRemoveLabor = (id: string) => {
    setLaborHours(laborHours.filter(item => item.id !== id));
  };

  const handleMaterialChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCode = e.target.value;
    const selected = materialList.find(item => item.code === selectedCode);
    if (selected) {
      setNewMaterial({ ...newMaterial, code: selected.code, name: selected.name });
    }
  };

  const handleToolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCode = e.target.value;
    const selected = toolList.find(item => item.code === selectedCode);
    if (selected) {
      setNewTool({ ...newTool, code: selected.code, name: selected.name });
    }
  };

  const handleStaffChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selected = staffList.find(item => item.id === selectedId);
    if (selected) {
      setNewLabor({ ...newLabor, staffId: selected.id, staffName: selected.name });
    }
  };

  const renderReportItems = () => {
    if (reportItems.length === 0) {
      return (
        <div className="text-center py-4 text-gray-500">{t('noReportItems')}</div>
      );
    }

    return (
      <div className="space-y-4">
        {reportItems.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-base font-medium text-gray-800">{item.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
              </div>
              <div>
                <button
                  onClick={() => handleReportItemStatusChange(item.id, !item.completed)}
                  className={`rounded-md px-3 py-1 text-sm font-medium ${
                    item.completed
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {item.completed ? '✓' : '○'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderLaborList = () => {
    if (laborHours.length === 0) {
      return (
        <div className="text-center py-6 text-gray-500">
          {t('noLaborRecords')}
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('code')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('name')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('hours')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('action')}
              </th>
            </tr>
          </thead>
          <tbody>
            {laborHours.map(labor => (
              <tr key={labor.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm">{labor.staffId}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">{labor.staffName}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">{labor.hours}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleRemoveLabor(labor.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    {t('remove')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderMaterialList = () => {
    if (materials.length === 0) {
      return (
        <div className="text-center py-6 text-gray-500">
          {t('noMaterialRecords')}
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('code')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('name')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('quantity')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('action')}
              </th>
            </tr>
          </thead>
          <tbody>
            {materials.map(material => (
              <tr key={material.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm">{material.code}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">{material.name}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">{material.quantity}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleRemoveMaterial(material.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    {t('remove')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderToolList = () => {
    if (tools.length === 0) {
      return (
        <div className="text-center py-6 text-gray-500">
          {t('noToolRecords')}
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('code')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('name')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('quantity')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('action')}
              </th>
            </tr>
          </thead>
          <tbody>
            {tools.map(tool => (
              <tr key={tool.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm">{tool.code}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">{tool.name}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">{tool.quantity}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleRemoveTool(tool.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    {t('remove')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="mx-auto p-4 max-w-4xl">
        {/* 報告項目部分 */}
        {reportItems.length > 0 && (
          <div className="bg-white rounded-lg shadow-md mb-4">
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium">{t('reportItems')}</h2>
            </div>
            <div className="p-4">
              {renderReportItems()}
            </div>
          </div>
        )}

        {/* 施工人員工時部分 */}
        <div className="bg-white rounded-lg shadow-md mb-4">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-medium">{t('laborHours')}</h2>
            <button
              onClick={() => setShowAddLabor(!showAddLabor)}
              className="bg-blue-500 text-white rounded-md px-3 py-1 text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              {t('add')}
            </button>
          </div>
          <div className="p-4">
            {showAddLabor && (
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <div className="mb-3">
                  <div className="flex items-center mb-2">
                    <input
                      id="custom-labor"
                      type="checkbox"
                      checked={customLabor}
                      onChange={(e) => {
                        setCustomLabor(e.target.checked);
                        if (!e.target.checked) {
                          setNewLabor({ ...newLabor, staffId: '', staffName: '' });
                        }
                      }}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <label htmlFor="custom-labor" className="ml-2 block text-sm text-gray-700">
                      {t('customInput')}
                    </label>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('code')}
                    </label>
                    {customLabor ? (
                      <input
                        type="text"
                        value={newLabor.staffId}
                        onChange={(e) => setNewLabor({ ...newLabor, staffId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      <select
                        onChange={handleStaffChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value=""
                      >
                        <option value="" disabled>
                          {t('selectStaff')}
                        </option>
                        {staffList.map(staff => (
                          <option key={staff.id} value={staff.id}>
                            {staff.id} - {staff.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('name')}
                    </label>
                    {customLabor ? (
                      <input
                        type="text"
                        value={newLabor.staffName}
                        onChange={(e) => setNewLabor({ ...newLabor, staffName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      <input
                        type="text"
                        value={newLabor.staffName}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('hours')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={newLabor.hours}
                      onChange={(e) => setNewLabor({ ...newLabor, hours: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setShowAddLabor(false);
                      setCustomLabor(false);
                      setNewLabor({ staffId: '', staffName: '', hours: 1 });
                    }}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-400"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={handleAddLabor}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                  >
                    {t('confirm')}
                  </button>
                </div>
              </div>
            )}
            {renderLaborList()}
          </div>
        </div>

        {/* 材料部分 */}
        <div className="bg-white rounded-lg shadow-md mb-4">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-medium">{t('materials')}</h2>
            <button
              onClick={() => setShowAddMaterial(!showAddMaterial)}
              className="bg-blue-500 text-white rounded-md px-3 py-1 text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              {t('add')}
            </button>
          </div>
          <div className="p-4">
            {showAddMaterial && (
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <div className="mb-3">
                  <div className="flex items-center mb-2">
                    <input
                      id="custom-material"
                      type="checkbox"
                      checked={customMaterial}
                      onChange={(e) => {
                        setCustomMaterial(e.target.checked);
                        if (!e.target.checked) {
                          setNewMaterial({ ...newMaterial, code: '', name: '' });
                        }
                      }}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <label htmlFor="custom-material" className="ml-2 block text-sm text-gray-700">
                      {t('customInput')}
                    </label>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('code')}
                    </label>
                    {customMaterial ? (
                      <input
                        type="text"
                        value={newMaterial.code}
                        onChange={(e) => setNewMaterial({ ...newMaterial, code: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      <select
                        onChange={handleMaterialChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value=""
                      >
                        <option value="" disabled>
                          {t('selectMaterial')}
                        </option>
                        {materialList.map(material => (
                          <option key={material.code} value={material.code}>
                            {material.code} - {material.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('name')}
                    </label>
                    {customMaterial ? (
                      <input
                        type="text"
                        value={newMaterial.name}
                        onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      <input
                        type="text"
                        value={newMaterial.name}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('quantity')}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newMaterial.quantity}
                      onChange={(e) => setNewMaterial({ ...newMaterial, quantity: Math.abs(parseInt(e.target.value) || 1) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setShowAddMaterial(false);
                      setCustomMaterial(false);
                      setNewMaterial({ code: '', name: '', quantity: 1 });
                    }}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-400"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={handleAddMaterial}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                  >
                    {t('confirm')}
                  </button>
                </div>
              </div>
            )}
            {renderMaterialList()}
          </div>
        </div>

        {/* 工具部分 */}
        <div className="bg-white rounded-lg shadow-md mb-4">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-medium">{t('tools')}</h2>
            <button
              onClick={() => setShowAddTool(!showAddTool)}
              className="bg-blue-500 text-white rounded-md px-3 py-1 text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              {t('add')}
            </button>
          </div>
          <div className="p-4">
            {showAddTool && (
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <div className="mb-3">
                  <div className="flex items-center mb-2">
                    <input
                      id="custom-tool"
                      type="checkbox"
                      checked={customTool}
                      onChange={(e) => {
                        setCustomTool(e.target.checked);
                        if (!e.target.checked) {
                          setNewTool({ ...newTool, code: '', name: '' });
                        }
                      }}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <label htmlFor="custom-tool" className="ml-2 block text-sm text-gray-700">
                      {t('customInput')}
                    </label>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('code')}
                    </label>
                    {customTool ? (
                      <input
                        type="text"
                        value={newTool.code}
                        onChange={(e) => setNewTool({ ...newTool, code: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      <select
                        onChange={handleToolChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value=""
                      >
                        <option value="" disabled>
                          {t('selectTool')}
                        </option>
                        {toolList.map(tool => (
                          <option key={tool.code} value={tool.code}>
                            {tool.code} - {tool.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('name')}
                    </label>
                    {customTool ? (
                      <input
                        type="text"
                        value={newTool.name}
                        onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      <input
                        type="text"
                        value={newTool.name}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('quantity')}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newTool.quantity}
                      onChange={(e) => setNewTool({ ...newTool, quantity: Math.abs(parseInt(e.target.value) || 1) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setShowAddTool(false);
                      setCustomTool(false);
                      setNewTool({ code: '', name: '', quantity: 1 });
                    }}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-400"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={handleAddTool}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                  >
                    {t('confirm')}
                  </button>
                </div>
              </div>
            )}
            {renderToolList()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkReport; 