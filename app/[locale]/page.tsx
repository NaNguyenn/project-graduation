import { useTranslations } from "next-intl";
import { SelectLocalization } from "../components";

export default function Home() {
  const t = useTranslations("Index");

  return (
    <main className="min-h-screen flex-col flex-center bg-black">
      <SelectLocalization />
      <div className="p-32px bg-white rounded-8 flex-col">{t("title")}</div>
    </main>
  );
}
