import { getTranslations } from "next-intl/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "../db";
import { regexNoSpecialCharsOrSpaces } from "@/app/utils";
import User, { UserType } from "../models/User";

const schema = z.object({
  email: z.string().min(1).email(),
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
  const validation = schema.safeParse(body);
  if (!validation.success)
    return NextResponse.json(
      { ...body, error: t("validationMessage.form.invalid") },
      { status: 400 }
    );

  try {
    const res: UserType = await User.create({
      email: body.email,
      username: body.username,
      account: body.account,
      databaseName: body.databaseName,
    });
    return NextResponse.json(res, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ ...body, error: err.message }, { status: 400 });
  }
}
