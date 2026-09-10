import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import ForceGraph2D from "react-force-graph-2d";

import {
  Minus,
  Plus,
  RotateCcw,
  Maximize2,
  Network,
} from "lucide-react";

import { investigationGraph } from "../data/graphData";
import { filterGraph } from "../utils/graphUtils";

/* ==================================================
   RELATIONSHIP COLORS
================================================== */

const RELATIONSHIP_COLORS = {
  DIRECTOR_OF: "#2dd4bf",
  REGISTERED_AT: "#fb7185",
  LOCATED_AT: "#fb7185",
  OWNS: "#c084fc",
  USES: "#38bdf8",
  ASSOCIATED_WITH: "#f59e0b",
  CALLED: "#06b6d4",
  TRANSACTED_WITH: "#a855f7",
  KNOWS: "#64748b",
};

/* ==================================================
   ENTITY COLORS
================================================== */

const ENTITY_COLORS = {
  person: "#38bdf8",
  phone: "#34d399",
  account: "#c084fc",
  vehicle: "#fb923c",
  company: "#2dd4bf",
  address: "#fb7185",
};

/* ==================================================
   HELPERS
================================================== */

function getNodeId(value) {
  return typeof value === "object"
    ? value?.id
    : value;
}

function getNodeName(node) {
  return (
    node?.canonical_name ||
    node?.name ||
    node?.label ||
    node?.id ||
    "Unknown entity"
  );
}

function getNodeType(node) {
  return String(
    node?.entity_type ||
    node?.type ||
    ""
  ).toLowerCase();
}

function getRelationshipColor(relationship) {
  return (
    RELATIONSHIP_COLORS[
    relationship
    ] || "#94a3b8"
  );
}

function getEntityColor(type) {
  return (
    ENTITY_COLORS[type] ||
    "#94a3b8"
  );
}

/* ==================================================
   SMALL ENTITY ICONS
================================================== */

function drawEntityIcon(
  ctx,
  type,
  x,
  y,
  globalScale
) {
  const scale = Math.max(
    globalScale,
    0.45
  );

  ctx.save();

  ctx.translate(x, y);
  ctx.scale(1.05, 1.05);

  ctx.strokeStyle =
    getEntityColor(type);

  ctx.lineWidth =
    1.2 / scale;

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  /* PERSON */

  if (type === "person") {
    ctx.beginPath();

    ctx.arc(
      0,
      -2.4 / scale,
      1.7 / scale,
      0,
      Math.PI * 2
    );

    ctx.stroke();

    ctx.beginPath();

    ctx.arc(
      0,
      3.1 / scale,
      3.1 / scale,
      Math.PI,
      0
    );

    ctx.stroke();
  }

  /* PHONE */

  else if (type === "phone") {
    ctx.beginPath();

    ctx.roundRect(
      -2.6 / scale,
      -4.4 / scale,
      5.2 / scale,
      8.8 / scale,
      1 / scale
    );

    ctx.stroke();

    ctx.beginPath();

    ctx.arc(
      0,
      2.8 / scale,
      0.45 / scale,
      0,
      Math.PI * 2
    );

    ctx.stroke();
  }

  /* ACCOUNT */

  else if (type === "account") {
    ctx.beginPath();

    ctx.roundRect(
      -5 / scale,
      -3.2 / scale,
      10 / scale,
      6.4 / scale,
      1 / scale
    );

    ctx.stroke();

    ctx.beginPath();

    ctx.moveTo(
      -3.5 / scale,
      -0.4 / scale
    );

    ctx.lineTo(
      3.5 / scale,
      -0.4 / scale
    );

    ctx.stroke();
  }

  /* VEHICLE */

  else if (type === "vehicle") {
    ctx.beginPath();

    ctx.moveTo(
      -5 / scale,
      2 / scale
    );

    ctx.lineTo(
      -3.5 / scale,
      -2 / scale
    );

    ctx.lineTo(
      -1.7 / scale,
      -3.4 / scale
    );

    ctx.lineTo(
      2.4 / scale,
      -3.4 / scale
    );

    ctx.lineTo(
      5 / scale,
      2 / scale
    );

    ctx.lineTo(
      5 / scale,
      3 / scale
    );

    ctx.lineTo(
      -5 / scale,
      3 / scale
    );

    ctx.closePath();

    ctx.stroke();

    ctx.beginPath();

    ctx.arc(
      -3 / scale,
      3 / scale,
      1.05 / scale,
      0,
      Math.PI * 2
    );

    ctx.arc(
      3 / scale,
      3 / scale,
      1.05 / scale,
      0,
      Math.PI * 2
    );

    ctx.stroke();
  }

  /* COMPANY */

  else if (type === "company") {
    ctx.beginPath();

    ctx.roundRect(
      -4 / scale,
      -5 / scale,
      8 / scale,
      10 / scale,
      0.7 / scale
    );

    ctx.stroke();

    ctx.beginPath();

    ctx.moveTo(
      -1.5 / scale,
      -2.7 / scale
    );

    ctx.lineTo(
      -1.5 / scale,
      2.7 / scale
    );

    ctx.moveTo(
      1.5 / scale,
      -2.7 / scale
    );

    ctx.lineTo(
      1.5 / scale,
      2.7 / scale
    );

    ctx.stroke();
  }

  /* ADDRESS */

  else if (type === "address") {
    ctx.beginPath();

    ctx.arc(
      0,
      -0.7 / scale,
      3.2 / scale,
      Math.PI,
      0
    );

    ctx.lineTo(
      0,
      4.5 / scale
    );

    ctx.closePath();

    ctx.stroke();

    ctx.beginPath();

    ctx.arc(
      0,
      -0.7 / scale,
      0.85 / scale,
      0,
      Math.PI * 2
    );

    ctx.stroke();
  }

  /* FALLBACK */

  else {
    ctx.beginPath();

    ctx.arc(
      0,
      0,
      3 / scale,
      0,
      Math.PI * 2
    );

    ctx.stroke();
  }

  ctx.restore();
}

/* ==================================================
   NETWORK GRAPH
================================================== */

function NetworkGraph({
  selectedNode,
  onNodeSelect,
  activeFilters,
  activeRelationshipFilters,
  graph = investigationGraph,
  autoFocusNode = false,
}) {
  const graphRef =
    useRef(null);

  const containerRef =
    useRef(null);

  const [
    hoveredNode,
    setHoveredNode,
  ] = useState(null);

  const [
    dimensions,
    setDimensions,
  ] = useState({
    width: 900,
    height: 620,
  });

  /* ==================================================
     DIMENSION OBSERVER
  ================================================== */

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const updateSize = () => {
      const rect =
        containerRef.current.getBoundingClientRect();

      setDimensions({
        width: Math.max(
          400,
          Math.floor(rect.width)
        ),
        height: Math.max(
          500,
          Math.floor(rect.height)
        ),
      });
    };

    updateSize();

    const observer =
      new ResizeObserver(
        updateSize
      );

    observer.observe(
      containerRef.current
    );

    return () => {
      observer.disconnect();
    };
  }, []);

  /* ==================================================
     ENTITY FILTER
  ================================================== */

  const entityFilteredGraph =
    useMemo(() => {
      return filterGraph(
        graph || investigationGraph,
        activeFilters || [
          "person",
          "phone",
          "account",
          "vehicle",
          "company",
          "address",
        ]
      );
    }, [graph, activeFilters]);

  /* ==================================================
     RELATIONSHIP FILTER
  ================================================== */

  const filteredGraph =
    useMemo(() => {
      if (
        !activeRelationshipFilters ||
        activeRelationshipFilters.length ===
        0
      ) {
        return entityFilteredGraph;
      }

      const links =
        entityFilteredGraph.links.filter(
          (link) =>
            activeRelationshipFilters.includes(
              link.relationship
            )
        );

      const nodeIds =
        new Set();

      links.forEach((link) => {
        nodeIds.add(
          getNodeId(
            link.source
          )
        );

        nodeIds.add(
          getNodeId(
            link.target
          )
        );
      });

      return {
        nodes:
          entityFilteredGraph.nodes.filter(
            (node) =>
              nodeIds.has(
                node.id
              )
          ),
        links,
      };
    }, [
      entityFilteredGraph,
      activeRelationshipFilters,
    ]);

  /* ==================================================
     SELECTED RELATIONSHIPS
  ================================================== */

  const selectedRelationships =
    useMemo(() => {
      if (!selectedNode) {
        return [];
      }

      return (
        (graph && graph.links) ||
        investigationGraph.links
      ).filter(
        (link) => {
          const sourceId =
            getNodeId(
              link.source
            );

          const targetId =
            getNodeId(
              link.target
            );

          return (
            sourceId ===
            selectedNode.id ||
            targetId ===
            selectedNode.id
          );
        }
      );
    }, [
      selectedNode,
      graph,
    ]);

  /* ==================================================
     SIMULATION FORCES
  ================================================== */

  useEffect(() => {
    if (!graphRef.current) return;

    const charge =
      graphRef.current.d3Force(
        "charge"
      );

    if (charge) {
      charge
        .strength(-340)
        .distanceMax(900);
    }

    const link =
      graphRef.current.d3Force(
        "link"
      );

    if (link) {
      link.distance(70);
    }
  }, [filteredGraph]);

  /* ==================================================
     AUTO-FOCUS
  ================================================== */

  const hasAutoFocusedInitialRef =
    useRef(false);

  const lastSelectedNodeIdRef =
    useRef(null);

  const hasFittedInitialRef =
    useRef(false);

  useEffect(() => {
    if (
      !selectedNode ||
      !graphRef.current
    ) {
      return;
    }

    if (
      !autoFocusNode &&
      !hasAutoFocusedInitialRef.current
    ) {
      hasAutoFocusedInitialRef.current =
        true;

      lastSelectedNodeIdRef.current =
        selectedNode.id;

      return;
    }

    if (
      lastSelectedNodeIdRef.current ===
      selectedNode.id
    ) {
      return;
    }

    const selId = selectedNode.id || selectedNode.entity_id;

    lastSelectedNodeIdRef.current = selId;

    hasAutoFocusedInitialRef.current =
      true;

    const targetNode =
      (
        filteredGraph.nodes || []
      ).find(
        (n) =>
          n.id === selId ||
          n.entity_id === selId
      );

    if (
      targetNode &&
      typeof targetNode.x ===
      "number" &&
      typeof targetNode.y ===
      "number" &&
      !isNaN(targetNode.x) &&
      !isNaN(targetNode.y)
    ) {
      graphRef.current.centerAt(
        targetNode.x,
        targetNode.y,
        450
      );

      graphRef.current.zoom(
        1.6,
        450
      );
    }
  }, [
    selectedNode?.id,
    autoFocusNode,
  ]);

  /* ==================================================
     ZOOM CONTROLS
  ================================================== */

  const zoomIn = () => {
    if (!graphRef.current) {
      return;
    }

    graphRef.current.zoom(
      graphRef.current.zoom() *
      1.35,
      250
    );
  };

  const zoomOut = () => {
    if (!graphRef.current) {
      return;
    }

    graphRef.current.zoom(
      graphRef.current.zoom() /
      1.35,
      250
    );
  };

  const fitGraph = () => {
    graphRef.current?.zoomToFit(
      500,
      80
    );
  };

  /* ==================================================
     BACKGROUND
  ================================================== */

  const renderBackground = (
    ctx,
    globalScale
  ) => {
    const width =
      dimensions.width;

    const height =
      dimensions.height;

    ctx.save();

    ctx.fillStyle =
      "#020817";

    ctx.fillRect(
      0,
      0,
      width,
      height
    );

    const gridSize = 52;

    ctx.strokeStyle =
      "rgba(56,189,248,.045)";

    ctx.lineWidth =
      1 /
      Math.max(
        globalScale,
        0.45
      );

    for (
      let x = -width;
      x < width * 2;
      x += gridSize
    ) {
      ctx.beginPath();

      ctx.moveTo(
        x,
        -height
      );

      ctx.lineTo(
        x,
        height * 2
      );

      ctx.stroke();
    }

    for (
      let y = -height;
      y < height * 2;
      y += gridSize
    ) {
      ctx.beginPath();

      ctx.moveTo(
        -width,
        y
      );

      ctx.lineTo(
        width * 2,
        y
      );

      ctx.stroke();
    }

    ctx.restore();
  };

  /* ==================================================
     RELATIONSHIP LABELS
  ================================================== */

  const renderLinkLabel = (
    link,
    ctx,
    globalScale
  ) => {
    if (!selectedNode) {
      return;
    }

    const sourceId =
      getNodeId(
        link.source
      );

    const targetId =
      getNodeId(
        link.target
      );

    const connected =
      sourceId ===
      selectedNode.id ||
      targetId ===
      selectedNode.id;

    if (!connected) {
      return;
    }

    if (globalScale < 0.72) {
      return;
    }

    const source =
      typeof link.source ===
        "object"
        ? link.source
        : null;

    const target =
      typeof link.target ===
        "object"
        ? link.target
        : null;

    if (!source || !target) {
      return;
    }

    const x =
      (source.x +
        target.x) /
      2;

    const y =
      (source.y +
        target.y) /
      2;

    const color =
      getRelationshipColor(
        link.relationship
      );

    const targetLinkFontSize =
      Math.min(
        13.5,
        Math.max(
          9,
          9 +
          Math.max(
            0,
            globalScale -
            0.7
          ) *
          3
        )
      );

    const fontSize =
      targetLinkFontSize /
      globalScale;

    const paddingX =
      (targetLinkFontSize *
        0.5) /
      globalScale;

    const paddingY =
      (targetLinkFontSize *
        0.28) /
      globalScale;

    ctx.save();

    ctx.font =
      `600 ${fontSize}px Inter, Arial, sans-serif`;

    const textWidth =
      ctx.measureText(
        link.relationship
      ).width;

    const boxWidth =
      textWidth +
      paddingX * 2;

    const boxHeight =
      fontSize +
      paddingY * 2;

    ctx.fillStyle =
      "rgba(2,8,23,.94)";

    ctx.strokeStyle =
      color;

    ctx.lineWidth =
      1 /
      globalScale;

    ctx.beginPath();

    if (ctx.roundRect) {
      ctx.roundRect(
        x -
        boxWidth / 2,
        y -
        boxHeight / 2,
        boxWidth,
        boxHeight,
        3 /
        globalScale
      );
    } else {
      ctx.rect(
        x -
        boxWidth / 2,
        y -
        boxHeight / 2,
        boxWidth,
        boxHeight
      );
    }

    ctx.fill();

    ctx.stroke();

    ctx.fillStyle =
      "#e2e8f0";

    ctx.textAlign =
      "center";

    ctx.textBaseline =
      "middle";

    ctx.fillText(
      link.relationship,
      x,
      y
    );

    ctx.restore();
  };

  /* ==================================================
     NODE RENDER
  ================================================== */

  const renderNode = (
    node,
    ctx,
    globalScale
  ) => {
    const isSelected =
      selectedNode?.id ===
      node.id;

    const isHovered =
      hoveredNode?.id ===
      node.id;

    const type =
      getNodeType(node);

    const color =
      getEntityColor(type);

    const scale =
      Math.max(
        globalScale,
        0.45
      );

    const screenRadius =
      isSelected
        ? 22
        : isHovered
          ? 19
          : 16;

    const radius =
      screenRadius /
      scale;

    /* SELECTED RING */

    if (isSelected) {
      ctx.save();

      ctx.beginPath();

      ctx.arc(
        node.x,
        node.y,
        radius +
        7 /
        scale,
        0,
        Math.PI * 2
      );

      ctx.strokeStyle =
        "rgba(45,212,191,.5)";

      ctx.lineWidth =
        2 /
        scale;

      ctx.stroke();

      ctx.restore();
    }

    /* NODE */

    ctx.save();

    ctx.beginPath();

    ctx.arc(
      node.x,
      node.y,
      radius,
      0,
      Math.PI * 2
    );

    ctx.fillStyle =
      "#071426";

    ctx.fill();

    ctx.strokeStyle =
      color;

    ctx.lineWidth =
      (isSelected
        ? 2.6
        : 2.0) /
      scale;

    ctx.stroke();

    ctx.restore();

    /* SMALL ICON */

    drawEntityIcon(
      ctx,
      type,
      node.x,
      node.y,
      globalScale
    );

    /* LABEL */

    const shouldShowLabel =
      isSelected ||
      isHovered ||
      globalScale >= 0.7 ||
      (type === "person" &&
        globalScale >= 0.5);

    if (!shouldShowLabel) {
      node.__labelPill = null;
      return;
    }

    const name =
      getNodeName(node);

    const targetScreenFontSize =
      Math.min(
        16.5,
        Math.max(
          10.5,
          10.5 +
          Math.max(
            0,
            globalScale -
            0.5
          ) *
          4
        )
      );

    const labelSize =
      targetScreenFontSize /
      globalScale;

    ctx.save();

    ctx.font =
      `600 ${labelSize}px Inter, Arial, sans-serif`;

    const maxLen =
      isSelected
        ? 32
        : isHovered
          ? 26
          : globalScale > 1.2
            ? 22
            : 16;

    const displayName =
      name.length > maxLen
        ? `${name.slice(
          0,
          maxLen - 1
        )}…`
        : name;

    const textWidth =
      ctx.measureText(
        displayName
      ).width;

    const paddingX =
      6 /
      globalScale;

    const paddingY =
      4 /
      globalScale;

    const pillWidth =
      textWidth +
      paddingX * 2;

    const pillHeight =
      labelSize +
      paddingY * 2;

    const pillY =
      node.y +
      radius +
      7 /
      globalScale;

    ctx.fillStyle =
      "rgba(2,8,23,.92)";

    ctx.strokeStyle =
      isSelected
        ? "rgba(45,212,191,.6)"
        : "rgba(148,163,184,.25)";

    ctx.lineWidth =
      1 /
      globalScale;

    ctx.beginPath();

    node.__labelPill = {
      x: node.x - pillWidth / 2,
      y: pillY,
      w: pillWidth,
      h: pillHeight,
    };

    if (ctx.roundRect) {
      ctx.roundRect(
        node.x -
        pillWidth / 2,
        pillY,
        pillWidth,
        pillHeight,
        4 /
        globalScale
      );
    } else {
      ctx.rect(
        node.x -
        pillWidth / 2,
        pillY,
        pillWidth,
        pillHeight
      );
    }

    ctx.fill();

    ctx.stroke();

    ctx.fillStyle =
      isSelected
        ? "#ffffff"
        : "#cbd5e1";

    ctx.textAlign =
      "center";

    ctx.textBaseline =
      "middle";

    ctx.fillText(
      displayName,
      node.x,
      pillY +
      pillHeight / 2
    );

    /* SELECTED ID */

    if (
      isSelected &&
      globalScale > 0.65
    ) {
      const id =
        node?.id || "";

      const targetIdScreenSize =
        Math.min(
          13,
          Math.max(
            9,
            9 +
            Math.max(
              0,
              globalScale -
              0.5
            ) *
            3
          )
        );

      const idSize =
        targetIdScreenSize /
        globalScale;

      ctx.font =
        `500 ${idSize}px Inter, Arial, sans-serif`;

      const idWidth =
        ctx.measureText(id)
          .width;

      const idPillW =
        idWidth +
        (targetIdScreenSize *
          0.75) /
        globalScale;

      const idPillH =
        idSize +
        (targetIdScreenSize *
          0.4) /
        globalScale;

      const idPillY =
        pillY +
        pillHeight +
        3.5 /
        globalScale;

      if (node.__labelPill) {
        node.__labelPill.h += (3.5 / globalScale + idPillH);
      }

      ctx.fillStyle =
        "rgba(15, 23, 42, 0.94)";

      ctx.beginPath();

      const idRadius =
        Math.max(
          2.5,
          targetIdScreenSize *
          0.25
        ) /
        globalScale;

      if (ctx.roundRect) {
        ctx.roundRect(
          node.x -
          idPillW / 2,
          idPillY,
          idPillW,
          idPillH,
          idRadius
        );
      } else {
        ctx.rect(
          node.x -
          idPillW / 2,
          idPillY,
          idPillW,
          idPillH
        );
      }

      ctx.fill();

      ctx.strokeStyle =
        "rgba(45, 212, 191, 0.45)";

      ctx.lineWidth =
        0.9 /
        globalScale;

      ctx.stroke();

      ctx.textAlign =
        "center";

      ctx.textBaseline =
        "middle";

      ctx.fillStyle =
        "#2dd4bf";

      ctx.fillText(
        id,
        node.x,
        idPillY +
        idPillH / 2
      );
    }

    ctx.restore();
  };

  /* ==================================================
     RENDER
  ================================================== */

  return (
    <div
      ref={containerRef}
      className="
        relative
        h-full
        min-h-[420px]
        w-full
        overflow-hidden
        bg-[#020817]
      "
    >
      <ForceGraph2D
        ref={graphRef}

        graphData={
          filteredGraph
        }

        width={
          dimensions.width
        }

        height={
          dimensions.height
        }

        backgroundColor="#020817"

        nodeRelSize={1}

        nodeCanvasObject={
          renderNode
        }

        nodePointerAreaPaint={(
          node,
          color,
          ctx,
          globalScale
        ) => {
          ctx.fillStyle =
            color;

          ctx.beginPath();

          const curScale =
            Math.max(
              globalScale || 1,
              0.05
            );

          // Generous clickable radius: guarantees at least 26px on screen regardless of zoom
          const hitRadius =
            Math.max(
              26 / curScale,
              18
            );

          ctx.arc(
            node.x,
            node.y,
            hitRadius,
            0,
            Math.PI * 2
          );

          ctx.fill();

          if (node.__labelPill) {
            ctx.beginPath();
            ctx.rect(
              node.__labelPill.x - 4 / curScale,
              node.__labelPill.y - 2 / curScale,
              node.__labelPill.w + 8 / curScale,
              node.__labelPill.h + 4 / curScale
            );
            ctx.fill();
          }
        }}

        /* LINKS */

        linkColor={(link) =>
          getRelationshipColor(
            link.relationship
          )
        }

        linkWidth={(link) => {
          if (!selectedNode) {
            return 2;
          }

          const connected =
            getNodeId(
              link.source
            ) ===
            selectedNode.id ||
            getNodeId(
              link.target
            ) ===
            selectedNode.id;

          return connected
            ? 3
            : 2;
        }}

        linkOpacity={0.92}

        linkDirectionalArrowLength={
          6
        }

        linkDirectionalArrowRelPos={
          0.96
        }

        /* SELECTED LINK PARTICLES */

        linkDirectionalParticles={
          (link) => {
            if (!selectedNode) {
              return 0;
            }

            const connected =
              getNodeId(
                link.source
              ) ===
              selectedNode.id ||
              getNodeId(
                link.target
              ) ===
              selectedNode.id;

            return connected
              ? 2
              : 0;
          }
        }

        linkDirectionalParticleWidth={
          2.5
        }

        linkDirectionalParticleSpeed={
          0.005
        }

        linkCanvasObject={
          renderLinkLabel
        }

        linkCanvasObjectMode={
          () => "after"
        }

        /* NODE SELECT */

        onNodeClick={(node) => {
          onNodeSelect?.(
            node
          );
        }}

        onNodeHover={(node) => {
          setHoveredNode(
            node || null
          );
        }}

        /* FORCE */

        d3AlphaDecay={0.018}

        d3VelocityDecay={0.3}

        cooldownTicks={180}

        warmupTicks={100}

        minZoom={0.04}

        maxZoom={12}

        onRenderFramePre={
          renderBackground
        }

        onBackgroundClick={() => {
          onNodeSelect?.(null);
        }}

        onEngineStop={() => {
          if (
            !hasFittedInitialRef.current &&
            !autoFocusNode &&
            graphRef.current
          ) {
            hasFittedInitialRef.current =
              true;

            graphRef.current.zoomToFit(
              450,
              60
            );
          }
        }}
      />

      {/* ==================================================
          NETWORK INFO
      ================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          left-4
          top-4
          z-10
        "
      >
        <div
          className="
            rounded-xl
            border
            border-slate-700/60
            bg-slate-950/90
            px-4
            py-3
            shadow-xl
            backdrop-blur-md
          "
        >
          <div className="flex items-center gap-2">

            <Network
              size={15}
              className="text-teal-400"
            />

            <span className="text-xs font-semibold text-slate-300">
              Visible network
            </span>

            <span
              className="
                h-1.5
                w-1.5
                rounded-full
                bg-emerald-400
              "
            />

          </div>

          <div className="mt-1 text-lg font-bold text-white">
            {
              filteredGraph.nodes
                .length
            }{" "}
            <span className="text-sm font-medium text-slate-500">
              entities
            </span>
          </div>

          <div className="text-xs text-slate-500">
            {
              filteredGraph.links
                .length
            }{" "}
            relationships
          </div>

          {selectedNode && (
            <div
              className="
                mt-2
                border-t
                border-slate-800
                pt-2
                text-xs
                font-medium
                text-teal-400
              "
            >
              {
                selectedRelationships.length
              }{" "}
              direct connections
            </div>
          )}

        </div>
      </div>

      {/* ==================================================
          ZOOM CONTROLS
      ================================================== */}

      <div
        className="
          absolute
          right-4
          top-4
          z-20
          flex
          flex-col
          gap-2
        "
      >

        <button
          type="button"
          onClick={zoomIn}
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-lg
            border
            border-slate-700
            bg-slate-950/90
            text-slate-300
            shadow-lg
            transition
            hover:border-teal-400/50
            hover:text-teal-400
          "
        >
          <Plus size={16} />
        </button>

        <button
          type="button"
          onClick={zoomOut}
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-lg
            border
            border-slate-700
            bg-slate-950/90
            text-slate-300
            shadow-lg
            transition
            hover:border-teal-400/50
            hover:text-teal-400
          "
        >
          <Minus size={16} />
        </button>

        <button
          type="button"
          onClick={fitGraph}
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-lg
            border
            border-slate-700
            bg-slate-950/90
            text-slate-300
            shadow-lg
            transition
            hover:border-teal-400/50
            hover:text-teal-400
          "
        >
          <Maximize2 size={15} />
        </button>

        <button
          type="button"
          onClick={() => {
            graphRef.current?.centerAt(
              0,
              0,
              400
            );

            graphRef.current?.zoom(
              1,
              400
            );
          }}
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-lg
            border
            border-slate-700
            bg-slate-950/90
            text-slate-300
            shadow-lg
            transition
            hover:border-teal-400/50
            hover:text-teal-400
          "
        >
          <RotateCcw size={15} />
        </button>

      </div>
    </div>
  );
}

export default NetworkGraph;