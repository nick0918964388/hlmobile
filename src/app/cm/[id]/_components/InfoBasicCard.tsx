'use client';

interface InfoBasicCardProps {
  workOrder: any;
  editableFields: {
    description: string;
    assets: string;
    abnormalType: string;
  };
  setEditableFields: (fields: { description: string; assets: string; abnormalType: string }) => void;
  editing: {
    description: boolean;
    assets: boolean;
    abnormalType: boolean;
  };
  isEditable: boolean;
  startEditing: (field: 'description' | 'assets' | 'abnormalType') => void;
  saveField: (field: 'description' | 'assets' | 'abnormalType') => void;
  cancelEditing: (field: 'description' | 'assets' | 'abnormalType') => void;
  t: (key: any) => string;
}

export default function InfoBasicCard({
  workOrder,
  editableFields,
  setEditableFields,
  editing,
  isEditable,
  startEditing,
  saveField,
  cancelEditing,
  t,
}: InfoBasicCardProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="divide-y">
        {/* 工單號碼 */}
        <div className="flex px-4 py-3">
          <div className="w-28 text-gray-600">{t('workOrderId')}</div>
          <div className="flex-1">{workOrder.id}</div>
        </div>

        {/* 故障設備 - 可編輯 */}
        <div className="flex px-4 py-3">
          <div className="w-28 text-gray-600">{t('assets')}</div>
          <div className="flex-1">
            {editing.assets ? (
              <div className="flex flex-col">
                <textarea
                  className="w-full border rounded px-3 py-2 mb-2"
                  value={editableFields.assets}
                  onChange={(e) => setEditableFields({...editableFields, assets: e.target.value})}
                  rows={3}
                  disabled={!isEditable}
                ></textarea>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => cancelEditing('assets')}
                    className="border px-3 py-1 rounded hover:bg-gray-50"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={() => saveField('assets')}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    {t('save')}
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="py-1 px-2 -mx-2 rounded hover:bg-blue-50 cursor-pointer flex"
                onClick={() => isEditable && startEditing('assets')}
              >
                <div className="flex-1">
                  {editableFields.assets}
                </div>
                {isEditable && (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 移除工單描述部分 */}

        <div className="flex px-4 py-3">
          <div className="w-28 text-gray-600">{t('location')}</div>
          <div className="flex-1">{workOrder.location}</div>
        </div>

        <div className="flex px-4 py-3">
          <div className="w-28 text-gray-600">{t('equipmentType')}</div>
          <div className="flex-1">{workOrder.equipmentType}</div>
        </div>

        {/* 添加指定人員欄位 */}
        <div className="flex px-4 py-3">
          <div className="w-28 text-gray-600">{t('systemEngineer')}</div>
          <div className="flex-1">{workOrder.systemEngineer || '-'}</div>
        </div>

        {/* 可編輯的異常類型欄位 */}
        <div className="flex px-4 py-3">
          <div className="w-28 text-gray-600">{t('abnormalType')}</div>
          <div className="flex-1">
            {editing.abnormalType ? (
              <div className="flex flex-col">
                <select
                  className="w-full border rounded px-3 py-2 mb-2"
                  value={editableFields.abnormalType}
                  onChange={(e) => setEditableFields({...editableFields, abnormalType: e.target.value})}
                  disabled={!isEditable}
                >
                  <option value="">{t('pleaseSelect')}</option>
                  <option value="機械">{t('mechanical')}</option>
                  <option value="電氣">{t('electrical')}</option>
                  <option value="液壓">{t('hydraulic')}</option>
                  <option value="氣動">{t('pneumatic')}</option>
                  <option value="其他">{t('other')}</option>
                </select>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => cancelEditing('abnormalType')}
                    className="border px-3 py-1 rounded hover:bg-gray-50"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={() => saveField('abnormalType')}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    {t('save')}
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="py-1 px-2 -mx-2 rounded hover:bg-blue-50 cursor-pointer flex"
                onClick={() => isEditable && startEditing('abnormalType')}
              >
                <div className="flex-1">
                  {editableFields.abnormalType || t('pleaseSelect')}
                </div>
                {isEditable && (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
