"use client";
import { AppInput, AppButton } from "@/app/components/ui";
import { regexNoSpecialCharsOrSpaces } from "@/app/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { memo, useCallback, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

type Props = {
  email: string;
};

type FormData = {
  email: string;
  username?: string;
  account?: string;
  databaseName?: string;
};

export const RegisterForm = memo(({ email }: Props) => {
  const t = useTranslations();

  const validationSchema: z.ZodType<FormData> = useMemo(
    () =>
      z.object({
        email: z.string().min(1).email(),
        username: z
          .string()
          .regex(
            regexNoSpecialCharsOrSpaces,
            t("validationMessage.form.invalid")
          )
          .optional(),
        account: z
          .string()
          .regex(
            regexNoSpecialCharsOrSpaces,
            t("validationMessage.form.invalid")
          )
          .optional(),
        databaseName: z
          .string()
          .regex(
            regexNoSpecialCharsOrSpaces,
            t("validationMessage.form.invalid")
          )
          .optional(),
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
      email: email,
      username: "",
      account: "",
      databaseName: "",
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
        name="username"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label={t("register.inputUsername.label")}
            labelClassName="text-lg"
            errorText={errors.username?.message}
            onChange={onChange}
            value={value}
          />
        )}
      />
      <Controller
        control={control}
        name="account"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label={t("register.inputAccount.label")}
            labelClassName="text-lg"
            errorText={errors.account?.message}
            onChange={onChange}
            value={value}
          />
        )}
      />
      <Controller
        control={control}
        name="databaseName"
        render={({ field: { onChange, value } }) => (
          <AppInput
            label={t("register.inputDatabaseName.label")}
            labelClassName="text-lg"
            errorText={errors.databaseName?.message}
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
