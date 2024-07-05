"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, memo, useCallback, useTransition } from "react";
import { useLocale } from "use-intl";

export const SelectLocalization = memo(() => {
  const [isPending, startTransition] = useTransition();
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleLocalizationChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const selectedLocale = e.target.value;
      const pathParts = pathname.split("/");
      const currentLocale = pathParts[1];

      const newPathname = pathname.replace(
        `/${currentLocale}`,
        `/${selectedLocale}`
      );

      startTransition(() => {
        router.replace(`${newPathname}?${searchParams.toString()}`);
      });
    },
    [pathname, router, searchParams]
  );

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
