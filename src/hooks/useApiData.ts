'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import type { 
  PMWorkOrder, 
  PMWorkOrderDetail, 
  CMWorkOrder, 
  CMWorkOrderDetail, 
  Staff,
  EquipmentOption,
  StatusTranslation,
  User
} from '@/services/api';

// 定義API返回的完整資料介面
interface ApiData {
  pm: {
    list: PMWorkOrder[];
    details: { [id: string]: PMWorkOrderDetail };
    staffList: Staff[];
  };
  cm: {
    list: CMWorkOrder[];
    details: { [id: string]: CMWorkOrderDetail };
    equipmentOptions: EquipmentOption[];
    abnormalOptions: string[];
    maintenanceOptions: string[];
    staffList: Staff[];
  };
  statusTranslations: { [status: string]: StatusTranslation };
  users: {
    current: User;
    list: User[];
  };
}

// 模擬API延遲 - 增加最小延遲時間確保loading顯示效果
const simulateApiDelay = () => {
  const minDelayTime = 1000; // 最小延遲1秒，確保loading狀態能夠被看到
  return new Promise(resolve => setTimeout(resolve, minDelayTime));
};

// 獲取API資料的自訂 hook
export function useApiData() {
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 設置一個最小載入時間
        const loadingStartTime = Date.now();
        
        try {
          // 從JSON文件讀取資料
          const response = await fetch('/api/data.json');
          
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          const result = await response.json();
          
          // 確保最小的loading時間，以便skeleton效果能夠被看到
          const loadingTime = Date.now() - loadingStartTime;
          if (loadingTime < 1000) {
            await new Promise(resolve => setTimeout(resolve, 1000 - loadingTime));
          }
          
          setData(result);
        } catch (fetchError) {
          throw fetchError;
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        console.error('Error fetching API data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
} 