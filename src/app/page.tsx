// app/page.tsx
import dynamic from 'next/dynamic';

const SolanaSwapWithProvider = dynamic(
  () => import('@/components/swap/SolanaSwap'),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <SolanaSwapWithProvider />
    </main>
  );
}
