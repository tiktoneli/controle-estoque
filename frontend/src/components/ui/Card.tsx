import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> { }

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                'rounded-lg border bg-card text-card-foreground shadow-sm',
                className
            )}
            {...props}
        />
    )
);
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn('flex flex-col space-y-1.5 p-6', className)}
            {...props}
        />
    )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<HTMLParagraphElement, CardProps>(
    ({ className, ...props }, ref) => (
        <h3
            ref={ref}
            className={cn(
                'text-2xl font-semibold leading-none tracking-tight',
                className
            )}
            {...props}
        />
    )
);
CardTitle.displayName = 'CardTitle';

export const CardContent = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
    )
);
CardContent.displayName = 'CardContent'; 