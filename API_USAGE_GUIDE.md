# API 使用指南

本文檔提供關於如何在專案中使用 API 服務的說明。目前 API 是模擬的，使用 JSON 文件作為資料來源，但設計方式使得未來可以輕鬆替換為真實的後端 API。

## 資料結構

API 資料結構包含以下主要部分：

1. **PM（預防性維護）資料**
   - 工單列表 (list)
   - 工單詳情 (details)
   - 員工列表 (staffList)

2. **CM（故障維修）資料**
   - 工單列表 (list)
   - 工單詳情 (details)
   - 設備選項 (equipmentOptions)
   - 異常類型選項 (abnormalOptions)
   - 維護類型選項 (maintenanceOptions)
   - 員工列表 (staffList)

3. **通用資料**
   - 狀態翻譯 (statusTranslations)

## 使用方法

### 1. 引入 API 服務

```tsx
import api from '@/services/api';
```

### 2. 獲取 PM 工單列表

```tsx
// 在 React 組件中
import { useState, useEffect } from 'react';
import api, { PMWorkOrder } from '@/services/api';

function PMListComponent() {
  const [workOrders, setWorkOrders] = useState<PMWorkOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        setLoading(true);
        const data = await api.pm.getWorkOrders();
        setWorkOrders(data);
      } catch (error) {
        console.error('Error fetching work orders:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkOrders();
  }, []);
  
  if (loading) return <div>載入中...</div>;
  
  return (
    <div>
      {workOrders.map(order => (
        <div key={order.id}>{order.id} - {order.description}</div>
      ))}
    </div>
  );
}
```

### 3. 獲取 PM 工單詳情

```tsx
// 在 React 組件中
import { useState, useEffect } from 'react';
import api, { PMWorkOrderDetail } from '@/services/api';

function PMDetailComponent({ id }: { id: string }) {
  const [workOrder, setWorkOrder] = useState<PMWorkOrderDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchWorkOrderDetail = async () => {
      try {
        setLoading(true);
        const data = await api.pm.getWorkOrderDetail(id);
        setWorkOrder(data);
      } catch (error) {
        console.error('Error fetching work order detail:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkOrderDetail();
  }, [id]);
  
  if (loading) return <div>載入中...</div>;
  if (!workOrder) return <div>找不到工單</div>;
  
  return (
    <div>
      <h2>{workOrder.id}</h2>
      <p>描述: {workOrder.description}</p>
      {/* 其他工單詳情... */}
    </div>
  );
}
```

### 4. 獲取 CM 工單列表

```tsx
// 在 React 組件中
import { useState, useEffect } from 'react';
import api, { CMWorkOrder } from '@/services/api';

function CMListComponent() {
  const [workOrders, setWorkOrders] = useState<CMWorkOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        setLoading(true);
        const data = await api.cm.getWorkOrders();
        setWorkOrders(data);
      } catch (error) {
        console.error('Error fetching work orders:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkOrders();
  }, []);
  
  if (loading) return <div>載入中...</div>;
  
  return (
    <div>
      {workOrders.map(order => (
        <div key={order.id}>{order.id} - {order.description}</div>
      ))}
    </div>
  );
}
```

### 5. 獲取 CM 設備選項

```tsx
// 在 React 組件中
import { useState, useEffect } from 'react';
import api, { EquipmentOption } from '@/services/api';

function EquipmentSelector() {
  const [equipment, setEquipment] = useState<EquipmentOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setLoading(true);
        const data = await api.cm.getEquipmentOptions();
        setEquipment(data);
      } catch (error) {
        console.error('Error fetching equipment options:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEquipment();
  }, []);
  
  if (loading) return <div>載入中...</div>;
  
  return (
    <select>
      <option value="">請選擇設備</option>
      {equipment.map(eq => (
        <option key={eq.id} value={eq.id}>
          {eq.name} ({eq.location})
        </option>
      ))}
    </select>
  );
}
```

### 6. 建立新的 CM 工單

```tsx
// 在 React 組件中
import { useState } from 'react';
import api, { CMWorkOrder } from '@/services/api';

function CreateCMWorkOrder() {
  const [formData, setFormData] = useState({
    equipmentId: '',
    equipmentName: '',
    location: '',
    description: '',
    abnormalType: '',
    maintenanceType: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const result = await api.cm.createWorkOrder(formData);
      alert(`工單已建立: ${result.id}`);
      // 重置表單或導航到新工單
    } catch (error) {
      console.error('Error creating work order:', error);
      alert('建立工單失敗');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* 表單欄位... */}
      <button type="submit" disabled={loading}>
        {loading ? '提交中...' : '建立工單'}
      </button>
    </form>
  );
}
```

### 7. 更新 PM 或 CM 工單

```tsx
// 在 React 組件中
import { useState } from 'react';
import api, { PMWorkOrderDetail } from '@/services/api';

function UpdatePMWorkOrder({ workOrder }: { workOrder: PMWorkOrderDetail }) {
  const [formData, setFormData] = useState({
    description: workOrder.description,
    // 其他要更新的欄位...
  });
  const [loading, setLoading] = useState<boolean>(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const result = await api.pm.updateWorkOrder(workOrder.id, formData);
      alert('工單已更新');
    } catch (error) {
      console.error('Error updating work order:', error);
      alert('更新工單失敗');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
      />
      {/* 其他欄位... */}
      <button type="submit" disabled={loading}>
        {loading ? '保存中...' : '保存'}
      </button>
    </form>
  );
}
```

### 8. 使用 Hook 一次獲取所有 API 資料

對於需要一次性獲取多種資料的場景，可以使用 `useApiData` Hook：

```tsx
// 在 React 組件中
import api from '@/services/api';

function Dashboard() {
  const { data, loading, error } = api.useApiData();
  
  if (loading) return <div>載入中...</div>;
  if (error) return <div>載入失敗: {error.message}</div>;
  if (!data) return <div>無資料</div>;
  
  return (
    <div>
      <h2>PM 工單: {data.pm.list.length}</h2>
      <h2>CM 工單: {data.cm.list.length}</h2>
      {/* 更多顯示內容... */}
    </div>
  );
}
```

## API 端點

當後端 API 實現完成時，我們應該將以下假 URL 替換為真實的 API 端點：

### PM API 端點

1. 獲取工單列表: `GET /api/pm/workorders`
2. 獲取工單詳情: `GET /api/pm/workorders/{id}`
3. 獲取員工列表: `GET /api/pm/staff`
4. 更新工單: `PUT /api/pm/workorders/{id}`

### CM API 端點

1. 獲取工單列表: `GET /api/cm/workorders`
2. 獲取工單詳情: `GET /api/cm/workorders/{id}`
3. 獲取設備選項: `GET /api/cm/equipment`
4. 獲取異常類型: `GET /api/cm/abnormal-types`
5. 獲取維護類型: `GET /api/cm/maintenance-types`
6. 獲取員工列表: `GET /api/cm/staff`
7. 更新工單: `PUT /api/cm/workorders/{id}`
8. 創建工單: `POST /api/cm/workorders`

### 通用 API 端點

1. 獲取狀態翻譯: `GET /api/common/status-translations`

## 從模擬 API 切換到真實 API

當後端 API 實現完成時，只需要修改 `src/services/api.ts` 文件中的實現，將 fetch JSON 文件的代碼替換為真實的 API 請求。因為接口已經定義好，所以不需要修改使用 API 的組件代碼。 