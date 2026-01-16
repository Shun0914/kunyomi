import KnowledgeDetail from '@/components/KnowledgeDetail';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <KnowledgeDetail id={id} />;
}
