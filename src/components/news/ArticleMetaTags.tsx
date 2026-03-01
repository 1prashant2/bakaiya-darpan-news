import { Helmet } from 'react-helmet-async';

interface ArticleMetaTagsProps {
  title: string;
  description: string;
  imageUrl?: string | null;
  url: string;
  author?: string;
  publishedAt?: string;
}

export function ArticleMetaTags({
  title,
  description,
  imageUrl,
  url,
  author,
  publishedAt,
}: ArticleMetaTagsProps) {
  const truncatedDesc = description.length > 150 ? description.slice(0, 147) + '...' : description;

  return (
    <Helmet>
      <title>{title} | प्रेस दर्पण</title>
      <meta name="description" content={truncatedDesc} />

      {/* Open Graph */}
      <meta property="og:type" content="article" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={truncatedDesc} />
      <meta property="og:url" content={url} />
      {imageUrl && <meta property="og:image" content={imageUrl} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={truncatedDesc} />
      {imageUrl && <meta name="twitter:image" content={imageUrl} />}

      {/* Article meta */}
      {author && <meta property="article:author" content={author} />}
      {publishedAt && <meta property="article:published_time" content={publishedAt} />}
    </Helmet>
  );
}
