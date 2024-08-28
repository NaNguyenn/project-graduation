import { spawn } from "child_process";
import { getTranslations } from "next-intl/server";
import { NextRequest } from "next/server";
import { z } from "zod";
import db from "../db";
import { regexNoSpecialCharsOrSpaces, regexPassword } from "@/app/utils";
import Register from "../models/Register";
import { Resend } from "resend";
import { fileURLToPath } from "url";
import path from "path/posix";

const registerUserSchema = z
  .object({
    email: z.string().min(1).email(),
    username: z.string().regex(regexNoSpecialCharsOrSpaces).optional(),
    passwordSsh: z.string().regex(regexPassword).optional(),
    account: z.string().regex(regexNoSpecialCharsOrSpaces).optional(),
    passwordMysql: z.string().regex(regexPassword).optional(),
    databaseName: z.string().regex(regexNoSpecialCharsOrSpaces).optional(),
  })
  .superRefine((form, ctx) => {
    if (
      !!form.username &&
      form.passwordSsh?.toLowerCase().includes(form.username?.toLowerCase())
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["passwordSsh"],
        fatal: true,
      });
    }
  });

const env = process.env.NODE_ENV;
const resend = new Resend(process.env.RESEND_API_KEY);
const senderEmail = process.env.RESEND_SENDER_EMAIL;
const devEmail = process.env.DEV_EMAIL;

export async function POST(req: NextRequest) {
  await db();
  const isDevMode = env === "development";
  const isSenderNotConfigured = senderEmail === devEmail;
  const { searchParams } = new URL(req.url);
  const locale = searchParams.get("locale");
  const t = await getTranslations({ locale });

  const runScript = async (
    scriptName: string,
    ...args: string[]
  ): Promise<{ status: number; message: string }> => {
    const scriptPath = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "..",
      "scripts",
      scriptName
    );

    return new Promise((resolve) => {
      const shellInstance = spawn("bash", [scriptPath, ...args]);

      let isShellError = false;
      let errorMessage = "";
      let outputMessage = "";

      shellInstance.stdout.on("data", (data) => {
        outputMessage += data.toString();
      });

      shellInstance.stderr.on("data", (err) => {
        isShellError = true;
        errorMessage += err.toString();
        console.error(err.toString());
      });

      shellInstance.on("exit", (code) => {
        if (isShellError) {
          resolve({
            status: 500,
            message: isDevMode ? errorMessage : t("error.system"),
          });
        } else {
          resolve({ status: 200, message: outputMessage || "Success" });
        }
      });
    });
  };

  const body = await req.json();
  const validation = registerUserSchema.safeParse(body);
  if (!validation.success)
    return Response.json(
      { message: t("validationMessage.form.invalid") },
      { status: 400 }
    );

  const existingRegister = await Register.findOne({ email: body.email });
  if (!existingRegister)
    return Response.json(
      { message: t("validationMessage.form.invalid") },
      { status: 404 }
    );

  try {
    const existingResource = await Register.findOne({
      $or: [
        { username: body.username },
        { account: body.account },
        { databaseName: body.databaseName },
      ],
    });
    if (existingResource && existingResource.email !== body.email) {
      return Response.json(
        { message: t("error.existingResource") },
        { status: 409 }
      );
    }

    if (body.username && body.passwordSsh) {
      const sshResult = await runScript(
        "create-ssh.sh",
        body.username,
        body.passwordSsh
      );
      if (sshResult.status !== 200) {
        return Response.json(
          { message: sshResult.message },
          { status: sshResult.status }
        );
      }
    }

    if (body.account && body.passwordMysql && body.databaseName) {
      const mysqlResult = await runScript(
        "create-mysql.sh",
        body.account,
        body.passwordMysql,
        body.databaseName
      );
      if (mysqlResult.status !== 200) {
        return Response.json(
          { message: mysqlResult.message },
          { status: mysqlResult.status }
        );
      }
    }

    try {
      if (!!body.username && !existingRegister.username) {
        existingRegister.username = body.username;
      }
      if (!!body.account && !existingRegister.account) {
        existingRegister.account = body.account;
      }
      if (!!body.databaseName && !existingRegister.databaseName) {
        existingRegister.databaseName = body.databaseName;
      }
      await existingRegister.save();
    } catch (error) {
      if (body.username) {
        await runScript("delete-ssh.sh", body.username);
      }
      if (body.account && body.databaseName) {
        await runScript("delete-mysql.sh", body.account, body.databaseName);
      }
      return Response.json(
        { message: isDevMode ? error : t("error.system") },
        { status: 500 }
      );
    }

    await resend.emails.send({
      from: isSenderNotConfigured
        ? "Acme <onboarding@resend.dev>"
        : senderEmail || "",
      to: isSenderNotConfigured ? devEmail || "" : body.email,
      subject: `${t("email.registerUserSuccessSubject")}`,
      html: `
        <div>
          <p>${t("email.registerUserSuccess")}</p>
          <p>
            ${
              body.passwordSsh
                ? `${t("register.inputUsername.label")}: <b>${
                    body.username
                  }</b>; ${t("register.password.label")}: <b>${
                    body.passwordSsh
                  }</b>;`
                : ""
            }
          </p>
          <p>
            ${
              body.passwordMysql
                ? `${t("register.inputAccount.label")}: <b>${
                    body.account
                  }</b>; ${t("register.password.label")}: <b>${
                    body.passwordMysql
                  }</b>; ${t("register.inputDatabaseName.label")}: <b>${
                    body.databaseName
                  }</b>;`
                : ""
            }
          </p>
        </div>
      `,
    });

    return Response.json(existingRegister, { status: 201 });
  } catch (err: any) {
    return Response.json({ message: t("error.system") }, { status: 500 });
  }
}

const checkTokenSchema = z.object({
  token: z.string().min(1),
  email: z.string().min(1).email(),
  expiryDate: z.string().min(1),
});

export async function GET(req: NextRequest) {
  await db();
  const { searchParams } = new URL(req.url);

  const locale = searchParams.get("locale");
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const expiryDate = searchParams.get("expiryDate");

  const t = await getTranslations({ locale });

  const validation = checkTokenSchema.safeParse({ token, email, expiryDate });
  if (!validation.success)
    return Response.json({ message: t("error.tokenInvalid") }, { status: 400 });

  try {
    const existingRegister = await Register.findOne({
      email: validation.data.email,
    });

    if (!existingRegister) {
      return Response.json(
        { message: t("error.tokenInvalid") },
        { status: 404 }
      );
    }

    if (
      existingRegister.token !== validation.data.token ||
      existingRegister.expiryDate !== validation.data.expiryDate
    ) {
      return Response.json(
        { message: t("error.tokenInvalid") },
        { status: 400 }
      );
    }

    if (new Date().valueOf() > existingRegister.expiryDate) {
      return Response.json(
        { message: t("error.tokenExpired") },
        { status: 400 }
      );
    }

    return Response.json(existingRegister, { status: 200 });
  } catch (err: any) {
    return Response.json({ message: err.message }, { status: 400 });
  }
}
