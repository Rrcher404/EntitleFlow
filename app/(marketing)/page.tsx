import { buildMetadata } from '@/lib/site-config';
import { HomePageClient } from './home-page-client';

export const metadata = buildMetadata({
  title: 'Cut redline chaos. Ship the resubmittal clean.',
  description:
    'Drop a reviewer redline PDF. EntitleFlow turns it into a structured, assignable comment list in under two minutes — then tracks the response until the resubmittal ships.',
  path: '/',
});

export default function HomePage() {
  return <HomePageClient />;
}
