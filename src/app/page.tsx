import DoughMasterApp from '@/components/doughmaster-app';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground p-4 md:p-8 flex flex-col items-center selection:bg-primary/30">
      <DoughMasterApp />
    </main>
  );
}
