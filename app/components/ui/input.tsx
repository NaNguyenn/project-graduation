import { DetailedHTMLProps, InputHTMLAttributes, memo } from "react";

type Props = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  errorText?: string;
  label?: string;
  labelClassName?: string;
};

export const AppInput = memo(
  ({ errorText, label, labelClassName, ...props }: Props) => {
    return (
      <div className="flex flex-col gap-4px">
        <label className={labelClassName}>{label}</label>
        <input
          {...props}
          className={
            "border-solid border-0 border-b focus:outline-0 " +
            (errorText
              ? "border-red-500"
              : "border-black focus:border-blue-400")
          }
        />
        <p className="text-red-500 text-sm">{errorText}</p>
      </div>
    );
  }
);
