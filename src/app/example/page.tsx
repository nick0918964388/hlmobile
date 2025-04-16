'use client';

import { useState, useEffect } from 'react';
import api, { PMWorkOrder, CMWorkOrder } from '@/services/api';
import { SkeletonList, SkeletonTable } from '@/components/Skeleton';
import { useApiData } from '@/hooks/useApiData';

export default function ExamplePage() {
  // 使用 Hook 加載所有數據
  const { data, loading: allDataLoading, error: allDataError } = useApiData();
  
  // PM 工單列表
  const [pmWorkOrders, setPmWorkOrders] = useState<PMWorkOrder[]>([]);
  const [loadingPm, setLoadingPm] = useState<boolean>(true);
  const [errorPm, setErrorPm] = useState<Error | null>(null);
  
  // CM 工單列表
  const [cmWorkOrders, setCmWorkOrders] = useState<CMWorkOrder[]>([]);
  const [loadingCm, setLoadingCm] = useState<boolean>(true);
  const [errorCm, setErrorCm] = useState<Error | null>(null);
  
  // 狀態翻譯
  const [statusTranslations, setStatusTranslations] = useState<any>({});
  const [loadingStatus, setLoadingStatus] = useState<boolean>(true);
  
  // 當前語言
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');
  
  // 加載 PM 工單列表
  useEffect(() => {
    const fetchPmWorkOrders = async () => {
      try {
        setLoadingPm(true);
        const result = await api.pm.getWorkOrders();
        setPmWorkOrders(result);
      } catch (error) {
        console.error('Error fetching PM work orders:', error);
        setErrorPm(error instanceof Error ? error : new Error('Unknown error'));
      } finally {
        setLoadingPm(false);
      }
    };
    
    fetchPmWorkOrders();
  }, []);
  
  // 加載 CM 工單列表
  useEffect(() => {
    const fetchCmWorkOrders = async () => {
      try {
        setLoadingCm(true);
        const result = await api.cm.getWorkOrders();
        setCmWorkOrders(result);
      } catch (error) {
        console.error('Error fetching CM work orders:', error);
        setErrorCm(error instanceof Error ? error : new Error('Unknown error'));
      } finally {
        setLoadingCm(false);
      }
    };
    
    fetchCmWorkOrders();
  }, []);
  
  // 加載狀態翻譯
  useEffect(() => {
    const fetchStatusTranslations = async () => {
      try {
        setLoadingStatus(true);
        const result = await api.common.getStatusTranslations();
        setStatusTranslations(result);
      } catch (error) {
        console.error('Error fetching status translations:', error);
      } finally {
        setLoadingStatus(false);
      }
    };
    
    fetchStatusTranslations();
  }, []);
  
  // 切換語言
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'zh' ? 'en' : 'zh');
  };
  
  // 狀態翻譯函數
  const translateStatus = (status: string): string => {
    if (!statusTranslations) return status;
    const key = status === 'waiting_approval' ? 'WAPPR' : 'APPR';
    return statusTranslations[key] ? statusTranslations[key][language] : status;
  };
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">API 調用示例</h1>
      
      <button 
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={toggleLanguage}
      >
        {language === 'zh' ? '切換到英文' : '切換到中文'}
      </button>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">PM 和 CM 工單列表</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">PM 工單列表</h3>
            {loadingPm ? (
              <SkeletonList count={3} />
            ) : errorPm ? (
              <p className="text-red-500">載入失敗: {errorPm.message}</p>
            ) : (
              <ul className="list-disc pl-5">
                {pmWorkOrders.map(order => (
                  <li key={order.id} className="mb-2">
                    <span className="font-medium">{order.id}</span> - 
                    {order.description}
                    <span className="ml-2 text-sm text-gray-500">
                      ({translateStatus(order.status)})
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">CM 工單列表</h3>
            {loadingCm ? (
              <SkeletonList count={3} />
            ) : errorCm ? (
              <p className="text-red-500">載入失敗: {errorCm.message}</p>
            ) : (
              <ul className="list-disc pl-5">
                {cmWorkOrders.map(order => (
                  <li key={order.id} className="mb-2">
                    <span className="font-medium">{order.id}</span> - 
                    {order.description}
                    <span className="ml-2 text-sm text-gray-500">
                      ({translateStatus(order.status)})
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        <div className="border p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">通過 useApiData Hook 獲取的數據</h2>
          
          {allDataLoading ? (
            <SkeletonTable rows={4} columns={3} />
          ) : allDataError ? (
            <p className="text-red-500">載入失敗: {allDataError.message}</p>
          ) : !data ? (
            <p>無數據</p>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">PM 工單列表</h3>
                <ul className="list-disc pl-5">
                  {data.pm.list.map((order: PMWorkOrder) => (
                    <li key={order.id} className="mb-2">
                      <span className="font-medium">{order.id}</span> - 
                      {order.description}
                      <span className="ml-2 text-sm text-gray-500">
                        ({data.statusTranslations[order.status === 'waiting_approval' ? 'WAPPR' : 'APPR'][language]})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">CM 工單列表</h3>
                <ul className="list-disc pl-5">
                  {data.cm.list.map((order: CMWorkOrder) => (
                    <li key={order.id} className="mb-2">
                      <span className="font-medium">{order.id}</span> - 
                      {order.description}
                      <span className="ml-2 text-sm text-gray-500">
                        ({data.statusTranslations[order.status === 'waiting_approval' ? 'WAPPR' : 'APPR'][language]})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">CM 設備選項</h3>
                <ul className="list-disc pl-5">
                  {data.cm.equipmentOptions.map((option: { id: string; name: string; location: string }) => (
                    <li key={option.id}>
                      {option.name} ({option.location})
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 