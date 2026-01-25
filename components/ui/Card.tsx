'use client';

import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'neo' | 'flat';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', variant = 'glass', children, ...props }, ref) => {
    const variants = {
      glass: 'glass rounded-2xl',
      neo: 'neo p-4',
      flat: 'bg-[var(--background-secondary)] rounded-2xl border border-[var(--glass-border)]',
    };

    return (
      <div
        ref={ref}
        className={`${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
