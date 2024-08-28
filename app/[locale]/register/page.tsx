import { RegisterForm, RegisterFormProps } from "./components";

type Props = {
  searchParams: RegisterFormProps;
};

export default async function RegisterPage({ searchParams }: Props) {
  return (
    <main className="min-h-screen flex-col flex-center bg-black">
      <RegisterForm {...searchParams} />
    </main>
  );
}
