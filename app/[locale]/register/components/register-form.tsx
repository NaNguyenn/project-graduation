"use client";
import { useToast } from "@/app/components";
import { AppInput, AppButton } from "@/app/components/ui";
import { useCheckTokenQuery, useRegisterUserMutation } from "@/app/services";
import { getMessage, regexNoSpecialCharsOrSpaces } from "@/app/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

export type RegisterFormProps = {
  email: string;
  expirydate: string;
  token: string;
};

type RegisterFormType = {
  email: string;
  username?: string;
  account?: string;
  databaseName?: string;
};

export const RegisterForm = memo(
  ({ email, expirydate, token }: RegisterFormProps) => {
    const t = useTranslations();
    const { showToast } = useToast();
    const currentLocale = useLocale();
    const router = useRouter();

    const {
      data: checkTokenRes,
      error: checkTokenErr,
      isLoading: isLoadingCheckToken,
    } = useCheckTokenQuery(
      {
        email,
        expiryDate: expirydate,
        token,
        locale: currentLocale,
      },
      {
        enabled: !!email && !!expirydate && !!token && !!currentLocale,
        retry: false,
      }
    );
    useEffect(() => {
      if (checkTokenErr) {
        router.replace("/");
        showToast({ message: getMessage(checkTokenErr), type: "error" });
      }
    }, [checkTokenErr, router, showToast]);

    const validationSchema: z.ZodType<RegisterFormType> = useMemo(
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
      formState: { errors },
    } = useForm<RegisterFormType>({
      resolver: zodResolver(validationSchema),
      defaultValues: {
        email: email,
        username: "",
        account: "",
        databaseName: "",
      },
      values: {
        email: checkTokenRes?.email || email,
        username: checkTokenRes?.username || "",
        account: checkTokenRes?.account || "",
        databaseName: checkTokenRes?.databaseName || "",
      },
      mode: "onChange",
    });

    const { mutateAsync: registerAsync, isPending: isLoadingRegisterAsync } =
      useRegisterUserMutation({
        onError: (err) => {
          showToast({ message: getMessage(err), type: "error" });
        },
        onSuccess: () =>
          showToast({ message: t("pleaseCheckInbox"), type: "success" }),
      });

    const onSubmit = useCallback(
      async (data: RegisterFormType) => {
        await registerAsync({ data: data, params: { locale: currentLocale } });
      },
      [currentLocale, registerAsync]
    );

    const loading = useMemo(() => {
      return isLoadingRegisterAsync || isLoadingCheckToken;
    }, [isLoadingCheckToken, isLoadingRegisterAsync]);

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
  }
);
