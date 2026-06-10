'use client';

import { PMWorkOrderDetail } from '@/services/api';

interface PMTabBarProps {
  workOrder: PMWorkOrderDetail;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMaintenanceInfoComplete: () => boolean | string;
  actualCheckComplete: boolean;
  resourceComplete: boolean;
  resourceLabel: string;
}

export default function PMTabBar({
  workOrder,
  activeTab,
  setActiveTab,
  isMaintenanceInfoComplete,
  actualCheckComplete,
  resourceComplete,
  resourceLabel,
}: PMTabBarProps) {
  return (
    <div className="flex-none bg-blue-600 text-white fixed bottom-0 left-0 right-0">
      <div className="grid grid-cols-3 divide-x divide-white/30">
        <button
          className={`py-4 text-center hover:bg-blue-700 ${activeTab === 'info' ? 'bg-blue-800' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          <div className="flex flex-col items-center space-y-1 relative">
            <div className="relative">
              <svg
                className={`w-6 h-6 ${isMaintenanceInfoComplete() ? 'text-green-400' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {isMaintenanceInfoComplete() && (
                <div className="absolute -top-1 -right-1 bg-green-500 rounded-full w-3 h-3 flex items-center justify-center">
                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <span>Info</span>
          </div>
        </button>

        <button
          className={`py-4 text-center ${
            activeTab === 'actual'
              ? 'bg-blue-800'
              : 'hover:bg-blue-700'
          } ${
            (!workOrder.checkItems || workOrder.checkItems.length === 0)
              ? 'opacity-70 cursor-not-allowed'
              : ''
          }`}
          onClick={() => {
            if (workOrder.checkItems && workOrder.checkItems.length > 0) {
              setActiveTab('actual');
            }
          }}
          disabled={!workOrder.checkItems || workOrder.checkItems.length === 0}
        >
          <div className="flex flex-col items-center space-y-1 relative">
            <div className="relative">
              <svg
                className={`w-6 h-6 ${
                  actualCheckComplete
                    ? 'text-green-400'
                    : (!workOrder.checkItems || workOrder.checkItems.length === 0)
                      ? 'text-white/70'
                      : 'text-white'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              {actualCheckComplete && (
                <div className="absolute -top-1 -right-1 bg-green-500 rounded-full w-3 h-3 flex items-center justify-center">
                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <span>Actual</span>
            {(!workOrder.checkItems || workOrder.checkItems.length === 0) && (
              <span className="text-xs text-white/70">No check items</span>
            )}
          </div>
        </button>

        <button
          className={`py-4 text-center hover:bg-blue-700 ${activeTab === 'report' ? 'bg-blue-800' : ''}`}
          onClick={() => setActiveTab('report')}
        >
          <div className="flex flex-col items-center space-y-1 relative">
            <div className="relative">
              <svg
                className={`w-6 h-6 ${resourceComplete ? 'text-green-400' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {resourceComplete && (
                <div className="absolute -top-1 -right-1 bg-green-500 rounded-full w-3 h-3 flex items-center justify-center">
                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <span>{resourceLabel}</span>
          </div>
        </button>
      </div>
    </div>
  );
}
