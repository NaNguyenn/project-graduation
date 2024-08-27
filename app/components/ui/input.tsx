import Image from "next/image";
import { DetailedHTMLProps, InputHTMLAttributes, memo, useState } from "react";

type Props = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  errorText?: string;
  label?: string;
  labelClassName?: string;
};

export const AppInput = memo(
  ({ errorText, label, labelClassName, type, ...props }: Props) => {
    const [isPasswordShown, setIsPasswordShown] = useState<boolean>();

    return (
      <div className="flex flex-col gap-4px w-314px">
        <label className={labelClassName}>{label}</label>
        <div className="relative">
          <input
            {...props}
            className={
              "w-full border-solid border-0 border-b focus:outline-0 " +
              (errorText
                ? "border-red-500"
                : "border-black focus:border-blue-400")
            }
            type={
              type === "password"
                ? isPasswordShown
                  ? "text"
                  : "password"
                : type
            }
          />
          {type === "password" && (
            <Image
              src={
                isPasswordShown
                  ? "/icons/password-shown.svg"
                  : "/icons/password-hidden.svg"
              }
              width={18}
              height={18}
              alt="trigger password mask button"
              className="absolute top-0 right-0"
              onClick={() => setIsPasswordShown(!isPasswordShown)}
            />
          )}
        </div>
        <p className="text-red-500 text-sm">{errorText}</p>
      </div>
    );
  }
);
