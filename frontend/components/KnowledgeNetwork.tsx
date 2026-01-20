'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import type { ForceGraphMethods, NodeObject, LinkObject } from 'react-force-graph-2d';
import { getNetworkGraph } from '@/lib/api/network';
import type { NetworkGraphData, NetworkNode } from '@/types/network';

// react-force-graph-2dを動的インポート（SSR回避）
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-gray-400">グラフを読み込み中...</div>
    </div>
  ),
});

// 配色定義
const COLORS = {
  bg: '#FFFFFF',
  genreLevel1: '#1E3A8A',
  genreLevel2: '#1D4ED8',
  genreLevel3: '#3B82F6',
  genreLevel4: '#60A5FA',
  genreLevel5: '#93C5FD',
  documentNode: '#6B7280',
  genreLink: '#1E40AF',
  docLink: '#D1D5DB',
  text: '#111827',
  highlight: '#3B82F6',
  hoverBg: '#FFFFFF',
};

const getGenreColor = (level?: number): string => {
  switch (level) {
    case 1: return COLORS.genreLevel1;
    case 2: return COLORS.genreLevel2;
    case 3: return COLORS.genreLevel3;
    case 4: return COLORS.genreLevel4;
    case 5: return COLORS.genreLevel5;
    default: return COLORS.genreLevel3;
  }
};

interface KnowledgeNetworkProps {
  genreId?: number;
  includeInactive?: boolean;
  onGenreSelect?: (genreId: number | null) => void;
}

export default function KnowledgeNetwork({
  genreId,
  includeInactive = false,
  onGenreSelect,
}: KnowledgeNetworkProps) {
  const router = useRouter();
  const fgRef = useRef<ForceGraphMethods>();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [graphData, setGraphData] = useState<NetworkGraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [highlightNodes, setHighlightNodes] = useState(new Set<string>());
  const [highlightLinks, setHighlightLinks] = useState(new Set<string>());
  const [hoverNode, setHoverNode] = useState<NetworkNode | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isSimulationComplete, setIsSimulationComplete] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const hasConfiguredForces = useRef(false);

  // コンテナサイズを取得・監視
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };
    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    window.addEventListener('resize', updateDimensions);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // データ取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setIsSimulationComplete(false);
        hasConfiguredForces.current = false;
        const data = await getNetworkGraph({ genreId, includeInactive });
        setGraphData(data);
        setError(null);
        setIsInitialLoad(genreId === undefined);
      } catch (err) {
        setError('ネットワークグラフの読み込みに失敗しました');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [genreId, includeInactive]);

  // D3-forceの中心力を設定
  useEffect(() => {
    if (fgRef.current && graphData.nodes.length > 0 && !hasConfiguredForces.current) {
      const fg = fgRef.current;
      graphData.nodes.forEach((node: any) => {
        const spreadRadius = Math.min(dimensions.width, dimensions.height) * 0.35;
        node.x = (Math.random() - 0.5) * spreadRadius;
        node.y = (Math.random() - 0.5) * spreadRadius;
        node.vx = 0;
        node.vy = 0;
      });
      fg.d3Force('center', fg.d3Force('center')?.strength(0.05));
      fg.d3Force('charge', fg.d3Force('charge')?.strength(-100));
      fg.zoom(1.5, 0);
      fg.centerAt(0, 0, 0);
      hasConfiguredForces.current = true;
    }
  }, [graphData.nodes, dimensions.width, dimensions.height]);

  const handleZoomToFit = useCallback(() => {
    if (fgRef.current && graphData.nodes.length > 0) {
      fgRef.current.zoomToFit(400, 150);
    }
  }, [graphData.nodes.length]);

  const handleEngineStop = useCallback(() => {
    if (!isSimulationComplete) {
      setIsSimulationComplete(true);
    }
  }, [isSimulationComplete]);

  // ノードクリック処理
  const handleNodeClick = useCallback(
    (node: NodeObject) => {
      const n = node as NetworkNode;
      if (n.type === 'document' && n.document_id) {
        // ドキュメント詳細へ遷移
        router.push(`/documents/${n.document_id}`);
      } else if (n.type === 'genre' && n.genre_id) {
        // ジャンルフィルタを適用（親コンポーネントに通知）
        if (onGenreSelect) {
          onGenreSelect(n.genre_id);
        }
      }
    },
    [router, onGenreSelect]
  );

  // ノードホバー処理
  const handleNodeHover = useCallback((node: NodeObject | null) => {
    if (!node) {
      setHighlightNodes(new Set());
      setHighlightLinks(new Set());
      setHoverNode(null);
      return;
    }
    const n = node as NetworkNode;
    setHoverNode(n);
    const nodes = new Set<string>([n.id]);
    const links = new Set<string>();
    graphData.links.forEach((link) => {
      if (link.source === n.id || link.target === n.id) {
        links.add(`${link.source}-${link.target}`);
        nodes.add(typeof link.source === 'string' ? link.source : (link.source as any).id);
        nodes.add(typeof link.target === 'string' ? link.target : (link.target as any).id);
      }
    });
    setHighlightNodes(nodes);
    setHighlightLinks(links);
  }, [graphData.links]);

  // ノード描画
  const paintNode = useCallback(
    (node: NodeObject, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const n = node as NetworkNode;
      const isHighlight = highlightNodes.has(n.id);
      const isHover = hoverNode?.id === n.id;
      let radius: number;
      if (n.type === 'genre') {
        const docCount = n.document_count || 0;
        radius = Math.min(14, 4 + Math.sqrt(docCount) * 1.5);
      } else {
        radius = 4;
      }
      const nodeColor = n.type === 'genre' ? getGenreColor(n.level) : COLORS.documentNode;
      const finalColor = isHighlight || isHover ? COLORS.highlight : nodeColor;
      ctx.beginPath();
      ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI);
      ctx.fillStyle = finalColor;
      ctx.fill();
      if (isHighlight || isHover) {
        ctx.strokeStyle = COLORS.highlight;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      let shouldShowLabel = false;
      if (n.type === 'genre') {
        if (n.level === 1) {
          shouldShowLabel = true;
        } else {
          shouldShowLabel = globalScale >= 1.5 || isHighlight || isHover;
        }
      } else {
        shouldShowLabel = globalScale >= 1.5 || isHighlight || isHover;
      }
      if (shouldShowLabel) {
        ctx.font = `${12 / globalScale}px Sans-Serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = COLORS.text;
        ctx.fillText(n.label, node.x!, node.y! + radius + 8 / globalScale);
      }
    },
    [highlightNodes, hoverNode]
  );

  // リンク描画
  const paintLink = useCallback(
    (link: LinkObject, ctx: CanvasRenderingContext2D) => {
      const l = link as any;
      const isHighlight = highlightLinks.has(`${l.source.id}-${l.target.id}`);
      const linkColor = l.type === 'genre_hierarchy' ? COLORS.genreLink : COLORS.docLink;
      ctx.strokeStyle = isHighlight ? COLORS.highlight : linkColor;
      ctx.lineWidth = isHighlight ? 2 : 1;
      ctx.globalAlpha = isHighlight ? 1 : 0.3;
      ctx.beginPath();
      ctx.moveTo(l.source.x, l.source.y);
      ctx.lineTo(l.target.x, l.target.y);
      ctx.stroke();
      ctx.globalAlpha = 1;
    },
    [highlightLinks]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-slate-600">グラフを読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full bg-white">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={handleZoomToFit}
          className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 text-sm rounded-md hover:bg-slate-200 transition-colors border border-slate-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
          全体表示
        </button>
      </div>
      {hoverNode && (
        <div className="absolute top-4 left-4 z-10 bg-white p-3 rounded-md shadow-lg border border-slate-200">
          <div className="text-slate-900 font-medium text-sm">{hoverNode.label}</div>
          {hoverNode.type === 'genre' ? (
            <div className="text-slate-600 text-xs mt-1">
              {hoverNode.document_count || 0}件のナレッジ
            </div>
          ) : (
            <div className="text-slate-600 text-xs mt-2 space-y-1">
              <div>閲覧: {hoverNode.view_count}回</div>
              <div>役立った: {hoverNode.helpful_count}回</div>
            </div>
          )}
        </div>
      )}
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor={COLORS.bg}
        nodeId="id"
        nodeCanvasObject={paintNode}
        linkCanvasObject={paintLink}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        onEngineStop={handleEngineStop}
        cooldownTime={2000}
        d3AlphaDecay={0.0228}
        d3VelocityDecay={0.4}
        d3AlphaMin={0.001}
        warmupTicks={0}
        enableZoomInteraction={true}
        enablePanInteraction={true}
      />
    </div>
  );
}