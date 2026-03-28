import { buildMetadata } from '@/lib/site-config';
import { ProductPageClient } from './product-page-client';

export const metadata = buildMetadata({
  title: 'Development approval operations software for North Carolina',
  description:
    'EntitleFlow NC combines jurisdiction intelligence, reviewer comment management, resubmittal coordination, and approval visibility for regional teams.',
  path: '/product',
});

export default function ProductPage() {
  return <ProductPageClient />;
}
