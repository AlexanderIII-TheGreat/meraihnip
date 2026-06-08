import { IconLoader2 } from '@tabler/icons-react';
import { MouseEventHandler, FormEventHandler, ReactNode } from 'react';

type ButtonProps = {
  children: ReactNode;
  onSubmit?: FormEventHandler;
  onClick?: MouseEventHandler;
  customSpacing?: string;
  isLoading?: boolean;
  type?: 'button' | 'submit' | 'reset' | undefined;
  isNotRounded?: boolean;
  disabled?: boolean;
  className?: string;
};

export default function Button({
  children,
  onSubmit,
  onClick,
  customSpacing,
  isLoading,
  type,
  isNotRounded,
  className = '',
  disabled,
}: ButtonProps) {
  return (
    <div
      className={`${
        isLoading && 'flex items-center justfy-center text-center'
      }`}
    >
      <button
        onClick={onClick}
        onSubmit={onSubmit}
        disabled={isLoading || disabled}
        type={type}
        className={`${customSpacing ? customSpacing : 'py-2.5'} ${
          isLoading ? 'opacity-50' : ''
        }
				${
          disabled
            ? 'cursor-not-allowed bg-white border text-[#000] border-[#DDDDDD]'
            : 'cursor-pointer '
        }
        ${className}
        ${isNotRounded ? 'rounded-[5px]' : 'rounded-custom'}
          flex justify-center gap-1.5 min-w-20  text-center w-full shadow-lg bg-primary rounded-md text-white`}
      >
        {isLoading && <IconLoader2 className="animate-spin" />}
        {children}
      </button>
    </div>
  );
}
