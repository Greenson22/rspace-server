// src/components/elements/Card.tsx
"use client";

import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export const Card = ({ children, className = '' }: CardProps) => {
    return (
        // Menggunakan p-4 untuk mobile dan p-8 untuk layar medium ke atas
        <div className={`p-4 md:p-8 bg-white rounded-lg shadow ${className}`}>
            {children}
        </div>
    );
};