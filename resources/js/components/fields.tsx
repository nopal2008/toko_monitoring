import type {
    InputHTMLAttributes,
    ReactNode,
    SelectHTMLAttributes,
    TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';

const controlClass =
    'block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-emerald-600 disabled:bg-slate-100';

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
            <label
                htmlFor={id}
                className="mb-1 block text-sm font-medium text-slate-800"
            >
                {label}
                {required && (
                    <span className="text-red-700" aria-hidden="true">
                        {' '}
                        *
                    </span>
                )}
            </label>
            {children}
            {hint && !error && (
                <p id={`${id}-hint`} className="mt-1 text-xs text-slate-500">
                    {hint}
                </p>
            )}
            {error && (
                <p
                    id={`${id}-error`}
                    role="alert"
                    className="mt-1 text-sm text-red-700"
                >
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

export function TextField({
    id,
    label,
    error,
    hint,
    ...props
}: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
    return (
        <Field
            id={id}
            label={label}
            error={error}
            hint={hint}
            required={props.required}
        >
            <input
                id={id}
                aria-invalid={error ? true : undefined}
                aria-describedby={
                    error ? `${id}-error` : hint ? `${id}-hint` : undefined
                }
                className={cn(
                    controlClass,
                    error ? 'border-red-600' : 'border-slate-300',
                )}
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
}: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <Field
            id={id}
            label={label}
            error={error}
            hint={hint}
            required={props.required}
        >
            <textarea
                id={id}
                rows={3}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${id}-error` : undefined}
                className={cn(
                    controlClass,
                    error ? 'border-red-600' : 'border-slate-300',
                )}
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
}: BaseProps & SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <Field
            id={id}
            label={label}
            error={error}
            hint={hint}
            required={props.required}
        >
            <select
                id={id}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${id}-error` : undefined}
                className={cn(
                    controlClass,
                    error ? 'border-red-600' : 'border-slate-300',
                )}
                {...props}
            >
                {children}
            </select>
        </Field>
    );
}

export function CheckboxField({
    id,
    label,
    error,
    ...props
}: Omit<BaseProps, 'hint'> &
    Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
    return (
        <div>
            <label
                htmlFor={id}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-800"
            >
                <input
                    id={id}
                    type="checkbox"
                    className="size-4 rounded border-slate-300 accent-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                    {...props}
                />
                {label}
            </label>
            {error && (
                <p role="alert" className="mt-1 text-sm text-red-700">
                    {error}
                </p>
            )}
        </div>
    );
}
