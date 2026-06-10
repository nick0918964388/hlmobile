'use client';

interface StaffCardProps {
  selectedStaff: {
    owner: string;
    lead: string;
    supervisor: string;
  };
  setSelectedStaff: (staff: { owner: string; lead: string; supervisor: string }) => void;
  setIsDirty: (dirty: boolean) => void;
  managerList: any[];
  isEditable: boolean;
  t: (key: any) => string;
}

export default function StaffCard({
  selectedStaff,
  setSelectedStaff,
  setIsDirty,
  managerList,
  isEditable,
  t,
}: StaffCardProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              {t('owner')}
              {!selectedStaff.owner && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
            <select
              className={`w-full border rounded px-3 py-3 text-base focus:ring-1 ${
                selectedStaff.owner
                  ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
              value={selectedStaff.owner}
              onChange={(e) => {
                setSelectedStaff({...selectedStaff, owner: e.target.value});
                setIsDirty(true);
              }}
              disabled={!isEditable}
            >
              <option value="">{t('pleaseSelect')}</option>
              {managerList.map((manager: any) => (
                <option key={manager.id} value={manager.id}>
                  {manager.name}
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
              className={`w-full border rounded px-3 py-3 text-base focus:ring-1 ${
                selectedStaff.lead
                  ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
              value={selectedStaff.lead}
              onChange={(e) => {
                setSelectedStaff({...selectedStaff, lead: e.target.value});
                setIsDirty(true);
              }}
              disabled={!isEditable}
            >
              <option value="">{t('pleaseSelect')}</option>
              {managerList.map((manager: any) => (
                <option key={manager.id} value={manager.id}>
                  {manager.name}
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
              className={`w-full border rounded px-3 py-3 text-base focus:ring-1 ${
                selectedStaff.supervisor
                  ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
              value={selectedStaff.supervisor}
              onChange={(e) => {
                setSelectedStaff({...selectedStaff, supervisor: e.target.value});
                setIsDirty(true);
              }}
              disabled={!isEditable}
            >
              <option value="">{t('pleaseSelect')}</option>
              {managerList.map((manager: any) => (
                <option key={manager.id} value={manager.id}>
                  {manager.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
