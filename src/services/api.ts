'use client';

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
  owner?: string;  // 添加owner屬性
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
  // 工單附件
  attachments?: WorkOrderAttachment[];
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
  owner?: string;  // 增加owner字段
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
  startTime?: string;  // 維修開始時間
  endTime?: string;    // 維修結束時間
  owner?: string;       // 負責人
  lead?: string;        // 主導人員
  supervisor?: string;  // 監督人員
  // Actual頁面欄位
  failureDetails?: string;  // 故障描述
  repairMethod?: string;    // 修復方法
  isCompleted?: boolean;    // 完成確認
  downtimeHours?: number;   // 停機時間(小時)
  downtimeMinutes?: number; // 停機時間(分鐘)
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

// 定義異常類型和維護類型選項介面
export interface AbnormalMaintenanceOptions {
  abnormalOptions: string[];
  maintenanceOptions: string[];
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

// 定義PM檢查項目附件接口
export interface PmAttachment {
  fileName: string;
  fileType: string;
  fileContent: string;
  description: string;
  wonum: string;
  checkItemId?: string;
  assetSeq?: string;
  photoSeq?: string;
}

// 定義工單附件介面
export interface WorkOrderAttachment {
  id: number;
  fileName: string;
  fileType: string;
  url: string;
  description?: string;
  uploadDate?: string;
  checkItemId?: string;
  assetSeq?: string;
  photoSeq?: string;
}

// 定義工單附件響應介面
export interface AttachmentResponse {
  items: WorkOrderAttachment[];
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
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://hl.webtw.xyz',
  maxApiPath: process.env.NEXT_PUBLIC_MAX_API_PATH || '/maximo/oslc/script',
  lean: process.env.NEXT_PUBLIC_API_LEAN !== 'false',
  headers: {
    'Content-Type': 'application/json',
    'maxauth': process.env.NEXT_PUBLIC_MAX_AUTH || 'bWF4YWRtaW46emFxMXhzVzI='
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
    
    // 嘗試解析回應內容，無論狀態碼如何
    const data = await response.json();
    
    // 檢查API返回的錯誤
    if (data.Error) {
      const errorMessage = data.Error.message || '未知錯誤';
      const reasonCode = data.Error.reasonCode || '';
      throw new Error(`${reasonCode ? `${reasonCode} - ` : ''}${errorMessage}`);
    }
    
    // 如果沒有特定的錯誤對象但HTTP狀態碼表示錯誤
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
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

// 直接導出獲取管理人員列表的函數，方便其他模組直接調用
export const getManagerList = async (): Promise<Manager[]> => {
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
  
  console.log("直接調用MOBILEAPP_GET_MANAGER_LIST...");
  // 使用實際API
  const url = buildApiUrl('MOBILEAPP_GET_MANAGER_LIST');
  return apiRequest<Manager[]>(url);
};

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

        // 模擬附件數據
        detail.attachments = [
          {
            id: 101,
            fileName: 'CI_1_10_001.jpg',
            fileType: 'image/jpeg',
            url: '/api/mock-images/photo1.jpg',
            description: '檢查項目10的照片',
            uploadDate: '2023-07-20T10:30:00',
            checkItemId: '10',
            assetSeq: '1',
            photoSeq: '001'
          },
          {
            id: 102,
            fileName: 'CI_1_15_001.jpg',
            fileType: 'image/jpeg',
            url: '/api/mock-images/photo2.jpg',
            description: '檢查項目15的照片',
            uploadDate: '2023-07-20T10:35:00',
            checkItemId: '15',
            assetSeq: '1',
            photoSeq: '001'
          }
        ];

      } catch (error) {
        console.error('Failed to fetch resources for work order:', id, error);
        // 失敗時不阻塞主要數據返回
      }
      
      return detail;
    }
    
    // 使用實際API
    try {
      console.log(`獲取工單(${id})詳情...`);
      const url = buildApiUrl('MOBILEAPP_GET_PM_WORKORDER_DETAIL', { wonum: id });
      const workOrderDetail = await apiRequest<PMWorkOrderDetail>(url);
      console.log('工單詳情API響應:', workOrderDetail);
      
      // 如果沒有附件數據，獲取附件數據
      if (!workOrderDetail.attachments) {
        try {
          console.log('正在獲取工單附件...');
          const attachments = await pmApi.getWorkOrderAttachments(id);
          workOrderDetail.attachments = attachments;
          console.log(`成功獲取 ${attachments.length} 個附件`);
        } catch (error) {
          console.error('Failed to fetch attachments for work order:', id, error);
          // 失敗時不阻塞主要數據返回
        }
      }
      
      return workOrderDetail;
    } catch (error) {
      console.error('獲取工單詳情失敗:', error);
      throw error;
    }
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
    console.log("pmApi.getManagerList被調用...");
    
    // 判斷是否使用模擬資料
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      console.log("使用模擬數據獲取管理人員列表");
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
    
    console.log("通過API獲取管理人員列表");
    // 使用實際API
    const url = buildApiUrl('MOBILEAPP_GET_MANAGER_LIST');
    console.log("管理人員列表API URL:", url);
    try {
      const result = await apiRequest<Manager[]>(url);
      console.log("管理人員列表API返回結果:", result);
      return result;
    } catch (error) {
      console.error("管理人員列表API返回錯誤:", error);
      throw error;
    }
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
  submitWorkOrder: async (id: string, comment: string, status?: string): Promise<PMWorkOrderDetail> => {
    // 判斷是否使用模擬資料
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      // 保留原有模擬實現...
    }
    
    // 使用實際API
    const url = buildApiUrl('MOBILEAPP_SUBMIT_PM_WORKORDER', { wonum: id });
    return apiRequest<PMWorkOrderDetail>(url, 'POST', { params: { comment, status } });
  },

  // 新增: 獲取PM工單的附件數據
  getWorkOrderAttachments: async (id: string): Promise<WorkOrderAttachment[]> => {
    // 判斷是否使用模擬資料
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      await simulateApiDelay();
      
      // 模擬附件數據
      return [
        {
          id: 101,
          fileName: 'CI_1_10_001.jpg',
          fileType: 'image/jpeg',
          url: '/api/mock-images/photo1.jpg',
          description: '檢查項目10的照片',
          uploadDate: '2023-07-20T10:30:00',
          checkItemId: '10',
          assetSeq: '1',
          photoSeq: '001'
        },
        {
          id: 102,
          fileName: 'CI_1_15_001.jpg',
          fileType: 'image/jpeg',
          url: '/api/mock-images/photo2.jpg',
          description: '檢查項目15的照片',
          uploadDate: '2023-07-20T10:35:00',
          checkItemId: '15',
          assetSeq: '1',
          photoSeq: '001'
        }
      ];
    }
    
    // 使用實際API
    try {
      console.log(`正在獲取工單(${id})附件...`);
      const url = buildApiUrl('MOBILEAPP_GET_PM_WORKORDER_ATTACHMENTS', { wonum: id });
      console.log('附件API URL:', url);
      
      const response = await apiRequest<AttachmentResponse>(url);
      console.log('附件API響應:', response);
      
      // 返回附件列表
      const attachments = response.items || [];
      console.log(`獲取到 ${attachments.length} 個附件`);
      return attachments;
    } catch (error) {
      console.error('獲取附件失敗:', error);
      return [];
    }
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
  
  // 同時獲取異常類型和維護類型列表
  getAbnormalAndMaintenanceOptions: async (): Promise<AbnormalMaintenanceOptions> => {
    // 判斷是否使用模擬資料
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      await simulateApiDelay();
      const response = await fetch('/api/data.json');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data: ApiData = await response.json();
      return {
        abnormalOptions: data.cm.abnormalOptions,
        maintenanceOptions: data.cm.maintenanceOptions
      };
    }
    
    // 使用實際API
    const url = buildApiUrl('MOBILEAPP_GET_ABNORMAL_MAINTENANCE_OPTIONS');
    return apiRequest<AbnormalMaintenanceOptions>(url);
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
        status: 'WAPPR',
        created: new Date().toISOString().split('T')[0].replace(/-/g, '/') + ' ' + new Date().toTimeString().split(' ')[0].substring(0, 5),
        equipmentId: workOrder.equipmentId || '',
        equipmentName: workOrder.equipmentName || '',
        location: workOrder.location || '',
        description: workOrder.description || '',
        abnormalType: workOrder.abnormalType || '',
        maintenanceType: workOrder.maintenanceType || '',
        creator: 'Current User',
        systemEngineer: 'System',
        owner: workOrder.owner || ''  // 添加owner字段
      };
    }
    
    // 使用實際API
    const url = buildApiUrl('MOBILEAPP_CREATE_CM_WORKORDER');
    return apiRequest<CMWorkOrder>(url, 'POST', { params: workOrder });
  },
  
  // 提交CM工單進行核簽
  submitWorkOrder: async (id: string, comment: string, status?: string): Promise<CMWorkOrderDetail> => {
    // 判斷是否使用模擬資料
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      // 保留原有模擬實現...
    }
    
    // 使用實際API - 改用PM工單的submit API
    const url = buildApiUrl('MOBILEAPP_SUBMIT_PM_WORKORDER', { wonum: id });
    return apiRequest<CMWorkOrderDetail>(url, 'POST', { params: { comment, status } });
  },
  
  // 保存CM工單數據
  saveWorkOrder: async (workOrderData: any): Promise<CMWorkOrderDetail> => {
    // 判斷是否使用模擬資料
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      await simulateApiDelay(500);
      console.log('模擬保存CM工單數據:', workOrderData);
      
      // 模擬返回更新後的工單詳情
      return {
        ...workOrderData,
        status: 'WAPPR',
        checkItems: [],
        reportItems: []
      } as unknown as CMWorkOrderDetail;
    }
    
    // 使用與PM工單相同的更新API
    console.log('保存CM工單數據，使用PM更新API:', workOrderData);
    const url = buildApiUrl('MOBILEAPP_UPDATE_PM_WORKORDER', { wonum: workOrderData.id });
    
    // 構建正確的請求體格式
    const requestBody = { params: { workOrder: workOrderData } };
    return apiRequest<CMWorkOrderDetail>(url, 'POST', requestBody);
  },
  
  // 保存CM工單單個欄位
  saveWorkOrderField: async (fieldData: any): Promise<CMWorkOrderDetail> => {
    // 判斷是否使用模擬資料
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      await simulateApiDelay(300);
      console.log('Simulating saving CM work order field - Original data:', JSON.stringify(fieldData));
      
      // 檢查是否有異常類型欄位並記錄
      if ('abnormalType' in fieldData) {
        console.log('Found abnormal type field value:', fieldData.abnormalType);
        console.log('Abnormal type value type:', typeof fieldData.abnormalType);
        console.log('Abnormal type value length:', fieldData.abnormalType.length);
        
        // 確保異常類型值不會被設置為空
        if (!fieldData.abnormalType) {
          console.log('Warning: Abnormal type value is empty');
        }
      }
      
      // 模擬返回更新後的工單詳情
      const result = {
        id: fieldData.id,
        status: 'WAPPR',
        ...fieldData,
        checkItems: [],
        reportItems: []
      } as unknown as CMWorkOrderDetail;
      
      console.log('Simulating saving CM work order field - Result:', JSON.stringify(result));
      return result;
    }
    
    // 使用實際API
    console.log('Preparing to call actual API to save field:', JSON.stringify(fieldData));
    
    // 檢查異常類型欄位 (如果存在)
    if ('abnormalType' in fieldData) {
      console.log('Preparing to save abnormal type:', fieldData.abnormalType);
      
      // 如果異常類型為空，拒絕保存
      if (!fieldData.abnormalType) {
        throw new Error('Abnormal type cannot be empty');
      }
    }
    
    const url = buildApiUrl('MOBILEAPP_UPDATE_PM_WORKORDER', { wonum: fieldData.id });
    
    // 構建正確的請求體，確保欄位被正確包裝
    const requestBody = { params: { workOrder: fieldData } };
    console.log('API request body:', JSON.stringify(requestBody));
    
    return apiRequest<CMWorkOrderDetail>(url, 'POST', requestBody);
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
  },

  // 取消CM工單
  cancelWorkOrder: async (id: string, reason: string): Promise<{ success: boolean; message: string }> => {
    // 判斷是否使用模擬資料
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      await simulateApiDelay(500);
      console.log('模擬取消CM工單:', id, '取消原因:', reason);
      
      // 模擬API返回
      return {
        success: true,
        message: '工單取消成功'
      };
    }
    
    // 使用實際API
    const url = buildApiUrl('MOBILEAPP_CANCEL_CM_WORKORDER', { wonum: id });
    return apiRequest<{ success: boolean; message: string }>(url, 'POST', { reason });
  },

  /**
   * 從 Ollama API 產生故障描述建議
   * @param prompt 提示詞
   * @returns Ollama API 的回應
   */
  async generateFailureDescription(prompt: string): Promise<any> {
    try {
      const response = await fetch('http://ollama.webtw.xyz:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral-small', // 或者你可以讓模型名稱成為參數
          prompt: prompt,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Ollama API error response:", errorData);
        throw new Error(`Ollama API request failed with status ${response.status}: ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log("Ollama API response:", data);
      return data; // 回傳完整的 API 回應
    } catch (error) {
      console.error('Error calling Ollama API:', error);
      throw error; // 將錯誤向上拋出以便呼叫端處理
    }
  },
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

// 檢查項目相關API功能
export const uploadPmAttachment = async (attachment: PmAttachment): Promise<any> => {
  // 判斷是否使用模擬資料
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    await simulateApiDelay(1000);
    console.log('模擬上傳附件:', attachment.fileName);
    return { success: true, message: '附件上傳成功' };
  }
  
  // 使用實際API
  const url = buildApiUrl('MOBILEAPP_UPLOAD_PM_ATTACHMENT');
  return apiRequest(url, 'POST', { params: { attachment } });
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