// src/components/fragments/InputField.tsx
"use client";

import React from 'react';
import { Input } from '../elements/Input';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id: string;
}

export const InputField = ({ label, id, ...props }: InputFieldProps) => {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700">
                {label}
            </label>
            <Input id={id} name={id} {...props} />
        </div>
    );
};