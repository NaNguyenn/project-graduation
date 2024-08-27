"use client";
import { useToast } from "@/app/components";
import { AppInput, AppButton } from "@/app/components/ui";
import { useCheckTokenQuery, useRegisterUserMutation } from "@/app/services";
import {
  getMessage,
  regexNoSpecialCharsOrSpaces,
  regexPassword,
} from "@/app/utils";
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
  passwordSsh?: string;
  passwordSshConfirm?: string;
  account?: string;
  passwordMysql?: string;
  passwordMysqlConfirm?: string;
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
            passwordSsh: z
              .string()
              .regex(regexPassword, t("validationMessage.password.invalid"))
              .optional(),
            passwordSshConfirm: z.string().optional(),
            account: z
              .string()
              .regex(
                regexNoSpecialCharsOrSpaces,
                t("validationMessage.form.invalid")
              )
              .optional(),
            passwordMysql: z
              .string()
              .regex(regexPassword, t("validationMessage.password.invalid"))
              .optional(),
            passwordMysqlConfirm: z.string().optional(),
            databaseName: z
              .string()
              .regex(
                regexNoSpecialCharsOrSpaces,
                t("validationMessage.form.invalid")
              )
              .optional(),
          })
          .superRefine((form: RegisterFormType, ctx) => {
            if (!!form.passwordSsh && !form.username) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["username"],
                fatal: true,
                message: t("validationMessage.required"),
              });
            }
            if (!!form.username && !form.passwordSsh) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["passwordSsh"],
                fatal: true,
                message: t("validationMessage.required"),
              });
            }
            if (form.passwordSsh !== form.passwordSshConfirm) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["passwordSshConfirm"],
                fatal: true,
                message: t("validationMessage.password.notMatched"),
              });
            }
            if (
              !!form.username &&
              form.passwordSsh
                ?.toLowerCase()
                .includes(form.username?.toLowerCase())
            ) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["passwordSsh"],
                fatal: true,
                message: t("validationMessage.password.containUsername"),
              });
            }
            if (!!form.account && !form.passwordMysql) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["passwordMysql"],
                fatal: true,
                message: t("validationMessage.required"),
              });
            }
            if (!!form.passwordMysql && !form.account) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["account"],
                fatal: true,
                message: t("validationMessage.required"),
              });
            }
            if (form.passwordMysql !== form.passwordMysqlConfirm) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["passwordMysqlConfirm"],
                fatal: true,
                message: t("validationMessage.password.notMatched"),
              });
            }
            if (!!form.account && !form.databaseName) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["databaseName"],
                fatal: true,
                message: t("validationMessage.required"),
              });
            }
            if (!!form.databaseName && !form.account) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["account"],
                fatal: true,
                message: t("validationMessage.required"),
              });
            }
          }),
      [t]
    );

    const {
      control,
      handleSubmit,
      watch,
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
          (data.account === checkTokenRes?.account &&
            data.databaseName === checkTokenRes?.databaseName &&
            data.username === checkTokenRes?.username) ||
          (!data.account && !data.databaseName && !data.username)
        ) {
          router.push("/");
          return;
        }
        await registerAsync({
          data: {
            email: checkTokenRes?.email || data.email,
            username: checkTokenRes?.username || data.username,
            passwordSsh: checkTokenRes?.passwordSsh || data.passwordSsh,
            account: checkTokenRes?.account || data.account,
            passwordMysql: checkTokenRes?.passwordMysql || data.passwordMysql,
            databaseName: checkTokenRes?.databaseName || data.databaseName,
          },
          params: { locale: currentLocale },
        });
      },
      [
        checkTokenRes?.account,
        checkTokenRes?.databaseName,
        checkTokenRes?.email,
        checkTokenRes?.passwordMysql,
        checkTokenRes?.passwordSsh,
        checkTokenRes?.username,
        currentLocale,
        registerAsync,
        router,
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
        <div className="flex gap-40px">
          <div className="flex flex-col items-start gap-24px">
            <p className="font-bold text-lg text-primary-dark capitalize">
              {t("resource.serverAccount")}
            </p>
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
              name="passwordSsh"
              render={({ field: { onChange, value } }) => (
                <AppInput
                  label={t("register.password.label")}
                  labelClassName="text-lg"
                  errorText={errors.passwordSsh?.message}
                  onChange={onChange}
                  value={value}
                  disabled={!!checkTokenRes?.passwordSsh}
                  type="password"
                />
              )}
            />
            {!checkTokenRes?.passwordSsh && (
              <Controller
                control={control}
                name="passwordSshConfirm"
                render={({ field: { onChange, value } }) => (
                  <AppInput
                    label={t("register.passwordConfirm.label")}
                    labelClassName="text-lg"
                    errorText={errors.passwordSshConfirm?.message}
                    onChange={onChange}
                    value={value}
                    type="password"
                  />
                )}
              />
            )}
          </div>
          <div className="flex flex-col items-start gap-24px">
            <p className="font-bold text-lg text-primary-dark capitalize">
              {t("resource.databaseMysql")}
            </p>
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
              name="passwordMysql"
              render={({ field: { onChange, value } }) => (
                <AppInput
                  label={t("register.password.label")}
                  labelClassName="text-lg"
                  errorText={errors.passwordMysql?.message}
                  onChange={onChange}
                  value={value}
                  disabled={!!checkTokenRes?.passwordMysql}
                  type="password"
                />
              )}
            />
            {!checkTokenRes?.passwordMysql && (
              <Controller
                control={control}
                name="passwordMysqlConfirm"
                render={({ field: { onChange, value } }) => (
                  <AppInput
                    label={t("register.passwordConfirm.label")}
                    labelClassName="text-lg"
                    errorText={errors.passwordMysqlConfirm?.message}
                    onChange={onChange}
                    value={value}
                    type="password"
                  />
                )}
              />
            )}
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
          </div>
        </div>
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
