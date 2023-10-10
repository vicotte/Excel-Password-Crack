import React, { ReactNode } from 'react';
import { useState } from 'react';

interface CheckboxWicProps {
  name: string;
  handleChange: (payload: { isChecked: boolean; name: string }) => void;
  children: ReactNode;
}
///
const CheckboxWic: React.FC<CheckboxWicProps> = ({
  name,
  handleChange,
  children,
}) => {
  const [checkboxValue, setCheckboxValue] = useState(false);

  const changeCheckBoxValue = () => {
    const newCheckboxValue = !checkboxValue;
    setCheckboxValue(newCheckboxValue);
    handleChange({ isChecked: newCheckboxValue, name: name });
    console.log(newCheckboxValue);
  };

  return (
    <div className='flex items-center mb-4'>
      <input
        type='checkbox'
        checked={checkboxValue}
        onChange={changeCheckBoxValue}
        className='w-4 h-4 text-gray-800 border border-gray-800 rounded focus:ring-0 bg-gray-800'
      />
      <label className='ml-2 text-sm font-medium text-gray-100'>
        {children}
      </label>
    </div>
  );
};

export { CheckboxWic };
