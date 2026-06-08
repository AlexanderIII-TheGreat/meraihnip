import React from 'react';
import { useForm } from 'react-hook-form';

interface FormProps {
  defaultValues?: any;
  otherValues?: any;
  children: React.ReactNode;
  onSubmit: (data: unknown) => void;
  className?: string;
  disabledEnter?: boolean;
}

interface ChildProps {
  children?: React.ReactNode;
  register?: any;
  errors?: any;
  setValue?: any;
  trigger?: any;
  control?: any;
  getValues?: any;
}

export default function Form({
  defaultValues,
  otherValues,
  children,
  onSubmit,
  className,
  disabledEnter,
}: FormProps) {
  const {
    handleSubmit,
    register,
    getValues,
    setValue,
    trigger,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues || otherValues,
    mode: 'onBlur',
  });

  const addPropsToChildren = (child: React.ReactNode): React.ReactNode => {
    if (React.isValidElement(child)) {
      const childProps: ChildProps = {
        register,
        errors,
        setValue,
        trigger,
        control,
        getValues,
      };

      // Type assertion for childProps
      const propsWithChildren = {
        ...childProps,
        children: React.Children.map(child.props?.children, addPropsToChildren),
      } as React.DOMAttributes<any> & ChildProps;

      return React.cloneElement(child, propsWithChildren);
    }

    return child;
  };

  const modifiedChildren = React.Children.map(children, addPropsToChildren);

  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={className}
      onKeyDown={disabledEnter ? handleFormKeyDown : undefined}
    >
      {modifiedChildren}
    </form>
  );
}
