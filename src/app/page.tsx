import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="max-w-md w-full rounded-xl bg-white p-8 shadow">
        <h1 className="text-2xl font-semibold">LOCPEL</h1>
        <p className="text-slate-600 mt-2">
          Sistema operacional MVP para lançamentos de horímetro, serviços e abastecimentos.
        </p>
        <Link
          className="mt-6 inline-flex items-center justify-center bg-slate-900 text-white"
          href="/login"
        >
          Acessar
        </Link>
      </div>
    </main>
  );
}
