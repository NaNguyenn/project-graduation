import { HomeForm, SelectLocalization } from "../components";

export default function HomePage() {
  return (
    <main className="min-h-screen flex-col flex-center bg-black">
      <div className="p-32px bg-white rounded-8 flex-col">
        <HomeForm />
      </div>
    </main>
  );
}
