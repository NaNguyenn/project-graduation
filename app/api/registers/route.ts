import { getTranslations } from "next-intl/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "../db";
import Register, { RegisterType } from "../models/Register";

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
    const existingRegister = await Register.findOne({ email: body.email });
    const currentDate = new Date();
    if (existingRegister) {
      if (currentDate <= new Date(existingRegister.expiryDate)) {
        return NextResponse.json(
          { ...body, error: t("validationMessage.form.invalid") },
          { status: 400 }
        );
      }
      const newExpiryDate = new Date(Date.now() + 60 * 60 * 1000);
      existingRegister.expiryDate = newExpiryDate.toISOString();
      await existingRegister.save();
      return NextResponse.json(existingRegister, { status: 200 });
    }

    const expiryDate = new Date(Date.now() + 60 * 60 * 1000);
    const res: RegisterType = await Register.create({
      email: body.email,
      expiryDate: expiryDate.toISOString(),
    });
    return NextResponse.json(res, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ ...body, error: err.message }, { status: 400 });
  }
}
