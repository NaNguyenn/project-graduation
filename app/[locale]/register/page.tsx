import { RegisterForm, RegisterFormProps } from "./components";

type Props = {
  searchParams: RegisterFormProps;
};

export default async function RegisterPage({ searchParams }: Props) {
  return (
    <main className="min-h-screen flex-col flex-center bg-black">
      <div className="p-32px bg-white rounded-8 flex-col">
        <RegisterForm {...searchParams} />
      </div>
    </main>
  );
}
