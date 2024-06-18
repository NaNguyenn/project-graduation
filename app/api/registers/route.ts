import { getTranslations } from "next-intl/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "../db";
import Register from "../models/Register";
import { randomBytes } from "crypto";

const schema = z.object({
  email: z.string().min(1).email(),
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
    const token = randomBytes(32).toString("hex");
    const expiryDate = new Date(Date.now() + 60 * 60 * 1000);
    Register.create({
      email: body.email,
      expiryDate: expiryDate.toISOString(),
      token,
    });
    return NextResponse.json(body, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ ...body, error: err.message }, { status: 400 });
  }
}
