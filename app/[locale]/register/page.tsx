import { SelectLocalization, HomeForm } from "@/app/components";
import { RegisterForm } from "./components";

type Props = {
  searchParams: { email: string; expiryDate: string; token: string };
};

export default function RegisterPage({
  searchParams: { email, expiryDate, token },
}: Props) {
  console.log("🚀 ~ token:", token);
  console.log("🚀 ~ expiryDate:", expiryDate);
  console.log("🚀 ~ email:", email);

  return (
    <main className="min-h-screen flex-col flex-center bg-black">
      <SelectLocalization />
      <div className="p-32px bg-white rounded-8 flex-col">
        <RegisterForm email={email} />
      </div>
    </main>
  );
}
