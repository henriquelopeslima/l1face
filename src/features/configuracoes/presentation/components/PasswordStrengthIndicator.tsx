import React from 'react';
import type { PasswordValidationError } from '../../domain/entities';

interface PasswordStrengthIndicatorProps {
  password: string;
  validationErrors?: PasswordValidationError[];
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  validationErrors = []
}) => {
  if (!password) {
    return null;
  }

  const requirements = [
    { id: 'MIN_LENGTH', label: 'Mínimo 8 caracteres',  met: !validationErrors.includes('MIN_LENGTH') },
    { id: 'MAX_LENGTH', label: 'Máximo 20 caracteres', met: !validationErrors.includes('MAX_LENGTH') },
    { id: 'NO_LETTERS', label: 'Contém letras',        met: !validationErrors.includes('NO_LETTERS') },
    { id: 'NO_NUMBERS', label: 'Contém números',       met: !validationErrors.includes('NO_NUMBERS') },
  ];

  const metCount = requirements.filter(req => req.met).length;
  const strengthPercent = (metCount / requirements.length) * 100;

  const getStrengthColor = () => {
    if (strengthPercent === 100) return 'bg-green-500';
    if (strengthPercent >= 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-3">
      {/* Strength Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${getStrengthColor()}`}
          style={{ width: `${strengthPercent}%` }}
        />
      </div>

      {/* Requirements List */}
      <div className="space-y-2">
        {requirements.map(req => (
          <div key={req.id} className="flex items-center gap-2 text-sm">
            <span className={`w-5 h-5 flex items-center justify-center rounded border ${
              req.met ? 'bg-green-100 border-green-500 text-green-600' : 'bg-red-100 border-red-500 text-red-600'
            }`}>
              {req.met ? '✓' : '✗'}
            </span>
            <span className={req.met ? 'text-green-700' : 'text-red-700'}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
