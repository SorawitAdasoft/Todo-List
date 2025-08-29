import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  name?: string;
  id?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    options, 
    value, 
    defaultValue, 
    placeholder, 
    onChange, 
    disabled, 
    className, 
    name,
    id,
    ...props 
  }, ref) => {
    return (
      <div className=\"relative\">
        <select
          ref={ref}
          value={value}
          defaultValue={defaultValue}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          name={name}
          id={id}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value=\"\" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className=\"absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50 pointer-events-none\" />
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };"