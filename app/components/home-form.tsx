"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { memo, useCallback, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { AppButton, AppInput } from "./ui";
import { useRegisterEmailMutation } from "../services";

type HomeFormType = { email: string };

export const HomeForm = memo(() => {
  const currentLocale = useLocale();
  const t = useTranslations();

  const validationSchema: z.ZodType<HomeFormType> = useMemo(
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
    setValue,
    formState: { errors },
  } = useForm<HomeFormType>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      email: "",
    },
    mode: "onChange",
  });

  const { mutateAsync: registerAsync, isPending: isLoadingRegisterAsync } =
    useRegisterEmailMutation({
      onError: (err) => {
        console.log(err, "error");
      },
      onSuccess: (res) => console.log(res),
    });

  const onSubmit = useCallback(
    async (data: HomeFormType) => {
      await registerAsync({ data: data, params: { locale: currentLocale } });
    },
    [currentLocale, registerAsync]
  );

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
        disabled={isLoadingRegisterAsync}
      >
        {t("common.next")}
      </AppButton>
    </form>
  );
});
