import { useEffect, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Document, DocumentRelation } from '../types/knowledge';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface KnowledgeNetworkProps {
  documents: Document[];
  relations: DocumentRelation[];
  onNodeClick?: (document: Document) => void;
}

interface GraphNode {
  id: number;
  name: string;
  val: number;
  color: string;
}

interface GraphLink {
  source: number;
  target: number;
  type: string;
}

export function KnowledgeNetwork({ documents, relations, onNodeClick }: KnowledgeNetworkProps) {
  const fgRef = useRef<any>();
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; links: GraphLink[] }>({
    nodes: [],
    links: [],
  });

  useEffect(() => {
    // ドキュメントをノードに変換
    const nodes: GraphNode[] = documents.map((doc) => ({
      id: doc.id,
      name: doc.title,
      val: doc.helpful_count + 5, // ノードのサイズを評価数に応じて調整
      color: getColorByScore(doc.helpfulness_score),
    }));

    // 関係をリンクに変換
    const links: GraphLink[] = relations
      .filter(
        (rel) =>
          documents.some((d) => d.id === rel.source_document_id) &&
          documents.some((d) => d.id === rel.target_document_id)
      )
      .map((rel) => ({
        source: rel.source_document_id,
        target: rel.target_document_id,
        type: rel.relation_type,
      }));

    setGraphData({ nodes, links });
  }, [documents, relations]);

  const getColorByScore = (score: number): string => {
    if (score >= 4.5) return '#10b981'; // 緑 - 高評価
    if (score >= 4.0) return '#3b82f6'; // 青 - 良好
    if (score >= 3.5) return '#f59e0b'; // オレンジ - 普通
    return '#ef4444'; // 赤 - 低評価
  };

  const handleNodeClick = (node: any) => {
    const doc = documents.find((d) => d.id === node.id);
    if (doc && onNodeClick) {
      onNodeClick(doc);
    }
  };

  const handleZoomIn = () => {
    if (fgRef.current) {
      fgRef.current.zoom(fgRef.current.zoom() * 1.2);
    }
  };

  const handleZoomOut = () => {
    if (fgRef.current) {
      fgRef.current.zoom(fgRef.current.zoom() / 1.2);
    }
  };

  const handleFitView = () => {
    if (fgRef.current) {
      fgRef.current.zoomToFit(400);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>ナレッジネットワーク</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleZoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleZoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleFitView}>
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          ナレッジ間の関連性を視覚化しています。ノードをクリックして詳細を表示できます。
        </p>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <ForceGraph2D
            ref={fgRef}
            graphData={graphData}
            nodeLabel="name"
            nodeColor="color"
            nodeVal="val"
            linkDirectionalArrowLength={6}
            linkDirectionalArrowRelPos={1}
            linkCurvature={0.2}
            onNodeClick={handleNodeClick}
            width={800}
            height={600}
            backgroundColor="#ffffff"
          />
        </div>
        <div className="mt-4 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span>高評価 (4.5+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span>良好 (4.0+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
            <span>普通 (3.5+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span>要改善 (3.5未満)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
