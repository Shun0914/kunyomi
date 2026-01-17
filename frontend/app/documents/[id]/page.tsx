import DocumentDetailClient from './DocumentDetailClient';

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = params instanceof Promise ? await params : params;
  return <DocumentDetailClient id={resolvedParams.id} />;
}
