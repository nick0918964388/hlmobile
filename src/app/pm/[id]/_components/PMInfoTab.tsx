'use client';

import { PMWorkOrderDetail, Manager } from '@/services/api';

type InfoTranslationKey =
  | 'openTime'
  | 'factoryCategory'
  | 'description'
  | 'asset'
  | 'location'
  | 'route'
  | 'equipmentType'
  | 'reportTime'
  | 'reportPerson'
  | 'owner'
  | 'lead'
  | 'supervisor'
  | 'selectOwner'
  | 'selectLead'
  | 'selectSupervisor';

interface MaintenanceTime {
  startDate: string;
  endDate: string;
}

interface SelectedStaff {
  owner: string;
  lead: string;
  supervisor: string;
}

interface PMInfoTabProps {
  workOrder: PMWorkOrderDetail;
  managerList: Manager[];
  maintenanceTime: MaintenanceTime;
  selectedStaff: SelectedStaff;
  setMaintenanceTime: React.Dispatch<React.SetStateAction<MaintenanceTime>>;
  setSelectedStaff: React.Dispatch<React.SetStateAction<SelectedStaff>>;
  t: (key: InfoTranslationKey) => string;
}

export default function PMInfoTab({
  workOrder,
  managerList,
  maintenanceTime,
  selectedStaff,
  setMaintenanceTime,
  setSelectedStaff,
  t,
}: PMInfoTabProps) {
  return (
    <div className="bg-white">
      <div className="divide-y">
        <div className="flex px-4 py-3">
          <div className="w-28 text-gray-600">{t('openTime')}</div>
          <div className="flex-1">{workOrder.openTime}</div>
          <div className="text-red-500 font-medium">{workOrder.creator}</div>
        </div>

        <div className="flex px-4 py-3">
          <div className="w-28 text-gray-600">{t('factoryCategory')}</div>
          <div className="flex-1">{workOrder.systemCode} {workOrder.equipmentCode}</div>
        </div>

        <div className="flex px-4 py-3">
          <div className="w-28 text-gray-600">{t('description')}</div>
          <div className="flex-1">{workOrder.description}</div>
        </div>

        <div className="flex px-4 py-3">
          <div className="w-28 text-gray-600">{t('asset')}</div>
          <div className="flex-1">{workOrder.assets}</div>
        </div>

        <div className="flex px-4 py-3">
          <div className="w-28 text-gray-600">{t('location')}</div>
          <div className="flex-1">{workOrder.location}</div>
        </div>

        <div className="flex px-4 py-3">
          <div className="w-28 text-gray-600">{t('route')}</div>
          <div className="flex-1">{workOrder.route}</div>
        </div>

        <div className="flex px-4 py-3">
          <div className="w-28 text-gray-600">{t('equipmentType')}</div>
          <div className="flex-1">{workOrder.equipmentType}</div>
        </div>

        <div className="flex px-4 py-3">
          <div className="w-28 text-gray-600">{t('reportTime')}</div>
          <div className="flex-1">{workOrder.reportTime}</div>
        </div>

        <div className="flex px-4 py-3">
          <div className="w-28 text-gray-600">{t('reportPerson')}</div>
          <div className="flex-1 text-red-500 font-medium">{workOrder.reportPerson}</div>
        </div>
      </div>

      {/* 維修時間和負責人員 */}
      <div className="p-4 space-y-4 border-t">
        {/* 時間快速設置按鈕 */}
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-600 font-medium">Quick Time Set:</div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => {
                // 創建一個新的日期對象
                const now = new Date();
                // 調整為UTC+8時區，加上8小時
                const utc8Now = new Date(now.getTime() + 8 * 60 * 60 * 1000);
                const startDateTime = utc8Now.toISOString().slice(0, 16);
                // 加1小時
                const endDateTime = new Date(utc8Now.getTime() + 1 * 60 * 60 * 1000).toISOString().slice(0, 16);

                setMaintenanceTime({
                  startDate: startDateTime,
                  endDate: endDateTime
                });
              }}
              className="flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full w-8 h-8"
              title="Set current time + 1 hour (UTC+8)"
            >
              <span className="text-xs font-semibold">+1h</span>
            </button>
            <button
              type="button"
              onClick={() => {
                // 創建一個新的日期對象
                const now = new Date();
                // 調整為UTC+8時區，加上8小時
                const utc8Now = new Date(now.getTime() + 8 * 60 * 60 * 1000);
                const startDateTime = utc8Now.toISOString().slice(0, 16);
                // 加2小時
                const endDateTime = new Date(utc8Now.getTime() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16);

                setMaintenanceTime({
                  startDate: startDateTime,
                  endDate: endDateTime
                });
              }}
              className="flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full w-8 h-8"
              title="Set current time + 2 hours (UTC+8)"
            >
              <span className="text-xs font-semibold">+2h</span>
            </button>
            <button
              type="button"
              onClick={() => {
                // 創建一個新的日期對象
                const now = new Date();
                // 調整為UTC+8時區，加上8小時
                const utc8Now = new Date(now.getTime() + 8 * 60 * 60 * 1000);
                const startDateTime = utc8Now.toISOString().slice(0, 16);
                // 加4小時
                const endDateTime = new Date(utc8Now.getTime() + 4 * 60 * 60 * 1000).toISOString().slice(0, 16);

                setMaintenanceTime({
                  startDate: startDateTime,
                  endDate: endDateTime
                });
              }}
              className="flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full w-8 h-8"
              title="Set current time + 4 hours (UTC+8)"
            >
              <span className="text-xs font-semibold">+4h</span>
            </button>
            <button
              type="button"
              onClick={() => {
                // 創建一個新的日期對象
                const now = new Date();
                // 調整為UTC+8時區，加上8小時
                const utc8Now = new Date(now.getTime() + 8 * 60 * 60 * 1000);
                const startDateTime = utc8Now.toISOString().slice(0, 16);
                // 加8小時
                const endDateTime = new Date(utc8Now.getTime() + 8 * 60 * 60 * 1000).toISOString().slice(0, 16);

                setMaintenanceTime({
                  startDate: startDateTime,
                  endDate: endDateTime
                });
              }}
              className="flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full w-8 h-8"
              title="Set current time + 8 hours (UTC+8)"
            >
              <span className="text-xs font-semibold">+8h</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Start Time
              {!maintenanceTime.startDate && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
            <input
              type="datetime-local"
              className={`w-full border rounded px-3 py-3 text-base focus:ring-1 ${
                maintenanceTime.startDate
                  ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
              value={maintenanceTime.startDate}
              onChange={(e) => setMaintenanceTime(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              End Time
              {!maintenanceTime.endDate && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
            <input
              type="datetime-local"
              className={`w-full border rounded px-3 py-3 text-base focus:ring-1 ${
                maintenanceTime.endDate
                  ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
              value={maintenanceTime.endDate}
              onChange={(e) => setMaintenanceTime(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            {t('owner')}
            {!selectedStaff.owner && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
          <select
            className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 ${
              selectedStaff.owner
                ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
            value={selectedStaff.owner}
            onChange={(e) => setSelectedStaff(prev => ({ ...prev, owner: e.target.value }))}
          >
            <option value="">{t('selectOwner')}</option>
            {managerList.map(staff => (
              <option key={staff.id} value={staff.id}>
                {staff.id} - {staff.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            {t('lead')}
            {!selectedStaff.lead && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
          <select
            className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 ${
              selectedStaff.lead
                ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
            value={selectedStaff.lead}
            onChange={(e) => setSelectedStaff(prev => ({ ...prev, lead: e.target.value }))}
          >
            <option value="">{t('selectLead')}</option>
            {managerList.map(staff => (
              <option key={staff.id} value={staff.id}>
                {staff.id} - {staff.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            {t('supervisor')}
            {!selectedStaff.supervisor && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
          <select
            className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 ${
              selectedStaff.supervisor
                ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
            value={selectedStaff.supervisor}
            onChange={(e) => setSelectedStaff(prev => ({ ...prev, supervisor: e.target.value }))}
          >
            <option value="">{t('selectSupervisor')}</option>
            {managerList.map(staff => (
              <option key={staff.id} value={staff.id}>
                {staff.id} - {staff.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
