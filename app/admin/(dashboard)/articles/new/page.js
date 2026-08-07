import Link from 'next/link';
import ArticleForm from '@/components/admin/ArticleForm';
import { createArticle } from '../actions';

export default function NewArticlePage() {
  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display font-bold text-2xl">Nouvel article</h1>
        <Link href="/admin/articles" className="text-xs text-dim hover:text-accent">
          ← Retour aux articles
        </Link>
      </div>

      <ArticleForm action={createArticle} submitLabel="Créer l'article" />
    </>
  );
}
