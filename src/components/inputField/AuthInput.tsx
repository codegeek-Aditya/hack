import React, { FC } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { Input } from "../ui/input";

interface AuthInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  touched?: boolean;
  placeholder?: string;
  showPass?: boolean;
  setShowPass?: (show: boolean) => void;
  className?: string;
  sendMessage?: () => void;
}

const AuthInput: FC<AuthInputProps> = ({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  touched,
  placeholder,
  showPass,
  setShowPass,
  className,
  sendMessage,
}) => {
  return (
    <div className={`form-group flex flex-col ${className}`}>
      {touched && error ? (
        <div className="mb-2 ml-1 text-sm text-destructive dark:text-destructive">
          {error}
        </div>
      ) : (
        <label htmlFor={id} className="mb-2 ml-1 text-sm font-medium">
          {label}
        </label>
      )}

      <div className="relative">
        <Input
          className="bg-light-input text-light-text dark:text-dark-text w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none placeholder:text-secondary-foreground"
          id={id}
          name={id}
          type={setShowPass ? (showPass ? "text" : "password") : "text"}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          onKeyDown={(e) => e.key === "Enter" && sendMessage && sendMessage()}
          required
        />
        {id === "password" && showPass !== undefined && setShowPass && (
          <div className="absolute right-5 top-3 text-lg text-zinc-400">
            {showPass ? (
              <FaRegEye
                onClick={() => setShowPass(false)}
                className="cursor-pointer"
              />
            ) : (
              <FaRegEyeSlash
                onClick={() => setShowPass(true)}
                className="cursor-pointer"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthInput;
