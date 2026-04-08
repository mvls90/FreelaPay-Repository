// src/components/common/EmptyState.js
import React from 'react';

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
      {Icon && <Icon size={40} className="text-gray-300 mx-auto mb-3" />}
      <p className="font-medium text-gray-500">{title}</p>
      {description && <p className="text-sm text-gray-400 mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
