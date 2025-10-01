// src/components/elements/Button.tsx
"use client";

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary';
}

export const Button = ({ children, variant = 'primary', ...props }: ButtonProps) => {
    const baseStyle = "w-full px-4 py-2 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2";
    const styles = {
        primary: "text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500",
        secondary: "text-gray-500 bg-gray-100 hover:bg-gray-200"
    };

    return (
        <button className={`${baseStyle} ${styles[variant]}`} {...props}>
            {children}
        </button>
    );
};