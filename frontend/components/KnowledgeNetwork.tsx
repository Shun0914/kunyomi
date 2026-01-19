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

// 配色定義（画像の青・グレー系、レベルによる色分け）
const COLORS = {
  bg: '#FFFFFF', // 背景（白）
  // ジャンルノード（レベルによる色分け：紺 → 青 → 明るい青）
  genreLevel1: '#1E3A8A', // Lv1: 紺
  genreLevel2: '#1D4ED8', // Lv2: 濃い青
  genreLevel3: '#3B82F6', // Lv3: 青
  genreLevel4: '#60A5FA', // Lv4: 明るい青
  genreLevel5: '#93C5FD', // Lv5: 最も明るい青
  documentNode: '#6B7280', // ドキュメントノード（グレー）
  genreLink: '#1E40AF', // ジャンル階層リンク（濃い青）
  docLink: '#D1D5DB', // ドキュメントリンク（薄いグレー）
  text: '#111827', // テキスト（濃いグレー）
  highlight: '#3B82F6', // ハイライト（青）
  hoverBg: '#FFFFFF', // ホバー背景（白）
};

// ジャンルレベルに応じた色を取得
const getGenreColor = (level?: number): string => {
  switch (level) {
    case 1:
      return COLORS.genreLevel1;
    case 2:
      return COLORS.genreLevel2;
    case 3:
      return COLORS.genreLevel3;
    case 4:
      return COLORS.genreLevel4;
    case 5:
      return COLORS.genreLevel5;
    default:
      return COLORS.genreLevel3; // デフォルトは青
  }
};

interface KnowledgeNetworkProps {
  genreId?: number;
  includeInactive?: boolean;
}

export default function KnowledgeNetwork({
  genreId,
  includeInactive = false,
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
  const [isInitialLoad, setIsInitialLoad] = useState(true); // 初回ロードフラグ
  const hasConfiguredForces = useRef(false); // 力の設定フラグ

  // コンテナサイズを取得・監視
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    // 初期サイズ取得
    updateDimensions();

    // ResizeObserverで監視
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // ウィンドウリサイズも監視
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
        hasConfiguredForces.current = false; // リセット
        const data = await getNetworkGraph({ genreId, includeInactive });
        setGraphData(data);
        setError(null);
        
        // 初回ロードフラグをセット（ジャンル選択時はfalse）
        if (genreId === undefined) {
          setIsInitialLoad(true);
        } else {
          setIsInitialLoad(false);
        }
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
      
      // ノードの初期位置をCanvas内にランダム配置
      graphData.nodes.forEach((node: any) => {
        const spreadRadius = Math.min(dimensions.width, dimensions.height) * 0.35;
        node.x = (Math.random() - 0.5) * spreadRadius;
        node.y = (Math.random() - 0.5) * spreadRadius;
        node.vx = 0;
        node.vy = 0;
      });
      
      // center力を追加（ノードを中心(0,0)に引き寄せる）
      fg.d3Force('center', fg.d3Force('center')?.strength(0.05));
      
      // charge力を調整（ノード間の反発力）
      fg.d3Force('charge', fg.d3Force('charge')?.strength(-100));
      
      // 初期ズームレベルを設定（固定）
      fg.zoom(1.5, 0);
      fg.centerAt(0, 0, 0);
      
      hasConfiguredForces.current = true;
      console.log('D3-force設定完了 - 初期配置を Canvas内にランダム生成');
    }
  }, [graphData.nodes, dimensions.width, dimensions.height]);

  // グラフをフィット（中央配置）
  const handleZoomToFit = useCallback(() => {
    if (fgRef.current && graphData.nodes.length > 0) {
      // パディング150pxで全体表示
      fgRef.current.zoomToFit(400, 150);
    }
  }, [graphData.nodes.length]);

  // シミュレーション完了時の処理
  const handleEngineStop = useCallback(() => {
    if (!isSimulationComplete) {
      console.log('シミュレーション完了', { isInitialLoad, genreId });
      setIsSimulationComplete(true);
      
      // 初回ロード時は視点を固定（zoomToFitしない）
      // ジャンル選択時も現在のズームレベルを維持
      // 全体表示はユーザーが手動でボタンを押した時のみ
      console.log('視点固定 - 自然な配置完了');
    }
  }, [isSimulationComplete, isInitialLoad, genreId]);

  // ノードクリック処理
  const handleNodeClick = useCallback(
    (node: NodeObject) => {
      const n = node as NetworkNode;
      if (n.type === 'document' && n.document_id) {
        // ドキュメント詳細へ遷移
        router.push(`/documents/${n.document_id}`);
      } else if (n.type === 'genre' && n.genre_id) {
        // ジャンルフィルタを適用（例: ジャンル別一覧へ）
        router.push(`/document-list?genre=${n.genre_id}`);
      }
    },
    [router]
  );

  // ノードホバー処理（関連ノード・リンクをハイライト）
  const handleNodeHover = useCallback((node: NodeObject | null) => {
    if (!node) {
      setHighlightNodes(new Set());
      setHighlightLinks(new Set());
      setHoverNode(null);
      return;
    }

    const n = node as NetworkNode;
    setHoverNode(n);

    // 関連ノード・リンクを抽出
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

  // ノード描画カスタマイズ
  const paintNode = useCallback(
    (node: NodeObject, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const n = node as NetworkNode;
      const isHighlight = highlightNodes.has(n.id);
      const isHover = hoverNode?.id === n.id;

      // ノード円の半径を計算
      let radius: number;
      if (n.type === 'genre') {
        // ジャンルノード: ドキュメント数に応じてサイズを変更
        const docCount = n.document_count || 0;
        // 平方根スケールで滑らかに拡大（最小4、最大14）
        radius = Math.min(14, 4 + Math.sqrt(docCount) * 1.5);
      } else {
        // ドキュメントノード: 固定サイズ
        radius = 4;
      }
      
      // ノード色（ジャンルはレベルに応じて色分け）
      const nodeColor = n.type === 'genre' 
        ? getGenreColor(n.level) 
        : COLORS.documentNode;
      const finalColor = isHighlight || isHover ? COLORS.highlight : nodeColor;

      // 円描画
      ctx.beginPath();
      ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI);
      ctx.fillStyle = finalColor;
      ctx.fill();

      // ハイライト時は外枠追加
      if (isHighlight || isHover) {
        ctx.strokeStyle = COLORS.highlight;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // ラベル描画条件
      let shouldShowLabel = false;
      
      if (n.type === 'genre') {
        // ジャンルLv1は常に表示、Lv2以降はズーム時またはハイライト時のみ
        if (n.level === 1) {
          shouldShowLabel = true;
        } else {
          shouldShowLabel = globalScale >= 1.5 || isHighlight || isHover;
        }
      } else {
        // ドキュメントはズーム時またはハイライト時のみ
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

  // リンク描画カスタマイズ
  const paintLink = useCallback(
    (link: LinkObject, ctx: CanvasRenderingContext2D) => {
      const l = link as any;
      const isHighlight = highlightLinks.has(`${l.source.id}-${l.target.id}`);

      // リンク色・太さ
      const linkColor = l.type === 'genre_hierarchy' ? COLORS.genreLink : COLORS.docLink;
      ctx.strokeStyle = isHighlight ? COLORS.highlight : linkColor;
      ctx.lineWidth = isHighlight ? 2 : 1;
      ctx.globalAlpha = isHighlight ? 1 : 0.3; // 非ハイライト時はより薄く

      // 線描画
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
      {/* コントロールボタン */}
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

      {/* ホバー情報 */}
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

      {/* グラフ本体 */}
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
        // cooldownTicks={30}
        enableZoomInteraction={true}
        enablePanInteraction={true}
      />
    </div>
  );
}