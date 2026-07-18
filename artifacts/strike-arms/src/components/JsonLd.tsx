import { Helmet } from 'react-helmet-async';

import type { JsonLdObject } from '@/lib/structured-data';

interface JsonLdProps {
  data: JsonLdObject | JsonLdObject[];
}

/** Injects a Schema.org JSON-LD <script> into the document head. */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
}
