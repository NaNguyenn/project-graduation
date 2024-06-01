"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { memo, useCallback, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { AppButton, AppInput } from "./ui";

type FormData = { email: string };

export const HomeForm = memo(() => {
  const t = useTranslations();

  const validationSchema: z.ZodType<FormData> = useMemo(
    () =>
      z.object({
        email: z
          .string()
          .min(1, { message: t("validationMessage.required") })
          .email(t("validationMessage.email.invalid")),
      }),
    [t]
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      email: "",
    },
    mode: "onChange",
  });

  const loading = useMemo(() => {
    return false;
  }, []);

  const onSubmit = useCallback(async (data: FormData) => {
    console.log(data);
  }, []);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-start gap-40px"
    >
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label={t("home.inputEmail.label")}
            labelClassName="text-lg"
            errorText={errors.email?.message}
            onChange={onChange}
            value={value}
          />
        )}
      />
      <AppButton
        className="self-end rounded-4 px-16px py-4px bg-primary-dark text-white"
        type="submit"
        disabled={loading}
      >
        {t("common.next")}
      </AppButton>
    </form>
  );
});
