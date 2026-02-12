import React from 'react';
import { cva } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 h-[30px] ',
  {
    variants: {
      size: {
        short: 'w-[30%] text-sm mt-[20px]',
        mid: 'w-[48%] text-sm mt-[30px]',
        long: 'w-full text-sm  mt-[50px]',
      },
      variant: {
        primary: 'bg-main-02 hover:bg-deep',
        line: 'bg-white text-main-02 border-[0.5px] border-main-02  hover:bg-light-01',
        point: 'bg-point hover:bg-point-hov',
      },
    },
    defaultVariants: {
      size: 'long',
      variant: 'primary',
    },
  },
);

const Button = ({ size, variant, className, ...props }) => {
  return <button className={twMerge(buttonVariants({ size, variant }), className)} {...props} />;
};

export default Button;
