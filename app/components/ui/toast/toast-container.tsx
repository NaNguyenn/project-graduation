import { Toast } from "./toast";
import { ToastType } from "./type.interface";

type Props = {
  toasts: ToastType[];
  removeToast: (id: string) => void;
};

export const ToastContainer = ({ toasts, removeToast }: Props) => {
  return (
    <div className="fixed bottom-16px right-16px z-50 flex flex-col gap-12px">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={removeToast} />
      ))}
    </div>
  );
};
