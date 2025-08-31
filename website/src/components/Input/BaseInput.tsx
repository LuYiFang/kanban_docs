import React, { forwardRef, InputHTMLAttributes } from "react";

export type BaseInputPropsType = InputHTMLAttributes<HTMLInputElement>;

const BaseInput = forwardRef<HTMLInputElement, BaseInputPropsType>(
  ({ className, ...others }, ref) => {
    return (
      <input
        className={`p-2 border rounded bg-gray-800 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        ref={ref}
        {...others}
      />
    );
  },
);

export default BaseInput;
