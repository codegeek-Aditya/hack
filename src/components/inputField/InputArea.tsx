import React, { FC } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

interface InputAreaProps {
  id: string;
  label: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}

const InputArea: FC<InputAreaProps> = ({
  id,
  label,
  onChange,
  placeholder,
  className,
}) => {
  return (
    <div className={`form-group flex flex-col ${className}`}>
      <label
        htmlFor={id}
        className="text-light-text dark:text-dark-text mb-2 ml-1 text-xs font-medium text-zinc-400"
      >
        {label}
      </label>

      <div className="relative">
        <input
          className="bg-light-input text-light-text dark:text-dark-text placeholder:text-light-placeholder dark:placeholder:text-dark-placeholder w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none placeholder:font-light"
          id={id}
          name={id}
          type={"text"}
          onChange={onChange}
          placeholder={placeholder}
          required
        />
      </div>
    </div>
  );
};

export default InputArea;
