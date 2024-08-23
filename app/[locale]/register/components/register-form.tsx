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
        z
          .object({
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
          })
          .refine((form) => !!form.account && !form.databaseName, {
            message: t("validationMessage.form.required"),
            path: ["databaseName"],
          })
          .refine((form) => !!form.databaseName && !form.account, {
            message: t("validationMessage.form.required"),
            path: ["account"],
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

    const handleSubmitSuccess = useCallback(() => {
      router.push("/");
      showToast({ message: t("registerUserSuccess"), type: "success" });
    }, [router, showToast, t]);

    const { mutateAsync: registerAsync, isPending: isLoadingRegisterAsync } =
      useRegisterUserMutation({
        onError: (err) => {
          showToast({ message: getMessage(err), type: "error" });
        },
        onSuccess: () => handleSubmitSuccess(),
      });

    const onSubmit = useCallback(
      async (data: RegisterFormType) => {
        if (
          data.account === checkTokenRes?.account &&
          data.databaseName === checkTokenRes?.databaseName &&
          data.username === checkTokenRes?.username
        ) {
          handleSubmitSuccess();
          return;
        }
        await registerAsync({
          data: {
            email: checkTokenRes?.email || data.email,
            username: checkTokenRes?.username || data.username,
            account: checkTokenRes?.account || data.account,
            databaseName: checkTokenRes?.databaseName || data.databaseName,
          },
          params: { locale: currentLocale },
        });
      },
      [
        checkTokenRes?.account,
        checkTokenRes?.databaseName,
        checkTokenRes?.email,
        checkTokenRes?.username,
        currentLocale,
        handleSubmitSuccess,
        registerAsync,
      ]
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
              disabled={!!checkTokenRes?.username}
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
              disabled={!!checkTokenRes?.account}
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
              disabled={!!checkTokenRes?.databaseName}
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
