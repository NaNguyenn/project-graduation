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
      console.log(data.toString());
    });

    shellInstance.stderr.on("data", (err) => {
      isShellError = true;
      errorMessage += err.toString();
      console.error(err.toString());
    });

    shellInstance.on("exit", (code) => {
      console.log(`Child process exited with code ${code}`);
      if (isShellError) {
        resolve({
          status: 500,
          message: errorMessage || "Script execution failed",
        });
      } else {
        resolve({ status: 200, message: outputMessage || "Success" });
      }
    });
  });
};

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
    if (existingResource) {
      return Response.json(
        { message: t("validationMessage.userExists") },
        { status: 409 }
      );
    }

    const createdResources = [];

    if (body.username) {
      const sshResult = await runScript("create-ssh.sh", body.username);
      if (sshResult.status !== 200) {
        return Response.json(
          { message: sshResult.message },
          { status: sshResult.status }
        );
      }
      createdResources.push("SSH account");
    }

    if (body.account && body.databaseName) {
      const mysqlResult = await runScript(
        "create-mysql.sh",
        body.account,
        body.databaseName
      );
      if (mysqlResult.status !== 200) {
        return Response.json(
          { message: mysqlResult.message },
          { status: mysqlResult.status }
        );
      }
      createdResources.push("MySQL account and database");
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
      // if (body.username) {
      //   await runScript("delete_ssh_account.ps1", body.username);
      // }
      // if (body.account && body.databaseName) {
      //   await runScript(
      //     "delete_mysql_account_and_database.ps1",
      //     body.account,
      //     body.databaseName
      //   );
      // }
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
            body.username
              ? `${t("register.inputUsername.label")}: <b>${body.username}</b>;`
              : ""
          }
          ${
            body.account
              ? `${t("register.inputAccount.label")}: <b>${body.account}</b>;`
              : ""
          }
          ${
            body.databaseName
              ? `${t("register.inputDatabaseName.label")}: <b>${
                  body.databaseName
                }</b>;`
              : ""
          }
        </p>
        <p>Created resources: ${createdResources.join(", ")}</p>
      `,
    });

    if (error) {
      console.error("Failed to send email:", error);
    }

    return Response.json(existingRegister, { status: 201 });
  } catch (err: any) {
    return Response.json({ message: t("error.system") }, { status: 500 });
  }
}
