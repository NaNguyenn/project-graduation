"use client";

import { useEffect } from "react";
import { ToastType } from "./type.interface";

type Props = ToastType & {
  onClose: (id: string) => void;
};

export const Toast = ({ id, message, type, onClose }: Props) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 5 * 1000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  return (
    <div
      className={`shadow-sm rounded-4 p-16px text-white ${
        type === "success"
          ? "bg-green-400 shadow-green-400"
          : type === "error"
          ? "bg-red-400 shadow-red-400"
          : "bg-black"
      }`}
      onClick={() => onClose(id)}
    >
      <p>{message}</p>
    </div>
  );
};
