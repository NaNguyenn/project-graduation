import { exec, spawn } from "child_process";
import util from "util";
import { getTranslations } from "next-intl/server";
import { NextRequest } from "next/server";
import { z } from "zod";
import db from "../db";
import { regexNoSpecialCharsOrSpaces } from "@/app/utils";
import Register from "../models/Register";
import { Resend } from "resend";
import { fileURLToPath } from "url";
import path from "path/posix";

const registerUserSchema = z.object({
  email: z.string().min(1).email(),
  username: z.string().regex(regexNoSpecialCharsOrSpaces).optional(),
  account: z.string().regex(regexNoSpecialCharsOrSpaces).optional(),
  databaseName: z.string().regex(regexNoSpecialCharsOrSpaces).optional(),
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

  const body = await req.json();
  const validation = registerUserSchema.safeParse(body);
  if (!validation.success)
    return Response.json(
      { message: t("validationMessage.form.invalid") },
      { status: 400 }
    );

  try {
    const existingRegister = await Register.findOne({ email: body.email });
    if (!existingRegister)
      return Response.json(
        { message: t("validationMessage.form.invalid") },
        { status: 404 }
      );

    if (!!body.username && !existingRegister.username) {
      const scriptPath = path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        "..",
        "scripts",
        "ssh.ps1"
      );

      const result = await new Promise<{ status: number; message: string }>(
        (resolve) => {
          const shellInstance = spawn("powershell.exe", [
            scriptPath,
            "NGuyenNguyenn",
          ]);

          let isShellError = false;

          shellInstance.stdout.on("data", (data) => {
            console.log(data.toString());
          });

          shellInstance.stderr.on("data", (err) => {
            isShellError = true;
            console.error(err.toString());
          });

          shellInstance.on("exit", (code) => {
            if (isShellError) {
              resolve({ status: 500, message: t("error.system") });
            } else {
              console.log(`Child process exited with code ${code}`);
              resolve({ status: 200, message: body });
            }
          });
        }
      );
      existingRegister.username = body.username;
    }
    if (!!body.account && !existingRegister.account) {
      existingRegister.account = body.account;
    }
    if (!!body.databaseName && !existingRegister.databaseName) {
      existingRegister.databaseName = body.databaseName;
    }

    try {
      await existingRegister.save();
    } catch (error) {
      return Response.json(
        { message: isDevMode ? error : t("error.system") },
        { status: 500 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: isSenderNotConfigured
        ? "Acme <onboarding@resend.dev>"
        : senderEmail || "",
      to: isSenderNotConfigured ? devEmail || "" : body.email,
      subject: `${t("email.registerUserSuccessSubject")}`,
      html: `
  <p>
    ${t("email.registerUserSuccess")}
    ${
      !!body.username
        ? `${t("register.inputUsername.label")}: <b>${body.username}</b>;`
        : ""
    }
    ${
      !!body.account
        ? `${t("register.inputAccount.label")}: <b>${body.account}</b>;`
        : ""
    }
    ${
      !!body.databaseName
        ? `${t("register.inputDatabaseName.label")}: <b>${
            body.databaseName
          }</b>;`
        : ""
    }
  </p>
`,
    });

    if (error) {
      return Response.json(isDevMode ? error : { message: t("error.system") }, {
        status: 500,
      });
    }

    return Response.json(existingRegister, { status: 200 });
  } catch (err: any) {
    return Response.json({ message: err.message }, { status: 400 });
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
