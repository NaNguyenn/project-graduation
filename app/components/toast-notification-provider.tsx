"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { generateUniqueToken } from "../utils";
import { ToastContainer, ToastType } from "./ui/toast";

type ContextProps = {
  showToast: (
    toast: Omit<ToastType, "id"> & Partial<Pick<ToastType, "id">>
  ) => void;
};

type Props = {
  children: ReactNode;
};

const ToastNotificationContext = createContext<ContextProps>({
  showToast() {
    throw new Error("not ready");
  },
});

export const useToast = () => useContext(ToastNotificationContext);

export const ToastNotificationContextProvider = ({ children }: Props) => {
  const [toasts, setToasts] = useState<
    Array<{ id: string; message: string; type: "success" | "error" }>
  >([]);

  const showToast = useCallback(
    (toast: Omit<ToastType, "id"> & Partial<Pick<ToastType, "id">>) => {
      const id = generateUniqueToken(16);
      setToasts((prevToasts) => [
        ...prevToasts,
        { id, message: toast.message, type: toast.type },
      ]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastNotificationContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastNotificationContext.Provider>
  );
};
