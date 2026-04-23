import { buildMetadata } from '@/lib/site-config';
import { ProductPageClient } from './product-page-client';

export const metadata = buildMetadata({
  title: 'Redline parsing and response tracking for AEC teams',
  description:
    'Two modules, one workspace. EntitleFlow parses reviewer redline PDFs into structured comments and tracks every response through to the resubmittal.',
  path: '/product',
});

export default function ProductPage() {
  return <ProductPageClient />;
}
