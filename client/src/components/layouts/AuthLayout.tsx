// src/components/layouts/AuthLayout.tsx
"use client";

import React from 'react';

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                {children}
            </div>
        </div>
    );
};