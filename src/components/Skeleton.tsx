import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'rectangular' | 'circular' | 'text';
  animation?: 'pulse' | 'wave';
  count?: number;
}

interface SkeletonCardProps {
  lines?: number;
  hasImage?: boolean;
  imageSize?: string;
  className?: string;
}

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}

interface SkeletonFormProps {
  fields?: number;
  className?: string;
}

// 基本骨架元素
export function Skeleton({
  className = '',
  width = '100%',
  height = '1rem',
  variant = 'rectangular',
  animation = 'pulse',
  count = 1
}: SkeletonProps) {
  const baseClasses = [
    variant === 'circular' ? 'rounded-full' : 'rounded',
    animation === 'pulse' ? 'animate-pulse' : 'animate-skeleton-wave',
    'bg-gray-200 dark:bg-gray-700'
  ];
  
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height
  };
  
  const elements = Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className={`${baseClasses.join(' ')} ${className}`}
      style={style}
    />
  ));
  
  return <>{elements}</>;
}

// 卡片骨架
export function SkeletonCard({
  lines = 3,
  hasImage = true,
  imageSize = '100px',
  className = ''
}: SkeletonCardProps) {
  return (
    <div className={`p-4 border rounded-md shadow-sm ${className}`}>
      {hasImage && (
        <div className="mb-4">
          <Skeleton 
            variant="rectangular" 
            height={imageSize} 
            className="rounded-md"
          />
        </div>
      )}
      <Skeleton variant="text" height="1.5rem" className="mb-2" />
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton 
          key={index}
          variant="text" 
          width={`${Math.floor(Math.random() * 40) + 60}%`}
          className="mb-1" 
        />
      ))}
    </div>
  );
}

// 表格骨架
export function SkeletonTable({
  rows = 5,
  columns = 4,
  showHeader = true,
  className = ''
}: SkeletonTableProps) {
  return (
    <div className={`w-full rounded-md overflow-hidden ${className}`}>
      {showHeader && (
        <div className="flex bg-gray-100 dark:bg-gray-800 p-3">
          {Array.from({ length: columns }, (_, index) => (
            <div key={index} className="flex-1 px-2">
              <Skeleton height="1.25rem" />
            </div>
          ))}
        </div>
      )}
      <div className="bg-white dark:bg-gray-900">
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div 
            key={rowIndex} 
            className="flex p-3 border-b border-gray-100 dark:border-gray-800"
          >
            {Array.from({ length: columns }, (_, colIndex) => (
              <div key={colIndex} className="flex-1 px-2">
                <Skeleton height="1rem" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// 表單骨架
export function SkeletonForm({
  fields = 4,
  className = ''
}: SkeletonFormProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: fields }, (_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton width="30%" height="1rem" className="mb-1" />
          <Skeleton height="2.5rem" />
        </div>
      ))}
      
      <div className="pt-2">
        <Skeleton width="120px" height="2.5rem" className="mt-2" />
      </div>
    </div>
  );
}

// 詳細頁面骨架
export function SkeletonDetail() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton width="40%" height="2rem" />
        <Skeleton width="120px" height="2.5rem" />
      </div>
      
      <div className="flex space-x-4">
        <div className="w-1/3">
          <SkeletonCard lines={4} hasImage={false} />
        </div>
        <div className="w-2/3">
          <SkeletonTable rows={3} columns={3} />
        </div>
      </div>
      
      <div>
        <Skeleton width="20%" height="1.5rem" className="mb-3" />
        <SkeletonForm fields={3} />
      </div>
    </div>
  );
}

// 列表骨架
export function SkeletonList({
  count = 5,
  className = ''
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex items-center p-3 border rounded-md">
          <div className="flex-shrink-0 mr-3">
            <Skeleton variant="circular" width="40px" height="40px" />
          </div>
          <div className="flex-grow">
            <Skeleton variant="text" width="60%" className="mb-1" />
            <Skeleton variant="text" width="40%" height="0.75rem" />
          </div>
          <div className="flex-shrink-0 ml-2">
            <Skeleton width="60px" height="30px" />
          </div>
        </div>
      ))}
    </div>
  );
}

// 页面加载骨架屏
export function SkeletonPage() {
  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <Skeleton width="30%" height="2rem" />
        <div className="flex space-x-2">
          <Skeleton width="100px" height="2.5rem" />
          <Skeleton width="100px" height="2.5rem" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="p-4 border rounded-lg">
            <Skeleton width="40%" height="1.25rem" className="mb-3" />
            <Skeleton width="70%" height="1rem" className="mb-2" />
            <Skeleton width="50%" height="2rem" className="mt-4" />
          </div>
        ))}
      </div>
      
      <SkeletonTable rows={5} columns={4} className="mb-6" />
      
      <div className="flex justify-end">
        <Skeleton width="100px" height="2.5rem" />
      </div>
    </div>
  );
}

// 导出默认的组件
export default Skeleton; 