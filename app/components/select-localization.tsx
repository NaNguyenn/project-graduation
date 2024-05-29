"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, memo, useTransition } from "react";
import { useLocale } from "use-intl";

export const SelectLocalization = memo(() => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const currentLocale = useLocale();
  const handleLocalizationChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedLocale = e.target.value;
    startTransition(() => {
      router.replace("/" + selectedLocale);
    });
  };

  return (
    <select
      className="p-8px rounded-8 fixed top-10px right-10px"
      onChange={handleLocalizationChange}
      defaultValue={currentLocale}
      disabled={isPending}
    >
      <option value="en">English</option>
      <option value="vi">Tiếng Việt</option>
    </select>
  );
});
