import { buildMetadata } from '@/lib/site-config';
import { HomePageClient } from './home-page-client';

export const metadata = buildMetadata({
  title: 'North Carolina approval workflows, comments, and resubmittals',
  description:
    'EntitleFlow NC helps architecture and civil firms manage reviewer comments, resubmittals, and approval workflow visibility across North Carolina jurisdictions.',
  path: '/',
});

export default function HomePage() {
  return <HomePageClient />;
}
