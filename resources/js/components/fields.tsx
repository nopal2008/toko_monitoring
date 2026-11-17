import { AlertCircle } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { Input, Label, Select, Textarea } from '@/components/ui/input';

function Field({
    id,
    label,
    error,
    hint,
    required,
    children,
}: {
    id: string;
    label: string;
    error?: string;
    hint?: string;
    required?: boolean;
    children: ReactNode;
}) {
    return (
        <div>
            <Label htmlFor={id}>
                {label}
                {required && (
                    <span className="text-danger-fg" aria-hidden="true">
                        {' '}
                        *
                    </span>
                )}
            </Label>
            {children}
            {hint && !error && (
                <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted-foreground">
                    {hint}
                </p>
            )}
            {error && (
                <p
                    id={`${id}-error`}
                    role="alert"
                    className="mt-1.5 flex items-center gap-1.5 text-xs text-danger-fg"
                >
                    <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
                    {error}
                </p>
            )}
        </div>
    );
}

type BaseProps = {
    id: string;
    label: string;
    error?: string;
    hint?: string;
};

function describedBy(id: string, error?: string, hint?: string) {
    return error ? `${id}-error` : hint ? `${id}-hint` : undefined;
}

export function TextField({
    id,
    label,
    error,
    hint,
    ...props
}: BaseProps & ComponentProps<'input'>) {
    return (
        <Field id={id} label={label} error={error} hint={hint} required={props.required}>
            <Input
                id={id}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy(id, error, hint)}
                {...props}
            />
        </Field>
    );
}

export function TextAreaField({
    id,
    label,
    error,
    hint,
    ...props
}: BaseProps & ComponentProps<'textarea'>) {
    return (
        <Field id={id} label={label} error={error} hint={hint} required={props.required}>
            <Textarea
                id={id}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy(id, error, hint)}
                {...props}
            />
        </Field>
    );
}

export function SelectField({
    id,
    label,
    error,
    hint,
    children,
    ...props
}: BaseProps & ComponentProps<'select'>) {
    return (
        <Field id={id} label={label} error={error} hint={hint} required={props.required}>
            <Select
                id={id}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy(id, error, hint)}
                {...props}
            >
                {children}
            </Select>
        </Field>
    );
}

export function CheckboxField({
    id,
    label,
    error,
    ...props
}: Omit<BaseProps, 'hint'> & Omit<ComponentProps<'input'>, 'type'>) {
    return (
        <div>
            <label
                htmlFor={id}
                className="inline-flex min-h-6 cursor-pointer items-center gap-2.5 text-sm font-medium text-foreground"
            >
                <input
                    id={id}
                    type="checkbox"
                    className="size-4 rounded border-border accent-primary focus-visible:ring-4 focus-visible:ring-ring/20 focus-visible:outline-none"
                    {...props}
                />
                {label}
            </label>
            {error && (
                <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs text-danger-fg">
                    <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
                    {error}
                </p>
            )}
        </div>
    );
}
