import { HiOutlineChevronDown } from "react-icons/hi2";
import {
  errorTextClass,
  fieldClass,
  labelClass,
  selectChevronClass,
  selectClass,
} from "../utils/formStyles";

function FormFieldLayout({ label, htmlFor, error, required, children }) {
  const errorId = error?.message ? `${htmlFor}-error` : undefined;

  return (
    <div>
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
        {required ? " *" : ""}
      </label>
      {children(errorId)}
      {error?.message && (
        <p id={errorId} className={errorTextClass} role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}

function renderOptions(options) {
  return options.map((option) => (
    <option key={option.value} value={option.value}>
      {option.hint ? `${option.label} · ${option.hint}` : option.label}
    </option>
  ));
}

function SelectControl({
  id,
  name,
  register,
  hasError,
  variant,
  errorId,
  placeholder,
  options = [],
  required = false,
  children,
  value,
  onChange,
  ...props
}) {
  const isControlled = value !== undefined;
  const registration = register && name ? register(name) : {};

  return (
    <div className="relative">
      <select
        id={id}
        required={required}
        {...registration}
        {...(isControlled ? { value, onChange } : {})}
        aria-invalid={hasError}
        aria-describedby={errorId}
        className={selectClass(hasError, variant)}
        {...props}
      >
        {placeholder != null && (
          <option value="" disabled={required}>
            {placeholder}
          </option>
        )}
        {options.length > 0 ? renderOptions(options) : children}
      </select>
      <HiOutlineChevronDown className={selectChevronClass} aria-hidden />
    </div>
  );
}

export function FormServerError({ message }) {
  if (!message) return null;
  return (
    <p
      className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600"
      role="alert"
    >
      {message}
    </p>
  );
}

export function TextField({
  label,
  name,
  register,
  error,
  required = false,
  type = "text",
  variant = "default",
  ...props
}) {
  const hasError = Boolean(error);

  return (
    <FormFieldLayout
      label={label}
      htmlFor={name}
      error={error}
      required={required}
    >
      {(errorId) => (
        <input
          id={name}
          type={type}
          {...register(name)}
          aria-invalid={hasError}
          aria-describedby={errorId}
          className={fieldClass(hasError, variant)}
          {...props}
        />
      )}
    </FormFieldLayout>
  );
}

export function SelectField({
  label,
  name,
  register,
  error,
  required = false,
  variant = "default",
  placeholder = "Select an option",
  options = [],
  children,
  ...props
}) {
  const hasError = Boolean(error);

  return (
    <FormFieldLayout
      label={label}
      htmlFor={name}
      error={error}
      required={required}
    >
      {(errorId) => (
        <SelectControl
          id={name}
          name={name}
          register={register}
          hasError={hasError}
          variant={variant}
          errorId={errorId}
          placeholder={placeholder}
          options={options}
          required={required}
          {...props}
        >
          {children}
        </SelectControl>
      )}
    </FormFieldLayout>
  );
}

/** Standalone select for filters and other controlled forms */
export function FilterSelect({
  value,
  onChange,
  placeholder,
  options = [],
  variant = "filter",
  ...props
}) {
  return (
    <SelectControl
      id={props.id}
      value={value}
      onChange={onChange}
      hasError={false}
      variant={variant}
      placeholder={placeholder}
      options={options}
      {...props}
    />
  );
}

export function TextareaField({
  label,
  name,
  register,
  error,
  required = false,
  variant = "default",
  rows = 3,
  ...props
}) {
  const hasError = Boolean(error);

  return (
    <FormFieldLayout
      label={label}
      htmlFor={name}
      error={error}
      required={required}
    >
      {(errorId) => (
        <textarea
          id={name}
          rows={rows}
          {...register(name)}
          aria-invalid={hasError}
          aria-describedby={errorId}
          className={fieldClass(hasError, variant)}
          {...props}
        />
      )}
    </FormFieldLayout>
  );
}
