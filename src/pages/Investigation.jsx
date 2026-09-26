import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useSearchParams } from "react-router-dom";

import {
  Search,
  Network,
  User,
  Phone,
  CreditCard,
  Car,
  Building2,
  MapPin,
  Link2,
  X,
  ChevronRight,
  RotateCcw,
  GripVertical,
  Sparkles,
  Crown,
  ShieldAlert,
  Clock,
  Scale,
  FileCheck2,
  Layers,
} from "lucide-react";

import NetworkGraph from "../components/NetworkGraph";
import EntityDetails from "../components/EntityDetails";
import InvestigationSummary from "../components/InvestigationSummary";
import UnstructuredIngestionModal from "../components/UnstructuredIngestionModal";
import KeyInfluencersPanel from "../components/KeyInfluencersPanel";
import PatternRadarModal from "../components/PatternRadarModal";
import TimelinePlayback from "../components/TimelinePlayback";
import CourtDossierModal from "../components/CourtDossierModal";

import {
  investigationGraph,
} from "../data/graphData";
import {
  fetchGraphData,
} from "../services/api";
import { useNetworkFilters } from "../context/NetworkFilterContext";
import {
  analyzeNetworkInfluencers,
  detectSuspiciousPatterns,
} from "../utils/networkAnalytics";

/* ==================================================
   ENTITY FILTERS
================================================== */

const ENTITY_FILTERS = [
  {
    key: "person",
    label: "People",
    icon: User,
  },
  {
    key: "phone",
    label: "Phones",
    icon: Phone,
  },
  {
    key: "account",
    label: "Accounts",
    icon: CreditCard,
  },
  {
    key: "vehicle",
    label: "Vehicles",
    icon: Car,
  },
  {
    key: "company",
    label: "Companies",
    icon: Building2,
  },
  {
    key: "address",
    label: "Addresses",
    icon: MapPin,
  },
];

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
   HELPERS
================================================== */

function getNodeId(value) {
  return typeof value === "object"
    ? value?.id || value?.entity_id
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

/* ==================================================
   INVESTIGATION
================================================== */

function findMatchingNode(nodes, idOrName) {
  if (!idOrName || !nodes || nodes.length === 0) return null;
  const target = String(idOrName).trim().toLowerCase();
  return (
    nodes.find((n) => {
      const id = String(n.id || n.entity_id || "").toLowerCase();
      const canonical = String(n.canonical_name || n.name || "").toLowerCase();
      return id === target || canonical === target;
    }) || null
  );
}

function Investigation() {
  const [searchParams] = useSearchParams();
  const entityIdFromUrl = searchParams.get("entityId");

  /* ==================================================
     SELECTED NODE
  ================================================== */

  const [
    graphData,
    setGraphData,
  ] = useState(investigationGraph);

  const [
    isLiveGraph,
    setIsLiveGraph,
  ] = useState(false);

  const [
    selectedNode,
    setSelectedNode,
  ] = useState(() => {
    if (entityIdFromUrl) {
      const match = findMatchingNode(investigationGraph.nodes, entityIdFromUrl);
      if (match) return match;
    }
    return null;
  });

  useEffect(() => {
    let isMounted = true;
    fetchGraphData()
      .then((data) => {
        if (isMounted && data && data.nodes && data.nodes.length > 0) {
          setGraphData(data);
          setIsLiveGraph(true);
          setSelectedNode((current) => {
            if (entityIdFromUrl) {
              const match = findMatchingNode(data.nodes, entityIdFromUrl);
              if (match) return match;
            }
            if (!current) return null;
            const exists = data.nodes.find((n) => n.id === current.id);
            return exists || null;
          });
          setInvestigationPath((currentPath) => {
            if (entityIdFromUrl) {
              const match = findMatchingNode(data.nodes, entityIdFromUrl);
              if (match) return [match];
            }
            return currentPath;
          });
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [entityIdFromUrl]);

  // Sync selected node when URL query param changes
  useEffect(() => {
    if (!entityIdFromUrl || !graphData?.nodes) return;
    const match = findMatchingNode(graphData.nodes, entityIdFromUrl);
    if (match) {
      setSelectedNode(match);
      setInvestigationPath([match]);
    }
  }, [entityIdFromUrl, graphData]);

  /* ==================================================
     SEARCH
  ================================================== */

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  /* ==================================================
     NETWORK FILTERS (From Global Context)
  ================================================== */

  const {
    activeFilters,
    activeRelationshipFilters,
  } = useNetworkFilters();

  /* ==================================================
     INVESTIGATION PATH
  ================================================== */

  const [
    investigationPath,
    setInvestigationPath,
  ] = useState(() => {
    if (entityIdFromUrl) {
      const match = findMatchingNode(investigationGraph.nodes, entityIdFromUrl);
      if (match) return [match];
    }
    return investigationGraph.nodes?.[0]
      ? [
          investigationGraph
            .nodes[0],
        ]
      : [];
  });

  /* ==================================================
     RIGHT PANEL WIDTH
  ================================================== */

  const [
    detailsWidth,
    setDetailsWidth,
  ] = useState(460);

  const [
    isResizingDetails,
    setIsResizingDetails,
  ] = useState(false);

  const resizeStartX =
    useRef(0);

  const resizeStartWidth =
    useRef(460);

  /* ==================================================
     GRAPH HEIGHT RESIZING
  ================================================== */

  const [
    graphHeight,
    setGraphHeight,
  ] = useState(720);

  const [
    isResizingHeight,
    setIsResizingHeight,
  ] = useState(false);

  const resizeStartY =
    useRef(0);

  const resizeStartHeight =
    useRef(720);

  /* ==================================================
     INTELLIGENCE TOOLS & MODALS
  ================================================== */
  const [isIngestionOpen, setIsIngestionOpen] = useState(false);
  const [isInfluencersOpen, setIsInfluencersOpen] = useState(false);
  const [isPatternsOpen, setIsPatternsOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isolatedPattern, setIsolatedPattern] = useState(null);
  const [timelineStepEvent, setTimelineStepEvent] = useState(null);

  const influencers = useMemo(() => {
    return analyzeNetworkInfluencers(graphData.nodes || [], graphData.links || []);
  }, [graphData]);

  const patterns = useMemo(() => {
    return detectSuspiciousPatterns(graphData.nodes || [], graphData.links || []);
  }, [graphData]);

  const handleIngestExtractedData = (newNodes, newLinks) => {
    setGraphData((prev) => {
      const existingNodeIds = new Set((prev.nodes || []).map((n) => n.id || n.entity_id));
      const mergedNodes = [...(prev.nodes || [])];
      newNodes.forEach((node) => {
        if (!existingNodeIds.has(node.id)) {
          mergedNodes.push({
            ...node,
            label: node.canonical_name || node.name || node.id,
            entity_type: node.entity_type,
            confidence: node.confidence ?? 0.94,
          });
          existingNodeIds.add(node.id);
        }
      });

      const existingLinkKeys = new Set(
        (prev.links || []).map(
          (l) => `${l.source?.id || l.source}-${l.target?.id || l.target}-${l.relationship}`
        )
      );
      const mergedLinks = [...(prev.links || [])];
      newLinks.forEach((link) => {
        const key = `${link.source}-${link.target}-${link.relationship}`;
        if (!existingLinkKeys.has(key)) {
          mergedLinks.push(link);
          existingLinkKeys.add(key);
        }
      });

      return { nodes: mergedNodes, links: mergedLinks };
    });

    if (newNodes.length > 0) {
      handleNodeSelect(newNodes[0]);
    }
  };

  const effectiveGraphData = useMemo(() => {
    if (isolatedPattern && isolatedPattern.nodeIds?.length > 0) {
      const pNodeIds = new Set(isolatedPattern.nodeIds);
      const subNodes = (graphData.nodes || []).filter((n) => pNodeIds.has(n.id || n.entity_id));
      const subLinks = (graphData.links || []).filter((l) => {
        const s = typeof l.source === "object" ? l.source.id || l.source.entity_id : l.source;
        const t = typeof l.target === "object" ? l.target.id || l.target.entity_id : l.target;
        return pNodeIds.has(s) && pNodeIds.has(t);
      });
      return { nodes: subNodes, links: subLinks };
    }

    if (timelineStepEvent && timelineStepEvent.activeNodeIds?.length > 0) {
      const tNodeIds = new Set(timelineStepEvent.activeNodeIds);
      const subNodes = (graphData.nodes || []).filter((n) => tNodeIds.has(n.id || n.entity_id));
      const subLinks = (graphData.links || []).filter((l) => {
        const s = typeof l.source === "object" ? l.source.id || l.source.entity_id : l.source;
        const t = typeof l.target === "object" ? l.target.id || l.target.entity_id : l.target;
        return tNodeIds.has(s) && tNodeIds.has(t);
      });
      return { nodes: subNodes, links: subLinks };
    }

    return graphData;
  }, [graphData, isolatedPattern, timelineStepEvent]);

  /* ==================================================
     ENTITY MAP
  ================================================== */

  const entityMap =
    useMemo(() => {
      const map = {};

      (graphData.nodes || []).forEach(
        (node) => {
          if (node.id) map[node.id] = node;
          if (node.entity_id) map[node.entity_id] = node;
        }
      );

      return map;
    }, [graphData]);

  /* ==================================================
     RELATIONSHIP TYPES
  ================================================== */

  const relationshipTypes =
    useMemo(() => {
      return [
        ...new Set(
          (graphData.links || [])
            .map(
              (link) =>
                link.relationship
            )
            .filter(Boolean)
        ),
      ].sort();
    }, [graphData]);

  /* ==================================================
     SEARCH RESULTS
  ================================================== */

  const searchResults =
    useMemo(() => {
      const term =
        searchTerm
          .trim()
          .toLowerCase();

      if (!term) {
        return [];
      }

      return (graphData.nodes || [])
        .filter((node) => {
          const name =
            getNodeName(
              node
            ).toLowerCase();

          const id =
            String(
              node?.id || ""
            ).toLowerCase();

          const type =
            getNodeType(node);

          const aliases =
            Array.isArray(
              node?.aliases
            )
              ? node.aliases
                  .join(" ")
                  .toLowerCase()
              : String(
                  node?.aliases ||
                    ""
                ).toLowerCase();

          return (
            name.includes(
              term
            ) ||
            id.includes(
              term
            ) ||
            type.includes(
              term
            ) ||
            aliases.includes(
              term
            )
          );
        })
        .slice(0, 8);
    }, [searchTerm, graphData]);

  /* ==================================================
     SELECTED RELATIONSHIPS
  ================================================== */

  const selectedRelationships =
    useMemo(() => {
      if (!selectedNode) {
        return [];
      }

      const selId = selectedNode.id || selectedNode.entity_id;

      return (graphData.links || []).filter(
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
            sourceId === selId ||
            targetId === selId
          );
        }
      );
    }, [selectedNode, graphData]);

  /* ==================================================
     PATH RELATIONSHIPS
  ================================================== */

  const pathRelationships =
    useMemo(() => {
      if (
        investigationPath.length <
        2
      ) {
        return [];
      }

      return investigationPath
        .slice(
          0,
          -1
        )
        .map(
          (
            sourceNode,
            index
          ) => {
            const targetNode =
              investigationPath[
                index + 1
              ];

            const relationship =
              (graphData.links || []).find(
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
                    (
                      sourceId ===
                        sourceNode.id &&
                      targetId ===
                        targetNode.id
                    ) ||
                    (
                      sourceId ===
                        targetNode.id &&
                      targetId ===
                        sourceNode.id
                    )
                  );
                }
              );

            return (
              relationship?.relationship ||
              null
            );
          }
        );
    }, [
      investigationPath,
      graphData,
    ]);

  /* ==================================================
     NODE SELECT
  ================================================== */

  const handleNodeSelect =
    (node) => {

      if (!node) {
        setSelectedNode(
          null
        );

        return;
      }

      setSelectedNode(
        node
      );

      setInvestigationPath(
        (currentPath) => {

          const selId = node.id || node.entity_id;
          const existingIndex =
            currentPath.findIndex(
              (item) =>
                (item.id || item.entity_id) === selId
            );

          if (
            existingIndex !==
            -1
          ) {
            return currentPath.slice(
              0,
              existingIndex + 1
            );
          }

          return [
            ...currentPath,
            node,
          ];
        }
      );
    };

  /* ==================================================
     CLOSE DETAILS
  ================================================== */

  const closeDetails =
    () => {
      setSelectedNode(
        null
      );
    };

  /* ==================================================
     CLEAR PATH
  ================================================== */

  const clearPath =
    () => {
      if (selectedNode) {
        setInvestigationPath([
          selectedNode,
        ]);
      } else {
        setInvestigationPath(
          []
        );
      }
    };

  /* ==================================================
     SEARCH SELECT
  ================================================== */

  const selectSearchResult =
    (node) => {
      setSearchTerm("");

      handleNodeSelect(
        node
      );
    };

  /* ==================================================
     RESIZE START
  ================================================== */

  const startDetailsResize =
    (event) => {

      event.preventDefault();
      event.stopPropagation();

      resizeStartX.current =
        event.clientX;

      resizeStartWidth.current =
        detailsWidth;

      setIsResizingDetails(
        true
      );

      document.body.style.cursor =
        "ew-resize";

      document.body.style.userSelect =
        "none";
    };

  /* ==================================================
     RESIZE MOVE

     Window listener means the cursor
     can move anywhere while resizing.
  ================================================== */

  useMemo(() => {
    return null;
  }, []);

  /* ==================================================
     POINTER EVENTS

     We attach these to window using
     a regular effect below.
  ================================================== */

  const resizeMoveHandler =
    (event) => {

      const workspace =
        document.querySelector(
          ".sih-workspace"
        );

      if (!workspace) {
        return;
      }

      const rect =
        workspace.getBoundingClientRect();

      const delta =
        resizeStartX.current -
        event.clientX;

      const requestedWidth =
        resizeStartWidth.current +
        delta;

      const minWidth = 240;

      const maxWidth =
        Math.min(
          950,
          rect.width * 0.75
        );

      const nextWidth =
        Math.max(
          minWidth,
          Math.min(
            maxWidth,
            requestedWidth
          )
        );

      setDetailsWidth(
        nextWidth
      );
    };

  const finishDetailsResize =
    () => {

      setIsResizingDetails(
        false
      );

      document.body.style.cursor =
        "";

      document.body.style.userSelect =
        "";
    };

  /* ==================================================
     HEIGHT RESIZE HANDLERS
  ================================================== */

  const startHeightResize =
    (event) => {

      event.preventDefault();
      event.stopPropagation();

      resizeStartY.current =
        event.clientY;

      resizeStartHeight.current =
        graphHeight;

      setIsResizingHeight(true);

      document.body.style.cursor =
        "ns-resize";

      document.body.style.userSelect =
        "none";
    };

  const resizeHeightMoveHandler =
    (event) => {

      const deltaY =
        event.clientY -
        resizeStartY.current;

      const nextHeight =
        Math.max(
          450,
          Math.min(
            1300,
            resizeStartHeight.current +
              deltaY
          )
        );

      setGraphHeight(
        nextHeight
      );
    };

  const finishHeightResize =
    () => {

      setIsResizingHeight(
        false
      );

      document.body.style.cursor =
        "";

      document.body.style.userSelect =
        "";
    };

  /* ==================================================
     RETURN
  ================================================== */

  return (
    <div
      className="
        sih-app
        min-h-screen
        text-slate-100
      "
    >

      {/* ==================================================
          BACKGROUND GRID
      ================================================== */}

      <div className="sih-grid" />

      {/* ==================================================
          BACKGROUND PARTICLES
      ================================================== */}

      <div className="sih-particles">

        {Array.from({
          length: 24,
        }).map(
          (_, index) => (
            <span
              key={index}
              className="sih-particle"
              style={{
                left:
                  `${
                    (index * 37) %
                    100
                  }%`,

                top:
                  `${
                    (index * 61) %
                    100
                  }%`,

                animationDelay:
                  `${
                    (index % 8) *
                    -1.4
                  }s`,
              }}
            />
          )
        )}

      </div>

      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="sih-header">

        <div
          className="
            mx-auto
            flex
            min-h-[76px]
            w-full
            items-center
            gap-6
            px-5
            lg:px-7
          "
        >

          <div
            className="
              flex
              shrink-0
              items-center
              gap-3
            "
          >

            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                border
                border-teal-400/30
                bg-teal-400/10
                text-teal-300
              "
            >
              <Network size={21} />
            </div>

            <div>

              <div
                className="
                  text-[16px]
                  font-bold
                  tracking-tight
                  text-white
                "
              >
                NETRAA AI
              </div>

              <div
                className="
                  text-[11px]
                  text-slate-500
                "
              >
                Investigation Intelligence
              </div>

            </div>

          </div>

          {/* SEARCH */}

          <div
            className="
              relative
              mx-auto
              w-full
              max-w-[760px]
            "
          >

            <Search
              size={19}
              className="
                pointer-events-none
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-slate-500
              "
            />

            <input
              type="text"
              value={
                searchTerm
              }
              onChange={(
                event
              ) =>
                setSearchTerm(
                  event.target.value
                )
              }
              placeholder="
                Search entity, ID, alias,
                phone, account, vehicle...
              "
              className="
                h-12
                w-full
                rounded-xl
                border
                border-slate-700/70
                bg-slate-950/60
                pl-11
                pr-4
                text-sm
                text-slate-200
                outline-none
                placeholder:text-slate-500
                transition
                focus:border-teal-400/50
                focus:ring-2
                focus:ring-teal-400/10
              "
            />

            {/* SEARCH RESULTS */}

            {searchTerm.trim() &&
              searchResults.length >
                0 && (
                <div
                  className="
                    absolute
                    left-0
                    right-0
                    top-[56px]
                    z-[100]
                    overflow-hidden
                    rounded-xl
                    border
                    border-slate-700
                    bg-[#071426]
                    shadow-2xl
                  "
                >

                  {searchResults.map(
                    (node, index) => (
                      <button
                        key={`${node.id}-${index}`}
                        type="button"
                        onClick={() =>
                          selectSearchResult(
                            node
                          )
                        }
                        className="
                          flex
                          w-full
                          items-center
                          justify-between
                          gap-3
                          border-b
                          border-slate-800
                          px-4
                          py-3
                          text-left
                          transition
                          last:border-b-0
                          hover:bg-slate-800/60
                        "
                      >

                        <div className="min-w-0">

                          <div
                            className="
                              truncate
                              text-sm
                              font-semibold
                              text-slate-200
                            "
                          >
                            {
                              getNodeName(
                                node
                              )
                            }
                          </div>

                          <div
                            className="
                              mt-0.5
                              text-[11px]
                              text-slate-500
                            "
                          >
                            {
                              getNodeType(
                                node
                              )
                            }{" "}
                            ·{" "}
                            {
                              node.id
                            }
                          </div>

                        </div>

                        <ChevronRight
                          size={16}
                          className="
                            shrink-0
                            text-teal-400
                          "
                        />

                      </button>
                    )
                  )}

                </div>
              )}

            {searchTerm.trim() &&
              searchResults.length ===
                0 && (
                <div
                  className="
                    absolute
                    left-0
                    right-0
                    top-[56px]
                    z-[100]
                    rounded-xl
                    border
                    border-slate-700
                    bg-[#071426]
                    px-4
                    py-4
                    text-sm
                    text-slate-500
                    shadow-2xl
                  "
                >
                  No matching entities found.
                </div>
              )}

          </div>

          {/* LIVE */}

          <div
            className="
              hidden
              shrink-0
              items-center
              gap-3
              xl:flex
            "
          >

            <div
              className="
                flex
                items-center
                gap-2
                rounded-full
                border
                border-emerald-400/20
                bg-emerald-400/5
                px-4
                py-2
              "
            >

              <span
                className="
                  relative
                  flex
                  h-2
                  w-2
                "
              >
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.7)]"></span>
              </span>

              <span
                className="
                  text-xs
                  font-semibold
                  text-emerald-300
                "
              >
                {isLiveGraph ? "SQLite Backend Live" : "Live Analysis"}
              </span>

            </div>

          </div>

        </div>

      </header>

      {/* ==================================================
          INTELLIGENCE & ANALYTICS ACTION TOOLBAR
      ================================================== */}
      <div className="border-b border-slate-800/80 bg-slate-950/70 px-5 py-2.5 lg:px-7 flex items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsIngestionOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 hover:bg-teal-500/20 text-xs font-bold transition shadow-sm"
          >
            <Sparkles size={14} className="text-teal-400" />
            <span>AI Ingest FIR / Unstructured</span>
          </button>

          <button
            type="button"
            onClick={() => setIsInfluencersOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 text-xs font-bold transition"
          >
            <Crown size={14} className="text-rose-400" />
            <span>Key Influencers</span>
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-[10px] font-mono">
              {influencers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsPatternsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-bold transition"
          >
            <ShieldAlert size={14} className="text-amber-400" />
            <span>Pattern Radar</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-[10px] font-mono">
              {patterns.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsTimelineOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 hover:bg-blue-500/20 text-xs font-bold transition"
          >
            <Clock size={14} className="text-blue-400" />
            <span>Timeline Playback</span>
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isolatedPattern && (
            <div className="flex items-center gap-2 bg-teal-500/20 border border-teal-500/40 px-2.5 py-1 rounded-lg text-xs text-teal-300">
              <span className="font-semibold">Isolated Ring: {isolatedPattern.title}</span>
              <button
                type="button"
                onClick={() => setIsolatedPattern(null)}
                className="underline font-bold text-teal-200 ml-1"
              >
                Reset
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsDossierOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 text-xs font-bold transition shadow-sm"
          >
            <Scale size={14} className="text-teal-400" />
            <span>Court Dossier & Notice</span>
          </button>
        </div>
      </div>

      {/* ==================================================
          INVESTIGATION PATH
      ================================================== */}

      <div className="sih-path-bar">

        <div
          className="
            flex
            min-h-[66px]
            items-center
            gap-3
            overflow-x-auto
            px-5
            lg:px-7
          "
        >

          <div
            className="
              flex
              shrink-0
              items-center
              gap-2
            "
          >

            <Network
              size={16}
              className="text-teal-400"
            />

            <span
              className="
                text-[11px]
                font-bold
                tracking-[0.12em]
                text-slate-500
              "
            >
              INVESTIGATION PATH
            </span>

          </div>

          <span className="text-slate-700">
            /
          </span>

          {investigationPath.map(
            (
              node,
              index
            ) => {

              const relationship =
                pathRelationships[
                  index - 1
                ];

              return (
                <div
                  key={`${node.id}-${index}`}
                  className="
                    flex
                    shrink-0
                    items-center
                    gap-2
                  "
                >

                  {index > 0 && (
                    <>
                      <ChevronRight
                        size={15}
                        className="text-slate-700"
                      />

                      {relationship && (
                        <>
                          <span
                            className="
                              rounded-lg
                              border
                              px-3
                              py-1.5
                              text-[10px]
                              font-bold
                              tracking-wide
                            "
                            style={{
                              color:
                                RELATIONSHIP_COLORS[
                                  relationship
                                ] ||
                                "#94a3b8",

                              borderColor:
                                `${
                                  RELATIONSHIP_COLORS[
                                    relationship
                                  ] ||
                                  "#64748b"
                                }55`,

                              background:
                                `${
                                  RELATIONSHIP_COLORS[
                                    relationship
                                  ] ||
                                  "#64748b"
                                }12`,
                            }}
                          >
                            {
                              relationship
                            }
                          </span>

                          <ChevronRight
                            size={15}
                            className="text-slate-700"
                          />
                        </>
                      )}
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      handleNodeSelect(
                        node
                      )
                    }
                    className={`
                      rounded-lg
                      border
                      px-4
                      py-2
                      text-xs
                      font-semibold
                      transition
                      ${
                        index ===
                        investigationPath.length -
                          1
                          ? "border-teal-400/50 bg-teal-400/10 text-teal-300"
                          : "border-slate-700 bg-slate-900/70 text-slate-300 hover:border-slate-600 hover:text-white"
                      }
                    `}
                  >
                    {
                      getNodeName(
                        node
                      )
                    }
                  </button>

                </div>
              );
            }
          )}

          {investigationPath.length >
            1 && (
            <button
              type="button"
              onClick={
                clearPath
              }
              className="
                ml-auto
                flex
                shrink-0
                items-center
                gap-1
                text-xs
                font-semibold
                text-teal-400
                transition
                hover:text-teal-300
              "
            >
              <X size={13} />
              Clear path
            </button>
          )}

        </div>

      </div>

      {/* ==================================================
          WORKSPACE
      ================================================== */}

      <main
        className={`
          sih-workspace
          ${
            isResizingDetails
              ? "select-none"
              : ""
          }
        `}
      >

        {/* ==================================================
            CENTER GRAPH
        ================================================== */}

        <section
          className="
            min-w-0
            w-full
            overflow-hidden
          "
        >

          <div
            className="
              sih-dark-panel
              overflow-hidden
            "
          >

            {/* GRAPH HEADER */}

            <div
              className="
                flex
                min-h-[82px]
                items-center
                justify-between
                gap-4
                border-b
                border-slate-800/80
                px-5
              "
            >

              <div>

                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >

                  <h1
                    className="
                      text-[17px]
                      font-bold
                      text-white
                    "
                  >
                    Investigation Network
                  </h1>

                  <span className="sih-live">
                    LIVE
                  </span>

                </div>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-500
                  "
                >
                  Interactive force-directed network visualization
                </p>

              </div>

            </div>

            {/* ==================================================
                GRAPH + RIGHT DETAILS LAYOUT

                The resize handle and details panel
                are OUTSIDE NetworkGraph.
            ================================================== */}

            <div
              className="
                relative
                flex
                w-full
              "
              style={{
                height: `${graphHeight}px`,
                minHeight: "450px",
              }}
            >

              {/* GRAPH */}

              <div
                className={`
                  relative
                  min-w-0
                  flex-1
                  ${
                    isResizingDetails
                      ? "pointer-events-none"
                      : ""
                  }
                `}
              >

                <NetworkGraph
                  selectedNode={
                    selectedNode
                  }

                  onNodeSelect={
                    handleNodeSelect
                  }

                  activeFilters={
                    activeFilters
                  }

                  activeRelationshipFilters={
                    activeRelationshipFilters
                  }

                  graph={
                    effectiveGraphData
                  }

                  autoFocusNode={
                    Boolean(entityIdFromUrl)
                  }
                />

              </div>

              {/* ==================================================
                  RESIZE HANDLE

                  IMPORTANT:
                  This is a normal DOM element.
                  It is NOT inside the graph.
              ================================================== */}

              {selectedNode && (
                <div
                  role="separator"
                  aria-label="
                    Resize entity details panel
                  "
                  onPointerDown={
                    startDetailsResize
                  }
                  style={{
                    width:
                      "12px",

                    flexShrink: 0,

                    cursor:
                      "ew-resize",

                    touchAction:
                      "none",

                    userSelect:
                      "none",

                    zIndex:
                      500,

                    background:
                      isResizingDetails
                        ? "rgba(45,212,191,.28)"
                        : "rgba(15,23,42,.85)",
                  }}
                  className="
                    relative
                    flex
                    items-center
                    justify-center
                    border-l
                    border-r
                    border-slate-700/60
                    transition-colors
                    hover:bg-teal-400/20
                  "
                >

                  <GripVertical
                    size={14}
                    className={`
                      transition-colors
                      ${
                        isResizingDetails
                          ? "text-teal-300"
                          : "text-slate-600"
                      }
                    `}
                  />

                </div>
              )}

              {/* ==================================================
                  RIGHT ENTITY DETAILS
              ================================================== */}

              {selectedNode && (
                <aside
                  className="
                    relative
                    shrink-0
                    overflow-hidden
                    bg-white
                  "
                  style={{
                    width:
                      `${detailsWidth}px`,
                  }}
                >

                  {/* CLOSE */}

                  <button
                    type="button"
                    aria-label="
                      Close entity details
                    "
                    onClick={() =>
                      closeDetails()
                    }
                    className="
                      absolute
                      right-4
                      top-4
                      z-[100]
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-slate-300
                      bg-white
                      text-slate-500
                      shadow-md
                      transition
                      hover:border-slate-400
                      hover:bg-slate-50
                      hover:text-slate-800
                    "
                  >
                    <X size={20} />
                  </button>

                  {/* DETAILS CONTENT */}

                  <div
                    className="
                      h-full
                      overflow-y-auto
                      overflow-x-hidden
                      bg-white
                    "
                  >

                    <EntityDetails
                      node={
                        selectedNode
                      }

                      selectedNode={
                        selectedNode
                      }

                      relationships={
                        selectedRelationships
                      }

                      entityMap={
                        entityMap
                      }

                      onNodeSelect={
                        handleNodeSelect
                      }
                    />

                  </div>

                </aside>
              )}

            </div>

            {/* ==================================================
                GRAPH HEIGHT RESIZE HANDLE
            ================================================== */}

            <div
              role="separator"
              aria-label="Resize graph height"
              onPointerDown={
                startHeightResize
              }
              className={`
                group
                relative
                flex
                h-4
                w-full
                cursor-ns-resize
                items-center
                justify-center
                border-t
                border-slate-800
                bg-[#071426]
                transition-colors
                hover:bg-teal-500/20
                ${
                  isResizingHeight
                    ? "bg-teal-500/30"
                    : ""
                }
              `}
              title="Drag up or down to resize graph height"
            >
              <div className="flex items-center gap-1.5">
                <div className="h-1 w-12 rounded-full bg-slate-600 transition-colors group-hover:bg-teal-400" />
              </div>
            </div>

          </div>

          {/* ==================================================
              SUMMARY
          ================================================== */}

          <div className="mt-[18px]">

            <InvestigationSummary
              selectedNode={
                selectedNode
              }

              relationships={
                selectedRelationships
              }

              investigationPath={
                investigationPath
              }

              graph={
                graphData
              }
            />

          </div>

        </section>

      </main>

      {/* ==================================================
          RESIZE EVENT HANDLERS
          
          These are attached globally only while
          the user is actively resizing.
      ================================================== */}

      {isResizingDetails && (
        <ResizeListeners
          onMove={
            resizeMoveHandler
          }
          onEnd={
            finishDetailsResize
          }
        />
      )}

      {isResizingHeight && (
        <ResizeListeners
          onMove={
            resizeHeightMoveHandler
          }
          onEnd={
            finishHeightResize
          }
        />
      )}

      {/* ==================================================
          INTELLIGENCE MODALS & DRAWERS
      ================================================== */}
      <UnstructuredIngestionModal
        isOpen={isIngestionOpen}
        onClose={() => setIsIngestionOpen(false)}
        onIngest={handleIngestExtractedData}
      />

      <KeyInfluencersPanel
        isOpen={isInfluencersOpen}
        onClose={() => setIsInfluencersOpen(false)}
        influencers={influencers}
        onSelectEntity={(id) => {
          const match = (graphData.nodes || []).find((n) => (n.id || n.entity_id) === id);
          if (match) handleNodeSelect(match);
        }}
        selectedEntityId={selectedNode?.id || selectedNode?.entity_id}
      />

      <PatternRadarModal
        isOpen={isPatternsOpen}
        onClose={() => setIsPatternsOpen(false)}
        patterns={patterns}
        onIsolatePattern={(pat) => setIsolatedPattern(pat)}
        activeIsolatedPatternId={isolatedPattern?.id}
        onClearIsolation={() => setIsolatedPattern(null)}
      />

      <TimelinePlayback
        isOpen={isTimelineOpen}
        onClose={() => setIsTimelineOpen(false)}
        onStepChange={(evt) => setTimelineStepEvent(evt)}
      />

      <CourtDossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        nodes={graphData.nodes || []}
        links={graphData.links || []}
        influencers={influencers}
        patterns={patterns}
      />

    </div>
  );
}

/* ==================================================
   RESIZE LISTENERS

   Separate component so the global listeners
   exist only during resizing.
================================================== */

function ResizeListeners({
  onMove,
  onEnd,
}) {
  useEffect(() => {
    window.addEventListener(
      "pointermove",
      onMove
    );

    window.addEventListener(
      "pointerup",
      onEnd
    );

    window.addEventListener(
      "pointercancel",
      onEnd
    );

    return () => {
      window.removeEventListener(
        "pointermove",
        onMove
      );

      window.removeEventListener(
        "pointerup",
        onEnd
      );

      window.removeEventListener(
        "pointercancel",
        onEnd
      );
    };
  }, [onMove, onEnd]);

  return null;
}


export default Investigation;