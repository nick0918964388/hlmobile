// API服務 - 使用環境變數配置

// 定義PM工單資料介面
export interface PMWorkOrder {
  id: string;
  status: string;
  created: string;
  equipmentId: string;
  equipmentName: string;
  location: string;
  description: string;
  pmType: string;
  frequency: string;
  creator: string;
  systemEngineer: string;
}

// 定義PM工單詳情介面
export interface PMWorkOrderDetail {
  id: string;
  status: string;
  openTime: string;
  creator: string;
  systemCode: string;
  equipmentCode: string;
  description: string;
  assets: string;
  location: string;
  route?: string;
  equipmentType: string;
  reportTime: string;
  reportPerson: string;
  owner?: string;
  lead?: string;
  supervisor?: string;
  startTime?: string;  // 維護開始時間
  endTime?: string;    // 維護結束時間
  checkItems: CheckItem[];
  reportItems: ReportItem[];
  // 資源項目
  resources?: {
    labor: LaborResource[];
    materials: MaterialResource[];
    tools: ToolResource[];
  };
}

// 定義CM工單資料介面
export interface CMWorkOrder {
  id: string;
  status: string;
  created: string;
  equipmentId: string;
  equipmentName: string;
  location: string;
  description: string;
  abnormalType: string;
  maintenanceType: string;
  creator: string;
  systemEngineer: string;
}

// 定義CM工單詳情介面
export interface CMWorkOrderDetail {
  id: string;
  status: string;
  openTime: string;
  creator: string;
  systemCode: string;
  equipmentCode: string;
  description: string;
  assets: string;
  location: string;
  route?: string;
  equipmentType: string;
  abnormalType: string;
  maintenanceType: string;
  workConditions: string;
  costCenter: string;
  longTermMaintenance: boolean;
  reportTime: string;
  reportPerson: string;
  checkItems: CheckItem[];
  reportItems: ReportItem[];
  // 資源項目
  resources?: {
    labor: LaborResource[];
    materials: MaterialResource[];
    tools: ToolResource[];
  };
}

// 定義系統健康狀態介面
export interface SystemHealth {
  status: 'ok' | 'maintenance' | 'error';
  message: string;
  estimatedRecoveryTime?: string;
}

// 定義檢查項目介面
export interface CheckItem {
  id: string;
  name: string;
  standard: string;
  result: string;
  remarks: string;
  assetNum?: string;
  wonum?: string;
}

// 定義報告項目介面
export interface ReportItem {
  id: string;
  name: string;
  description: string;
  completed: boolean;
}

// 定義勞工資源介面
export interface LaborResource {
  id: string;
  name: string;
  laborCode: string;
  craftType: string;
  hours: number;
  startTime?: string;
  endTime?: string;
  rate?: number;
  cost?: number;
  status?: 'new' | 'update' | 'delete'; // 資源狀態: 新增、更新、刪除
}

// 定義物料資源介面
export interface MaterialResource {
  id: string;
  itemNum: string;
  name: string;
  description: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  location?: string;
  itemType?: string;
  lotNum?: string;
  status?: 'new' | 'update' | 'delete'; // 資源狀態: 新增、更新、刪除
}

// 定義工具資源介面
export interface ToolResource {
  id: string;
  toolCode: string;
  name: string;
  description: string;
  quantity: number;
  hours?: number;
  rate?: number;
  location?: string;
  status?: 'new' | 'update' | 'delete'; // 資源狀態: 新增、更新、刪除
}

// 定義設備選項介面
export interface EquipmentOption {
  id: string;
  name: string;
  location: string;
}

// 定義員工介面
export interface Staff {
  id: string;
  name: string;
}

// 定義管理人員介面
export interface Manager extends Staff {
  role?: string;
  department?: string;
}

// 定義狀態翻譯介面
export interface StatusTranslation {
  zh: string;
  en: string;
}

// 定義用戶介面
export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  groups: string[];
  department: string;
  permissions?: string[];
}

// 定義API返回的完整資料介面
interface ApiData {
  pm: {
    list: PMWorkOrder[];
    details: { [id: string]: PMWorkOrderDetail };
    staffList: Staff[];
    // 新增PM工單資源資料
    resources: {
      [id: string]: {
        labor: LaborResource[];
        materials: MaterialResource[];
        tools: ToolResource[];
      }
    };
  };
  cm: {
    list: CMWorkOrder[];
    details: { [id: string]: CMWorkOrderDetail };
    equipmentOptions: EquipmentOption[];
    abnormalOptions: string[];
    maintenanceOptions: string[];
    staffList: Staff[];
    // 新增CM工單資源資料
    resources: {
      [id: string]: {
        labor: LaborResource[];
        materials: MaterialResource[];
        tools: ToolResource[];
      }
    };
  };
  statusTranslations: { [status: string]: StatusTranslation };
  users: {
    current: User;
    list: User[];
  };
}

// API環境配置
const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost',
  maxApiPath: process.env.NEXT_PUBLIC_MAX_API_PATH || '/maximo/oslc/script',
  lean: process.env.NEXT_PUBLIC_API_LEAN !== 'false',
  headers: {
    'Content-Type': 'application/json',
    'maxauth': process.env.NEXT_PUBLIC_MAX_AUTH || ''
  }
};

// 建構API URL的輔助函數
const buildApiUrl = (scriptName: string, params?: Record<string, string | number | boolean>) => {
  // 判斷是否在客戶端且是生產環境，如果是則使用代理
  const isClient = typeof window !== 'undefined';
  const isProduction = process.env.NODE_ENV === 'production';
  
  let url;
  if (isClient && isProduction) {
    // 使用代理路徑，去除原本的基本 URL
    const apiPath = API_CONFIG.maxApiPath.startsWith('/') 
      ? API_CONFIG.maxApiPath.substring(1) 
      : API_CONFIG.maxApiPath;
    url = `/api/proxy/${apiPath}/${scriptName}`;
  } else {
    // 開發環境使用原始設定
    url = `${API_CONFIG.baseUrl}${API_CONFIG.maxApiPath}/${scriptName}`;
  }
  
  const queryParams = API_CONFIG.lean ? { lean: 1 } : {};
  
  if (params) {
    Object.assign(queryParams, params);
  }
  
  const queryString = Object.entries(queryParams)
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&');
  
  if (queryString) {
    url += `?${queryString}`;
  }
  
  return url;
};

// 通用API請求函數
const apiRequest = async <T>(
  url: string, 
  method: 'GET' | 'POST' = 'GET',
  body?: any
): Promise<T> => {
  try {
    const options: RequestInit = {
      method,
      headers: API_CONFIG.headers,
      credentials: 'include', // 包含跨域Cookie
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // 檢查API返回的錯誤
    if (data.Error) {
      throw new Error(data.Error.message || '未知錯誤');
    }
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data as T;
  } catch (error) {
    console.error(`API request failed: ${url}`, error);
    throw error;
  }
};

// 模擬API回應延遲
const simulateApiDelay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// 導出 apiRequest 讓其他模組可以使用
export { apiRequest };

// 數據更新相關API功能
export const dataApi = {
  // 更新資料到伺服器
  updateData: async <T>(
    endpoint: string,
    data: T
  ): Promise<T> => {
    // 判斷是否使用模擬資料
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      await simulateApiDelay(1000);
      console.log('模擬更新資料到伺服器:', endpoint, data);
      return data;
    }
    
    // 使用實際API
    const url = buildApiUrl(endpoint);
    return apiRequest<T>(url, 'POST', data);
  }
};

// PM相關API功能
export const pmApi = {
  // 獲取PM工單列表
  getWorkOrders: async (): Promise<PMWorkOrder[]> => {
    // 判斷是否使用模擬資料
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      await simulateApiDelay();
      const response = await fetch('/api/data.json');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data: ApiData = await response.json();
      return data.pm.list;
    }
    
    // 使用實際API
    const url = buildApiUrl('MOBILEAPP_GET_PM_WORKORDERS');
    return apiRequest<PMWorkOrder[]>(url);
  },
  
  // 獲取PM工單詳情
  getWorkOrderDetail: async (id: string): Promise<PMWorkOrderDetail> => {
    // 判斷是否使用模擬資料
    console.log(process.env.NEXT_PUBLIC_USE_MOCK_DATA);
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      await simulateApiDelay();
      const response = await fetch('/api/data.json');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data: ApiData = await response.json();
      const detail = data.pm.details[id];
      
      if (!detail) {
        throw new Error(`Work order with ID ${id} not found`);
      }
      
      // 如果有資源數據，添加到工單詳情中
      try {
        const resources = await pmApi.getWorkOrderResources(id);
        detail.resources = resources;
      } catch (error) {
        console.error('Failed to fetch resources for work order:', id, error);
        // 失敗時不阻塞主要數據返回
      }
      
      return detail;
    }
    
    // 使用實際API
    const url = buildApiUrl('MOBILEAPP_GET_PM_WORKORDER_DETAIL', { wonum: id });
    const workOrderDetail = await apiRequest<PMWorkOrderDetail>(url);
    
    // resources 已整合到 MOBILEAPP_GET_PM_WORKORDER_DETAIL API 中，不需要再次獲取
    
    return workOrderDetail;
  },
  
  // 獲取PM工單的資源數據
  getWorkOrderResources: async (id: string): Promise<{
    labor: LaborResource[];
    materials: MaterialResource[];
    tools: ToolResource[];
  }> => {
    // 判斷是否使用模擬資料
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      await simulateApiDelay();
      
      // 模擬資源數據
      return {
        labor: [
          {
            id: 'L001',
            name: '工程師',
            laborCode: 'ENG',
            craftType: '電子',
            hours: 2.5,
            startTime: '2023-05-10T09:00:00',
            endTime: '2023-05-10T11:30:00',
            rate: 500,
            cost: 1250
          },
          {
            id: 'L002',
            name: '技術員',
            laborCode: 'TECH',
            craftType: '機械',
            hours: 3,
            startTime: '2023-05-10T13:00:00',
            endTime: '2023-05-10T16:00:00',
            rate: 350,
            cost: 1050
          }
        ],
        materials: [
          {
            id: 'M001',
            itemNum: 'IT001',
            name: '濾芯',
            description: '空氣濾芯',
            quantity: 2,
            unitCost: 150,
            totalCost: 300,
            itemType: '耗材',
            location: '倉庫A'
          },
          {
            id: 'M002',
            itemNum: 'IT002',
            name: '潤滑油',
            description: '高級機械潤滑油',
            quantity: 1,
            unitCost: 200,
            totalCost: 200,
            itemType: '耗材',
            location: '倉庫B'
          }
        ],
        tools: [
          {
            id: 'T001',
            toolCode: 'TL001',
            name: '測量儀',
            description: '精密測量儀器',
            quantity: 1,
            hours: 2,
            rate: 100,
            location: '工具室A'
          },
          {
            id: 'T002',
            toolCode: 'TL002',
            name: '扳手組',
            description: '機械扳手組',
            quantity: 1,
            hours: 3,
            location: '工具室B'
          }
        ]
      };
    }
    
    // 使用實際API
    const url = buildApiUrl('MOBILEAPP_GET_PM_WORKORDER_RESOURCES', { wonum: id });
    return apiRequest<{
      labor: LaborResource[];
      materials: MaterialResource[];
      tools: ToolResource[];
    }>(url);
  },
  
  // 獲取員工列表
  getStaffList: async (): Promise<Staff[]> => {
    // 判斷是否使用模擬資料
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      await simulateApiDelay();
      const response = await fetch('/api/data.json');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data: ApiData = await response.json();
      return data.pm.staffList;
    }
    
    // 使用實際API
    const url = buildApiUrl('MOBILEAPP_GET_STAFF_LIST');
    return apiRequest<Staff[]>(url);
  },
  
  // 獲取可擔任owner、lead、supervisor的人員清單
  getManagerList: async (): Promise<Manager[]> => {
    // 判斷是否使用模擬資料
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      await simulateApiDelay();
      
      // 模擬管理人員資料
      return [
        {
          id: 'M001',
          name: '張三',
          role: '主管',
          department: '維修部'
        },
        {
          id: 'M002',
          name: '李四',
          role: '工程師',
          department: '工程部'
        },
        {
          id: 'M003',
          name: '王五',
          role: '技術主管',
          department: '技術部'
        },
        {
          id: 'M004',
          name: '趙六',
          role: '部門經理',
          department: '維修部'
        }
      ];
    }
    
    // 使用實際API
    const url = buildApiUrl('MOBILEAPP_GET_MANAGER_LIST');
    return apiRequest<Manager[]>(url);
  },
  
  // 更新PM工單
  updateWorkOrder: async (id: string, workOrder: Partial<PMWorkOrderDetail>): Promise<PMWorkOrderDetail> => {
    // 判斷是否使用模擬資料
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      // 保留原有模擬實現...
    }
    
    // 使用實際API
    const url = buildApiUrl('MOBILEAPP_UPDATE_PM_WORKORDER', { wonum: id });
    return apiRequest<PMWorkOrderDetail>(url, 'POST', { params: { workOrder } });
  },
  
  // 提交PM工單進行核簽
  submitWorkOrder: async (id: string, comment: string): Promise<PMWorkOrderDetail> => {
    // 判斷是否使用模擬資料
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      // 保留原有模擬實現...
    }
    
    // 使用實際API
    const url = buildApiUrl('MOBILEAPP_SUBMIT_PM_WORKORDER', { wonum: id });
    return apiRequest<PMWorkOrderDetail>(url, 'POST', { params: { comment } });
  }
};

// CM相關API功能
export const cmApi = {
  // 獲取CM工單列表
  getWorkOrders: async (): Promise<CMWorkOrder[]> => {
    // 判斷是否使用模擬資料
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      await simulateApiDelay();
      const response = await fetch('/api/data.json');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data: ApiData = await response.json();
      return data.cm.list;
    }
    
    // 使用實際API
    const url = buildApiUrl('MOBILEAPP_GET_CM_WORKORDERS');
    return apiRequest<CMWorkOrder[]>(url);
  },
  
  // 獲取CM工單詳情
  getWorkOrderDetail: async (id: string): Promise<CMWorkOrderDetail> => {
    // 判斷是否使用模擬資料
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      await simulateApiDelay();
      const response = await fetch('/api/data.json');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data: ApiData = await response.json();
      const detail = data.cm.details[id];
      
      if (!detail) {
        throw new Error(`Work order with ID ${id} not found`);
      }
      
      // 如果有資源數據，添加到工單詳情中
      try {
        const resources = await cmApi.getWorkOrderResources(id);
        detail.resources = resources;
      } catch (error) {
        console.error('Failed to fetch resources for work order:', id, error);
        // 失敗時不阻塞主要數據返回
      }
      
      return detail;
    }
    
    // 使用實際API
    const url = buildApiUrl('MOBILEAPP_GET_CM_WORKORDER_DETAIL', { wonum: id });
    const workOrderDetail = await apiRequest<CMWorkOrderDetail>(url);
    
    // resources 已整合到 MOBILEAPP_GET_CM_WORKORDER_DETAIL API 中，不需要再次獲取
    
    return workOrderDetail;
  },
  
  // 獲取設備選項列表
  getEquipmentOptions: async (): Promise<EquipmentOption[]> => {
    // 判斷是否使用模擬資料
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      await simulateApiDelay();
      const response = await fetch('/api/data.json');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data: ApiData = await response.json();
      return data.cm.equipmentOptions;
    }
    
    // 使用實際API
    const url = buildApiUrl('MOBILEAPP_GET_EQUIPMENT_OPTIONS');
    return apiRequest<EquipmentOption[]>(url);
  },
  
  // 獲取異常類型列表
  getAbnormalOptions: async (): Promise<string[]> => {
    // 判斷是否使用模擬資料
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      await simulateApiDelay();
      const response = await fetch('/api/data.json');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data: ApiData = await response.json();
      return data.cm.abnormalOptions;
    }
    
    // 使用實際API
    const url = buildApiUrl('MOBILEAPP_GET_ABNORMAL_OPTIONS');
    return apiRequest<string[]>(url);
  },
  
  // 獲取維護類型列表
  getMaintenanceOptions: async (): Promise<string[]> => {
    // 判斷是否使用模擬資料
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      await simulateApiDelay();
      const response = await fetch('/api/data.json');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data: ApiData = await response.json();
      return data.cm.maintenanceOptions;
    }
    
    // 使用實際API
    const url = buildApiUrl('MOBILEAPP_GET_MAINTENANCE_OPTIONS');
    return apiRequest<string[]>(url);
  },
  
  // 獲取員工列表
  getStaffList: async (): Promise<Staff[]> => {
    // 判斷是否使用模擬資料
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      await simulateApiDelay();
      const response = await fetch('/api/data.json');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data: ApiData = await response.json();
      return data.cm.staffList;
    }
    
    // 使用實際API
    const url = buildApiUrl('MOBILEAPP_GET_STAFF_LIST');
    return apiRequest<Staff[]>(url);
  },
  
  // 更新CM工單
  updateWorkOrder: async (id: string, workOrder: Partial<CMWorkOrderDetail>): Promise<CMWorkOrderDetail> => {
    // 判斷是否使用模擬資料
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      // 保留原有模擬實現...
    }
    
    // 使用實際API
    const url = buildApiUrl('MOBILEAPP_UPDATE_CM_WORKORDER', { wonum: id });
    return apiRequest<CMWorkOrderDetail>(url, 'POST', { params: { workOrder } });
  },
  
  // 建立新的CM工單
  createWorkOrder: async (workOrder: Partial<CMWorkOrder>): Promise<CMWorkOrder> => {
    // 判斷是否使用模擬資料
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      // 這裡模擬建立操作，實際應該是發送POST請求到API
      console.log('Creating new CM work order with:', workOrder);
      
      // 模擬建立成功並返回一個帶有ID的工單
      const newId = `WOC${Date.now().toString().substring(0, 8)}`;
      
      return {
        id: newId,
        status: 'waiting_approval',
        created: new Date().toISOString().split('T')[0].replace(/-/g, '/') + ' ' + new Date().toTimeString().split(' ')[0].substring(0, 5),
        equipmentId: workOrder.equipmentId || '',
        equipmentName: workOrder.equipmentName || '',
        location: workOrder.location || '',
        description: workOrder.description || '',
        abnormalType: workOrder.abnormalType || '',
        maintenanceType: workOrder.maintenanceType || '',
        creator: 'Current User',
        systemEngineer: 'System'
      };
    }
    
    // 使用實際API
    const url = buildApiUrl('MOBILEAPP_CREATE_CM_WORKORDER');
    return apiRequest<CMWorkOrder>(url, 'POST', { params: workOrder });
  },
  
  // 提交CM工單進行核簽
  submitWorkOrder: async (id: string, comment: string): Promise<CMWorkOrderDetail> => {
    // 判斷是否使用模擬資料
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      // 保留原有模擬實現...
    }
    
    // 使用實際API
    const url = buildApiUrl('MOBILEAPP_SUBMIT_CM_WORKORDER', { wonum: id });
    return apiRequest<CMWorkOrderDetail>(url, 'POST', { params: { comment } });
  },
  
  // 獲取CM工單的資源數據
  getWorkOrderResources: async (id: string): Promise<{
    labor: LaborResource[];
    materials: MaterialResource[];
    tools: ToolResource[];
  }> => {
    // 判斷是否使用模擬資料
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      await simulateApiDelay();
      
      // 模擬資源數據
      return {
        labor: [
          {
            id: 'L001',
            name: '維修工程師',
            laborCode: 'REPAIR',
            craftType: '電子',
            hours: 3.5,
            startTime: '2023-05-15T09:00:00',
            endTime: '2023-05-15T12:30:00',
            rate: 550,
            cost: 1925
          },
          {
            id: 'L002',
            name: '助理技術員',
            laborCode: 'ASST',
            craftType: '電氣',
            hours: 2,
            startTime: '2023-05-15T13:00:00',
            endTime: '2023-05-15T15:00:00',
            rate: 300,
            cost: 600
          }
        ],
        materials: [
          {
            id: 'M001',
            itemNum: 'CM001',
            name: '控制板',
            description: '主控制電路板',
            quantity: 1,
            unitCost: 1500,
            totalCost: 1500,
            itemType: '零件',
            location: '倉庫C'
          },
          {
            id: 'M002',
            itemNum: 'CM002',
            name: '連接線',
            description: '高壓連接線',
            quantity: 3,
            unitCost: 100,
            totalCost: 300,
            itemType: '耗材',
            location: '倉庫A'
          }
        ],
        tools: [
          {
            id: 'T001',
            toolCode: 'CMTL001',
            name: '電壓測試儀',
            description: '高精度電壓測試儀',
            quantity: 1,
            hours: 2,
            rate: 150,
            location: '工具室A'
          },
          {
            id: 'T002',
            toolCode: 'CMTL002',
            name: '螺絲刀組',
            description: '精密螺絲刀組',
            quantity: 1,
            hours: 3.5,
            location: '工具室C'
          }
        ]
      };
    }
    
    // 使用實際API
    const url = buildApiUrl('MOBILEAPP_GET_CM_WORKORDER_RESOURCES', { wonum: id });
    return apiRequest<{
      labor: LaborResource[];
      materials: MaterialResource[];
      tools: ToolResource[];
    }>(url);
  }
};

// 通用API功能
export const commonApi = {
  // 獲取狀態翻譯
  getStatusTranslations: async (): Promise<{ [status: string]: StatusTranslation }> => {
    // 判斷是否使用模擬資料
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      await simulateApiDelay();
      const response = await fetch('/api/data.json');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data: ApiData = await response.json();
      return data.statusTranslations;
    }
    
    // 使用實際API
    const url = buildApiUrl('MOBILEAPP_GET_STATUS_TRANSLATIONS');
    return apiRequest<{ [status: string]: StatusTranslation }>(url);
  }
};

// 用戶相關API功能
export const userApi = {
  // 獲取當前用戶信息
  getCurrentUser: async (): Promise<User> => {
    // 判斷是否使用模擬資料
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      await simulateApiDelay();
      const response = await fetch('/api/data.json');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data: ApiData = await response.json();
      return data.users.current;
    }
    
    // 使用實際API
    const url = buildApiUrl('MOBILEAPP_GET_CURRENT_USER');
    return apiRequest<User>(url);
  },
  
  // 獲取用戶列表
  getUserList: async (): Promise<User[]> => {
    // 判斷是否使用模擬資料
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      await simulateApiDelay();
      const response = await fetch('/api/data.json');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data: ApiData = await response.json();
      return data.users.list;
    }
    
    // 使用實際API
    const url = buildApiUrl('MOBILEAPP_GET_USER_LIST');
    return apiRequest<User[]>(url);
  },
  
  // 獲取用戶信息
  getUserById: async (id: string): Promise<User | null> => {
    // 判斷是否使用模擬資料
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      await simulateApiDelay();
      const response = await fetch('/api/data.json');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data: ApiData = await response.json();
      const user = data.users.list.find(user => user.id === id);
      return user || null;
    }
    
    // 使用實際API
    const url = buildApiUrl('MOBILEAPP_GET_USER_BY_ID', { id });
    return apiRequest<User | null>(url);
  },
  
  // 檢查用戶是否有特定權限
  hasPermission: async (permission: string): Promise<boolean> => {
    // 判斷是否使用模擬資料
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      const currentUser = await userApi.getCurrentUser();
      return currentUser.permissions?.includes(permission) || false;
    }
    
    // 使用實際API
    const url = buildApiUrl('MOBILEAPP_CHECK_USER_PERMISSION', { permission });
    return apiRequest<boolean>(url);
  },
  
  // 獲取用戶所屬群組
  getUserGroups: async (): Promise<string[]> => {
    // 判斷是否使用模擬資料
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      const currentUser = await userApi.getCurrentUser();
      return currentUser.groups || [];
    }
    
    // 使用實際API
    const url = buildApiUrl('MOBILEAPP_GET_USER_GROUPS');
    return apiRequest<string[]>(url);
  }
};

// 匯出API服務
export default {
  pm: pmApi,
  cm: cmApi,
  common: commonApi,
  user: userApi,
  // 新增系統健康檢查API
  health: {
    // 獲取系統健康狀態
    getSystemHealth: async (): Promise<SystemHealth> => {
      // 判斷是否使用模擬資料
      if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
        await simulateApiDelay();
        
        // 模擬健康狀態
        return {
          status: 'ok',
          message: '系統運行正常'
        };
      }
      
      // 使用實際API
      const url = buildApiUrl('MOBILEAPP_GET_SYSTEM_HEALTH');
      return apiRequest<SystemHealth>(url);
    }
  },
  // 新增管理人員API
  manager: {
    // 獲取可擔任owner、lead、supervisor的人員清單
    getManagerList: async (): Promise<Manager[]> => {
      return pmApi.getManagerList();
    }
  }
}; 