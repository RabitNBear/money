import JsonLd, { getWebsiteJsonLd, getOrganizationJsonLd } from '@/components/JsonLd';
import HomeClient from './HomeClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ggurlmoosae.com';

export default function Home() {
  return (
    <>
      <JsonLd data={getWebsiteJsonLd(SITE_URL)} />
      <JsonLd data={getOrganizationJsonLd(SITE_URL)} />
      <HomeClient />
    </>
  );
}
