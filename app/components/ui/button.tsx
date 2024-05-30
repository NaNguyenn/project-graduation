import { ButtonHTMLAttributes, DetailedHTMLProps, memo } from "react";

type Props = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

export const AppButton = memo(
  ({ className, children, disabled, ...props }: Props) => {
    return (
      <button
        className={className + " " + (disabled && "opacity-50")}
        {...props}
      >
        {children}
      </button>
    );
  }
);
