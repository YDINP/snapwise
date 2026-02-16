import { getAllCards } from '@/lib/content';
import CardFeed from '@/components/feed/CardFeed';
import CategoryBar from '@/components/navigation/CategoryBar';

export default function HomePage() {
  const allCards = getAllCards();

  return (
    <main className="relative h-screen overflow-hidden">
      <CategoryBar currentCategory={undefined} />
      <CardFeed cards={allCards} />
    </main>
  );
}
