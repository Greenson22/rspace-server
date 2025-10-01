// src/components/elements/Card.tsx
"use client";

import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export const Card = ({ children, className = '' }: CardProps) => {
    return (
        <div className={`p-8 bg-white rounded-lg shadow ${className}`}>
            {children}
        </div>
    );
};