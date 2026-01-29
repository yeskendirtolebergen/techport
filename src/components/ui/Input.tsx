import React from 'react';
import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export function Input({
    label,
    error,
    helperText,
    id,
    className = '',
    ...props
}: InputProps) {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className={styles.inputWrapper}>
            {label && (
                <label htmlFor={inputId} className={styles.label}>
                    {label}
                </label>
            )}
            <input
                id={inputId}
                className={`${styles.input} ${error ? styles.error : ''} ${className}`}
                {...props}
            />
            {error && <p className={styles.errorText}>{error}</p>}
            {!error && helperText && <p className={styles.helperText}>{helperText}</p>}
        </div>
    );
}
