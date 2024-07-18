import { getTranslations } from "next-intl/server";
import { NextRequest } from "next/server";
import { z } from "zod";
import db from "../db";
import { regexNoSpecialCharsOrSpaces } from "@/app/utils";
import Register from "../models/Register";

const registerUserSchema = z.object({
  token: z.string().min(1),
  username: z.string().regex(regexNoSpecialCharsOrSpaces).optional(),
  account: z.string().regex(regexNoSpecialCharsOrSpaces).optional(),
  databaseName: z.string().regex(regexNoSpecialCharsOrSpaces).optional(),
});

export async function POST(req: NextRequest) {
  await db();
  const { searchParams } = new URL(req.url);
  const locale = searchParams.get("locale");
  const t = await getTranslations({ locale });

  const body = await req.json();
  const validation = registerUserSchema.safeParse(body);
  if (!validation.success)
    return Response.json(
      { ...body, error: t("validationMessage.form.invalid") },
      { status: 400 }
    );

  try {
    const existingRegister = await Register.findById(body.token);
    if (existingRegister) {
      if (!!body.username) {
        existingRegister.username = body.username;
      }
      if (!!body.account) {
        existingRegister.account = body.account;
      }
      if (!!body.databaseName) {
        existingRegister.databaseName = body.databaseName;
      }
      await existingRegister.save();
      return Response.json(existingRegister, { status: 200 });
    }
  } catch (err: any) {
    return Response.json({ ...body, error: err.message }, { status: 400 });
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
  const t = await getTranslations({ locale });

  const body = await req.json();
  const validation = checkTokenSchema.safeParse(body);
  if (!validation.success)
    return Response.json(
      { ...body, error: t("validationMessage.form.invalid") },
      { status: 400 }
    );
}
