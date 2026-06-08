import { formatCurrency } from '@/utils/number-format';
import { useEffect } from 'react';
import Select from 'react-select';
import CKeditor from './ckeditor';
import {
  DatePicker,
  DateRangePicker,
  Rate,
  Select as SelectCreatable,
} from 'tdesign-react';

interface InputProps {
  register?: (name: string, validation?: any) => void;
  name: string;
  validation?: any;
  errors?: any;
  [key: string]: any;
  title?: string;
  className?: string;
  containerClass?: string;
  type?:
    | (
        | 'text'
        | 'password'
        | 'email'
        | 'number'
        | 'file'
        | 'multiple'
        | 'radio'
        | 'tel'
        | 'url'
        | 'select'
        | 'ckeditor'
        | 'rangeDatePicker'
        | 'date'
        | 'rate'
        | 'selectCreatable'
        | 'selectTDesign'
      )
    | undefined;
  multiple?: boolean;
  startAdornment?: string;
  endAdornment?: string;
  onChange?: (e: any) => void;
  isCurrency?: boolean;
  options?: any;
  key?: any;
}

export default function Input({
  register,
  trigger,
  name,
  errors,
  validation,
  title,
  className,
  containerClass,
  getValues,
  setValue,
  type = 'text',
  onChange,
  startAdornment,
  endAdornment,
  isCurrency,
  labelStyle,
  options,
  key,
  ...rest
}: InputProps) {
  const registration = register
    ? validation
      ? register(name, validation)
      : register(name)
    : {};

  useEffect(() => {
    if (name == 'bankSubSoalId') setValue(name, options[0]?.value || '');
  }, [options, key]);

  useEffect(() => {
    const value = getValues?.(name);
    if (value?.length > 0) trigger(name);
  }, [getValues?.(name)]);

  const getInput = () => {
    let inputElement;

    const commonProps = {
      ...registration,
      ...rest,
      id: name,
      name: name,
      onChange: (e: any) => {
        trigger(name);
        if (type !== 'file')
          setValue(
            name,
            isCurrency ? formatCurrency(e.target.value, true) : e.target.value
          );
        if (onChange) onChange(e);
      },
      className: `pl-3 pr-3 block w-full rounded-md py-1.5 text-gray-900 shadow-sm ring-inset border border-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6 ${
        className || ''
      } ${errors && errors[name] ? 'border-red-600' : ''}`,
    };

    if (type === 'multiple') {
      inputElement = <textarea {...commonProps}></textarea>;
    } else if (type === 'ckeditor') {
      inputElement = (
        <CKeditor
          {...commonProps}
          className={`border border-gray-300  rounded-md ${className} ${
            errors && errors[name] ? 'border-red-600' : ''
          }`}
          content={getValues?.(name)}
          onChange={(val: any) => {
            setValue(name, val);
            trigger(name);
            if (onChange) onChange(val);
          }}
        />
      );
    } else if (type === 'rate') {
      inputElement = (
        <Rate
          {...commonProps}
          className={`border border-gray-300  rounded-md ${className} ${
            errors && errors[name] ? 'border-red-600' : ''
          }`}
          onChange={(val: any) => {
            setValue(name, val);
            trigger(name);
            if (onChange) onChange(val);
          }}
        />
      );
    } else if (type === 'rangeDatePicker') {
      inputElement = (
        <DateRangePicker
          className={`border border-gray-300 h-10 w-full rounded-md ${className} ${
            errors && errors[name] ? 'border-red-600' : ''
          }`}
          format="DD/MM/YYYY HH:mm"
          value={getValues?.(name) || []}
          placeholder={['Tanggal Mulai', 'Berakhir']}
          onChange={(val: any) => {
            setValue(name, val);
            trigger(name);
            if (onChange) onChange(val);
          }}
          enableTimePicker
        />
      );
    } else if (type === 'date') {
      inputElement = (
        <DatePicker
          {...rest}
          className={`border border-gray-300 h-10 w-full rounded-md ${className} ${
            errors && errors[name] ? 'border-red-600' : ''
          }`}
          placeholder=""
          format="DD/MM/YYYY HH:mm"
          value={getValues?.(name) || ''}
          onChange={(val: any) => {
            setValue(name, val);
            trigger(name);
            if (onChange) onChange(val);
          }}
        />
      );
    } else if (type === 'selectTDesign') {
      inputElement = (
        <SelectCreatable
          {...rest}
          className={` w-full rounded-md ${className} ${
            errors && errors[name] ? 'border-red-600' : ''
          }`}
          options={options}
          value={getValues?.(name) || (rest.multiple ? [] : '')}
          onChange={(val: any) => {
            setValue(name, val);
            trigger(name);
            if (onChange) onChange(val);
          }}
          filterable
          clearable
        />
      );
    } else if (type === 'selectCreatable') {
      inputElement = (
        <SelectCreatable
          creatable
          {...rest}
          inputProps={{
            className: `border border-gray-300  py-1 px-2 w-full rounded-md ${className} ${
              errors && errors[name] ? 'border-red-600' : ''
            }`,
          }}
          className={` w-full rounded-md ${className} ${
            errors && errors[name] ? 'border-red-600' : ''
          }`}
          options={options}
          value={getValues?.(name) || []}
          onChange={(val: any) => {
            setValue(name, val);
            trigger(name);
            if (onChange) onChange(val);
          }}
          filterable
          clearable
          // options={[
          //   { label: '架构云', value: '1', title: '架构云选项' },
          //   { label: '大数据', value: '2' },
          //   { label: '区块链', value: '3' },
          //   { label: '物联网', value: '4', disabled: true },
          //   {
          //     label: '人工智能',
          //     value: '5',
          //     content: <span>人工智能（新）</span>,
          //   },
          // ]}
        />
      );
    } else if (type === 'select') {
      inputElement = (
        <Select
          {...commonProps}
          key={key}
          styles={{
            control: (base) => ({
              ...base,
              border: 0,
              boxShadow: 'none',
            }),
          }}
          value={options?.find(
            (option: any) => option.value === getValues(name)
          )}
          options={options}
          className={`border border-gray-300 ${className || ''} rounded-md ${
            errors && errors[name] ? 'border-red-600' : ''
          }`}
          onChange={(val: any) => {
            setValue(name, val?.value);
            trigger(name);
            if (onChange) onChange(val?.value);
          }}
        />
      );
    } else if (startAdornment || endAdornment) {
      inputElement = (
        <>
          <div
            className={`${startAdornment ? 'flex-row-reverse' : ''} flex ${
              commonProps.className
            } ${endAdornment ? ' justify-between' : ''}`}
          >
            <input {...commonProps} type={type} className="flex-grow" />
            <span
              className={`adornment flex select-none items-center sm:text-sm text-gray-500 ${
                startAdornment ? 'mr-3' : 'ml-3'
              }`}
            >
              {startAdornment || endAdornment}
            </span>
          </div>
        </>
      );
    } else {
      inputElement = <input {...commonProps} type={type} />;
    }

    return inputElement;
  };

  return (
    <div className={containerClass}>
      {title && (
        <label
          htmlFor={name}
          className={`block text-sm font-medium leading-6 text-gray-900 ${labelStyle}`}
        >
          {title}
        </label>
      )}
      <div className={`${title && 'mt-2'}`}>
        {getInput()}
        {errors && errors[name] && (
          <p
            className={`text-xs text-red-600 ${type != 'date' && 'mt-2'}`}
            id="email-error"
          >
            {errors[name].message}
          </p>
        )}
      </div>
    </div>
  );
}
