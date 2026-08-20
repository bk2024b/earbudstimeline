import NewsletterComposer from '@/components/admin/NewsletterComposer';
import { getSubscriberCount } from '../actions';

export default async function NewNewsletterPage({ searchParams }) {
  const params = await searchParams;
  const subscriberCount = await getSubscriberCount();

  return <NewsletterComposer subscriberCount={subscriberCount} error={params?.error} />;
}
