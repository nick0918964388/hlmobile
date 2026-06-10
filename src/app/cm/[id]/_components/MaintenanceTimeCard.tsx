'use client';

interface MaintenanceTimeCardProps {
  startTime: string;
  endTime: string;
  setStartTime: (value: string) => void;
  setEndTime: (value: string) => void;
  setIsDirty: (dirty: boolean) => void;
  isEditable: boolean;
  language: string;
  t: (key: any) => string;
}

export default function MaintenanceTimeCard({
  startTime,
  endTime,
  setStartTime,
  setEndTime,
  setIsDirty,
  isEditable,
  language,
  t,
}: MaintenanceTimeCardProps) {
  // 依據指定的小時差設置開始/結束時間（UTC+8）
  const setQuickTime = (hours: number) => {
    // 創建一個新的日期對象
    const now = new Date();
    // 調整為UTC+8時區，加上8小時
    const utc8Now = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    const startDateTime = utc8Now.toISOString().slice(0, 16);
    const endDateTime = new Date(utc8Now.getTime() + hours * 60 * 60 * 1000).toISOString().slice(0, 16);

    setStartTime(startDateTime);
    setEndTime(endDateTime);
    setIsDirty(true);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4">
        {/* 添加時間快速設置按鈕 */}
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-600 font-medium">{language === 'zh' ? '快速設置時間:' : 'Quick Time Set:'}</div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setQuickTime(1)}
              className="flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full w-8 h-8"
              title="Set current time + 1 hour (UTC+8)"
              disabled={!isEditable}
            >
              <span className="text-xs font-semibold">+1h</span>
            </button>
            <button
              type="button"
              onClick={() => setQuickTime(2)}
              className="flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full w-8 h-8"
              title="Set current time + 2 hours (UTC+8)"
              disabled={!isEditable}
            >
              <span className="text-xs font-semibold">+2h</span>
            </button>
            <button
              type="button"
              onClick={() => setQuickTime(4)}
              className="flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full w-8 h-8"
              title="Set current time + 4 hours (UTC+8)"
              disabled={!isEditable}
            >
              <span className="text-xs font-semibold">+4h</span>
            </button>
            <button
              type="button"
              onClick={() => setQuickTime(8)}
              className="flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full w-8 h-8"
              title="Set current time + 8 hours (UTC+8)"
              disabled={!isEditable}
            >
              <span className="text-xs font-semibold">+8h</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              {t('startTime')}
              {!startTime && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
            <input
              type="datetime-local"
              className={`w-full border rounded px-3 py-3 text-base focus:ring-1 ${
                startTime
                  ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
              value={startTime}
              onChange={(e) => {
                setStartTime(e.target.value);
                setIsDirty(true);
              }}
              disabled={!isEditable}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              {t('endTime')}
              {!endTime && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
            <input
              type="datetime-local"
              className={`w-full border rounded px-3 py-3 text-base focus:ring-1 ${
                endTime
                  ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
              value={endTime}
              onChange={(e) => {
                setEndTime(e.target.value);
                setIsDirty(true);
              }}
              disabled={!isEditable}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
