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
  // 如果環境變數有設定使用代理，或是明確要求使用代理，則使用代理API
  const useProxy = process.env.NEXT_PUBLIC_USE_PROXY === 'true' || true; // 預設總是使用代理
  
  // 構建原始API URL
  const baseUrl = `http://hl.webtw.xyz/maximo/oslc/script/${scriptName}`;
  
  // 添加必要的查詢參數
  const queryParams: Record<string, any> = {};
  
  if (API_CONFIG.lean) {
    queryParams.lean = 1;
  }
  
  if (params) {
    Object.assign(queryParams, params);
  }
  
  // 構建原始URL的查詢部分
  let originalUrl = baseUrl;
  if (Object.keys(queryParams).length > 0) {
    const queryString = Object.entries(queryParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');
    originalUrl += (originalUrl.includes('?') ? '&' : '?') + queryString;
  }
  
  // 如果使用代理，將完整URL傳遞給代理API
  if (useProxy) {
    // 使用代理API路由
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(originalUrl)}`;
    return proxyUrl;
  } else {
    // 直接使用原始API
    return originalUrl;
  }
};

// 通用API請求函數
const apiRequest = async <T>(
  url: string, 
  method: 'GET' | 'POST' = 'GET',
  body?: any
): Promise<T> => {
  try {
    // 使用代理API
    const isProxyUrl = url.startsWith('/api/proxy');
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        // 其他必要的標頭
      },
      credentials: 'include', // 包含跨域Cookie
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    console.log('向API發送請求:', url);
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
  },

  // 新增：刪除工單附件
  deleteWorkOrderAttachment: async (attachmentId: number): Promise<{ success: boolean; message: string }> => {
    // 判斷是否使用模擬資料
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      await simulateApiDelay(500);
      console.log(`模擬刪除附件 ID: ${attachmentId}`);
      // 模擬成功回應
      return { success: true, message: '附件已成功刪除（模擬）' };
    }

    // 使用實際 API
    // 假設使用 POST 方法並將 ID 作為參數傳遞
    const url = buildApiUrl('MOBILEAPP_DELETE_ATTACHMENT'); 
    try {
      // 注意：將參數名稱從 docinfoid 改為 doclinksid
      const response = await apiRequest<{ success: boolean; message: string }>(url, 'POST', { params: { doclinksid: attachmentId } });
      console.log(`刪除附件 ${attachmentId} (使用 doclinksid) 的 API 回應:`, response);
      if (!response || typeof response.success !== 'boolean') {
         // 如果後端回應格式不符預期，拋出錯誤
         throw new Error('刪除附件的 API 回應格式不正確');
      }
      return response;
    } catch (error) {
      console.error(`刪除附件 ${attachmentId} 失敗:`, error);
      // 根據錯誤類型返回失敗訊息
      return { success: false, message: error instanceof Error ? error.message : '刪除附件時發生未知錯誤' };
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
      
      // 在模擬資料模式下，直接從模擬資料中獲取資源數據
      if (data.cm.resources && data.cm.resources[id]) {
        detail.resources = data.cm.resources[id];
      } else {
        // 設置空的資源結構
        detail.resources = {
          labor: [],
          materials: [],
          tools: []
        };
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
    
    // 處理 isCompleted 欄位格式轉換 (boolean -> 'Y'/'N')
    const modifiedWorkOrder: any = { ...workOrder };
    if (modifiedWorkOrder.isCompleted !== undefined) {
      console.log('原始 isCompleted 值:', modifiedWorkOrder.isCompleted, typeof modifiedWorkOrder.isCompleted);
      
      // 確保將布林值轉換為 'Y'/'N' 字串
      if (typeof modifiedWorkOrder.isCompleted === 'boolean') {
        modifiedWorkOrder.isCompleted = modifiedWorkOrder.isCompleted ? 'Y' : 'N';
      } else if (modifiedWorkOrder.isCompleted === true || modifiedWorkOrder.isCompleted === 1) {
        modifiedWorkOrder.isCompleted = 'Y';
      } else if (modifiedWorkOrder.isCompleted === false || modifiedWorkOrder.isCompleted === 0) {
        modifiedWorkOrder.isCompleted = 'N';
      }
      
      console.log('轉換後 isCompleted 值:', modifiedWorkOrder.isCompleted);
    }
    
    // 使用與PM工單相同的更新API
    console.log('使用PM工單API更新CM工單:', modifiedWorkOrder);
    const url = buildApiUrl('MOBILEAPP_UPDATE_PM_WORKORDER', { wonum: id });
    return apiRequest<CMWorkOrderDetail>(url, 'POST', { params: { workOrder: modifiedWorkOrder } });
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
  
  // 獲取CM工單資源 - 已棄用，請使用 getWorkOrderDetail API
  getWorkOrderResources: async (id: string): Promise<{
    labor: LaborResource[];
    materials: MaterialResource[];
    tools: ToolResource[];
  }> => {
    // 標記為棄用
    console.warn('方法已棄用: cmApi.getWorkOrderResources 將在未來版本中移除');
    console.warn('請使用 cmApi.getWorkOrderDetail API 來取得工單資源，resources 已整合到工單詳情中');
    
    // 判斷是否使用模擬資料
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      await simulateApiDelay();
      // 模擬資料，與原來相同...
      return {
        labor: [
          {
            id: 'L001',
            name: '張工程師',
            laborCode: 'ENG001',
            craftType: '機械工程師',
            hours: 2.5,
            rate: 800,
            cost: 2000
          },
          {
            id: 'L002',
            name: '李技師',
            laborCode: 'TECH002',
            craftType: '電機技師',
            hours: 1.5,
            rate: 650,
            cost: 975
          }
        ],
        materials: [
          {
            id: 'M001',
            itemNum: 'PART001',
            name: '軸承',
            description: '高速軸承',
            quantity: 2,
            unitCost: 1500,
            totalCost: 3000,
            itemType: '備品',
            location: '倉庫A'
          },
          {
            id: 'M002',
            itemNum: 'PART002',
            name: '油封',
            description: '耐高溫油封',
            quantity: 3,
            unitCost: 800,
            totalCost: 2400,
            itemType: '消耗品',
            location: '倉庫B'
          }
        ],
        tools: [
          {
            id: 'T001',
            toolCode: 'TOOL001',
            name: '板手組',
            description: '各尺寸板手組',
            quantity: 1,
            hours: 2.5,
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
    console.warn('API 將在未來版本中移除: MOBILEAPP_GET_CM_WORKORDER_RESOURCES');
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
          model: 'mistral-small:latest', // 或者你可以讓模型名稱成為參數
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

  // 同樣地，如果 CM 工單也需要刪除附件，可以在 cmApi 中加入類似的函數，
  // 或者將其提取到一個共用的 attachmentApi 模組中。
  // 直接複用 PM 的實現 (如果後端端點相同)
  deleteWorkOrderAttachment: pmApi.deleteWorkOrderAttachment
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