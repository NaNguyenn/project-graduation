import { getTranslations } from "next-intl/server";
import { NextRequest } from "next/server";
import { z } from "zod";
import db from "../db";
import Register, { RegisterType } from "../models/Register";
import { Resend } from "resend";
import { generateUniqueToken } from "@/app/utils";

const schema = z.object({
  email: z.string().min(1).email(),
});

const env = process.env.NODE_ENV;
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
const resend = new Resend(process.env.RESEND_API_KEY);
const senderEmail = process.env.RESEND_SENDER_EMAIL;

export async function POST(req: NextRequest) {
  await db();
  const isDevMode = env === "development";
  const { searchParams } = new URL(req.url);
  const locale = searchParams.get("locale");
  const t = await getTranslations({ locale });

  if (!schema.safeParse({ email: senderEmail }).success) {
    return Response.json(
      { message: t(isDevMode ? "error.senderInvalid" : "error.system") },
      { status: 500 }
    );
  }

  const body = await req.json();
  const validation = schema.safeParse(body);
  if (!validation.success)
    return Response.json(
      { message: t("validationMessage.form.invalid") },
      { status: 400 }
    );

  try {
    const existingRegister = await Register.findOne({ email: body.email });
    const expiryDate = new Date(Date.now() + 60 * 60 * 1000).valueOf();
    let register: RegisterType;
    let token: string;

    if (
      existingRegister &&
      new Date().valueOf() <= existingRegister.expiryDate
    ) {
      return Response.json({ message: t("pleaseCheckInbox") }, { status: 400 });
    }

    if (existingRegister) {
      token = generateUniqueToken();
      existingRegister.expiryDate = expiryDate;
      existingRegister.token = token;
      register = existingRegister;
    } else {
      token = generateUniqueToken();
      register = new Register({
        email: body.email,
        expiryDate,
        token,
      });
    }

    const url = `${baseUrl}/${locale}/register?email=${register.email}&expirydate=${register.expiryDate}&token=${token}`;

    const { data, error } = await resend.emails.send({
      // from: isDevMode ? "Acme <onboarding@resend.dev>" : senderEmail || "",
      // to: isDevMode ? senderEmail : body.email,
      from: "Acme <onboarding@resend.dev>",
      to: senderEmail || "",
      subject: `${t("email.subject")}`,
      html: `<p>${t("email.body")} <a href='${url}'>${url}</a></p>`,
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    try {
      await register.save();
    } catch (error) {
      return Response.json(
        { message: isDevMode ? error : t("error.system") },
        { status: 500 }
      );
    }

    return Response.json(body, { status: 200 });
  } catch (err: any) {
    return Response.json({ message: err.message }, { status: 400 });
  }
}
