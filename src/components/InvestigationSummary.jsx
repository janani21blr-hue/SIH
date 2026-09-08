import {
  FileText,
  Link2,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

/* ==================================================
   COLORS
================================================== */

const RELATIONSHIP_COLORS = {
  DIRECTOR_OF: "#2dd4bf",
  REGISTERED_AT: "#fb7185",
  OWNS: "#c084fc",
  USES: "#38bdf8",
  ASSOCIATED_WITH: "#f59e0b",
};

/* ==================================================
   HELPERS
================================================== */

function getNodeId(value) {
  if (
    value &&
    typeof value === "object"
  ) {
    return value.id;
  }

  return value;
}

function getNodeName(node) {
  if (!node) {
    return "Unknown entity";
  }

  return (
    node.canonical_name ||
    node.name ||
    node.label ||
    node.display_name ||
    node.phone_number ||
    node.account_number ||
    node.registration_number ||
    node.id ||
    "Unknown entity"
  );
}

function formatPercentage(value) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "—";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return String(value);
  }

  return `${Math.round(
    number * 100
  )}%`;
}

/* ==================================================
   RESOLVE CONNECTED ENTITY

   IMPORTANT:
   ForceGraph can turn:

      "PHONE_17"

   into:

      {
        id: "PHONE_17",
        ...
      }

   So we normalize both cases.
================================================== */

function resolveConnectedEntity(
  relationship,
  selectedNode,
  graph
) {
  if (!relationship) {
    return null;
  }

  const sourceId =
    getNodeId(
      relationship.source
    );

  const targetId =
    getNodeId(
      relationship.target
    );

  const selectedId =
    selectedNode?.id;

  let connectedId = null;

  let connectedEndpoint = null;

  if (
    sourceId === selectedId
  ) {
    connectedId = targetId;

    connectedEndpoint =
      relationship.target;
  } else if (
    targetId === selectedId
  ) {
    connectedId = sourceId;

    connectedEndpoint =
      relationship.source;
  }

  /* ----------------------------------------------
     ForceGraph already gave us the node
  ---------------------------------------------- */

  if (
    connectedEndpoint &&
    typeof connectedEndpoint ===
      "object" &&
    connectedEndpoint.id
  ) {
    return connectedEndpoint;
  }

  /* ----------------------------------------------
     Find node in graph
  ---------------------------------------------- */

  if (
    connectedId &&
    graph?.nodes
  ) {
    const found =
      graph.nodes.find(
        (node) =>
          node.id ===
          connectedId
      );

    if (found) {
      return found;
    }
  }

  return null;
}

/* ==================================================
   INVESTIGATION SUMMARY
================================================== */

function InvestigationSummary({
  selectedNode,
  relationships = [],
  investigationPath = [],
  graph,
}) {
  if (!selectedNode) {
    return (
      <div
        className="
          rounded-2xl
          border
          border-slate-700
          bg-[#071426]
          p-8
          text-center
        "
      >
        <FileText
          size={28}
          className="
            mx-auto
            text-slate-600
          "
        />

        <p
          className="
            mt-3
            text-sm
            font-semibold
            text-slate-400
          "
        >
          Select an entity to view investigation summary.
        </p>
      </div>
    );
  }

  /* ==================================================
     CALCULATIONS
  ================================================== */

  const connectionCount =
    relationships.length;

  const confidenceValues =
    relationships
      .map(
        (relationship) =>
          Number(
            relationship.confidence
          )
      )
      .filter(
        (value) =>
          !Number.isNaN(
            value
          )
      );

  const averageConfidence =
    confidenceValues.length
      ? confidenceValues.reduce(
          (
            total,
            value
          ) =>
            total + value,
          0
        ) /
        confidenceValues.length
      : 0;

  const highConfidenceCount =
    confidenceValues.filter(
      (value) =>
        value >= 0.9
    ).length;

  const riskScore =
    selectedNode?.attributes
      ?.risk_score ??
    selectedNode?.risk_score ??
    null;

  /* ==================================================
     PATH TEXT
  ================================================== */

  const pathLength =
    investigationPath.length;

  /* ==================================================
     RENDER
  ================================================== */

  return (
    <section
      className="
        overflow-hidden
        rounded-2xl
        border
        border-slate-700/70
        bg-[#071426]
        text-slate-200
        shadow-[0_18px_45px_rgba(0,0,0,.28)]
      "
    >

      {/* ==================================================
          HEADER
      ================================================== */}

      <div
        className="
          border-b
          border-slate-700/70
          bg-[#08182b]
          px-7
          py-5
        "
      >

        <div
          className="
            flex
            items-center
            justify-between
            gap-4
          "
        >

          <div
            className="
              flex
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
                border-teal-400/25
                bg-teal-400/10
              "
            >
              <FileText
                size={20}
                className="text-teal-300"
              />
            </div>

            <div>

              <h2
                className="
                  text-[17px]
                  font-bold
                  text-white
                "
              >
                Investigation Summary
              </h2>

              <p
                className="
                  mt-1
                  text-xs
                  text-slate-500
                "
              >
                Evidence-linked analysis of the selected entity.
              </p>

            </div>

          </div>

          {/* RISK */}

          {riskScore !== null && (
            <div
              className="
                flex
                items-center
                gap-2
                rounded-xl
                border
                border-amber-400/25
                bg-amber-400/5
                px-4
                py-2.5
              "
            >

              <AlertTriangle
                size={17}
                className="text-amber-400"
              />

              <span
                className="
                  text-xs
                  font-semibold
                  text-amber-300
                "
              >
                Risk
              </span>

              <span
                className="
                  text-sm
                  font-bold
                  text-amber-200
                "
              >
                {riskScore}
              </span>

            </div>
          )}

        </div>

      </div>

      {/* ==================================================
          BODY
      ================================================== */}

      <div className="p-7">

        {/* ==================================================
            NETWORK SIGNIFICANCE
        ================================================== */}

        <div
          className="
            rounded-xl
            border
            border-slate-700/70
            bg-[#0a1a2e]
            p-5
          "
        >

          <div
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.14em]
              text-slate-500
            "
          >
            Network Significance
          </div>

          <p
            className="
              mt-3
              text-[16px]
              leading-7
              text-slate-300
            "
          >

            <span
              className="
                font-bold
                text-white
              "
            >
              {
                getNodeName(
                  selectedNode
                )
              }
            </span>

            {" has "}

            <span
              className="
                font-bold
                text-teal-300
              "
            >
              {
                connectionCount
              }
            </span>

            {" directly connected relationships in the visible investigation network."}

          </p>

        </div>

        {/* ==================================================
            STAT CARDS
        ================================================== */}

        <div
          className="
            mt-5
            grid
            grid-cols-3
            gap-4
          "
        >

          {/* CONNECTIONS */}

          <div
            className="
              rounded-xl
              border
              border-slate-700/70
              bg-[#0a1a2e]
              p-5
            "
          >

            <div
              className="
                flex
                items-center
                gap-2
                text-xs
                text-slate-500
              "
            >

              <Link2
                size={15}
                className="text-teal-400"
              />

              Connections

            </div>

            <div
              className="
                mt-3
                text-2xl
                font-bold
                text-white
              "
            >
              {
                connectionCount
              }
            </div>

          </div>

          {/* AVERAGE CONFIDENCE */}

          <div
            className="
              rounded-xl
              border
              border-slate-700/70
              bg-[#0a1a2e]
              p-5
            "
          >

            <div
              className="
                flex
                items-center
                gap-2
                text-xs
                text-slate-500
              "
            >

              <ShieldCheck
                size={15}
                className="text-teal-400"
              />

              Avg. confidence

            </div>

            <div
              className="
                mt-3
                text-2xl
                font-bold
                text-white
              "
            >
              {
                formatPercentage(
                  averageConfidence
                )
              }
            </div>

          </div>

          {/* HIGH CONFIDENCE */}

          <div
            className="
              rounded-xl
              border
              border-slate-700/70
              bg-[#0a1a2e]
              p-5
            "
          >

            <div
              className="
                flex
                items-center
                gap-2
                text-xs
                text-slate-500
              "
            >

              <CheckCircle2
                size={15}
                className="text-teal-400"
              />

              High confidence

            </div>

            <div
              className="
                mt-3
                text-2xl
                font-bold
                text-white
              "
            >
              {
                highConfidenceCount
              }
            </div>

          </div>

        </div>

        {/* ==================================================
            PATH
        ================================================== */}

        {pathLength > 1 && (
          <div className="mt-6">

            <div
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.14em]
                text-slate-500
              "
            >
              Current investigation path
            </div>

            <div
              className="
                mt-3
                flex
                flex-wrap
                items-center
                gap-2
              "
            >

              {investigationPath.map(
                (
                  node,
                  index
                ) => (
                  <div
                    key={`${node.id}-${index}`}
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >

                    {index > 0 && (
                      <span
                        className="
                          text-slate-600
                        "
                      >
                        →
                      </span>
                    )}

                    <span
                      className="
                        rounded-lg
                        border
                        border-slate-700
                        bg-slate-900/70
                        px-3
                        py-1.5
                        text-xs
                        font-semibold
                        text-slate-300
                      "
                    >
                      {
                        getNodeName(
                          node
                        )
                      }
                    </span>

                  </div>
                )
              )}

            </div>

          </div>
        )}

        {/* ==================================================
            RELATIONSHIP EXPLANATION
        ================================================== */}

        <div className="mt-7">

          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            <Link2
              size={17}
              className="text-teal-400"
            />

            <h3
              className="
                text-[16px]
                font-bold
                text-white
              "
            >
              Relationship Explanation
            </h3>

          </div>

          <div
            className="
              mt-4
              space-y-4
            "
          >

            {relationships.length ===
            0 ? (
              <div
                className="
                  rounded-xl
                  border
                  border-dashed
                  border-slate-700
                  p-6
                  text-center
                  text-sm
                  text-slate-500
                "
              >
                No direct relationships found.
              </div>
            ) : (
              relationships.map(
                (
                  relationship,
                  index
                ) => {

                  /* ==========================================
                     RESOLVE CONNECTED NODE
                  ========================================== */

                  const connectedEntity =
                    resolveConnectedEntity(
                      relationship,
                      selectedNode,
                      graph
                    );

                  const sourceId =
                    getNodeId(
                      relationship.source
                    );

                  const targetId =
                    getNodeId(
                      relationship.target
                    );

                  const connectedId =
                    sourceId ===
                    selectedNode.id
                      ? targetId
                      : sourceId;

                  const connectedName =
                    connectedEntity
                      ? getNodeName(
                          connectedEntity
                        )
                      : connectedId ||
                        "Unknown entity";

                  const relationshipColor =
                    RELATIONSHIP_COLORS[
                      relationship.relationship
                    ] ||
                    "#94a3b8";

                  const direction =
                    sourceId ===
                    selectedNode.id
                      ? "OUTGOING"
                      : "INCOMING";

                  return (
                    <div
                      key={`${relationship.relationship}-${connectedId}-${index}`}
                      className="
                        rounded-xl
                        border
                        border-slate-700/70
                        bg-[#0a1a2e]
                        p-5
                      "
                    >

                      {/* ========================================
                          HEADER
                      ======================================== */}

                      <div
                        className="
                          flex
                          items-center
                          justify-between
                        "
                      >

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
                              relationshipColor,

                            borderColor:
                              `${relationshipColor}45`,

                            background:
                              `${relationshipColor}10`,
                          }}
                        >
                          {
                            relationship.relationship
                          }
                        </span>

                        <span
                          className="
                            text-[10px]
                            font-bold
                            tracking-wider
                            text-slate-500
                          "
                        >
                          {
                            direction
                          }
                        </span>

                      </div>

                      {/* ========================================
                          CONNECTION TEXT
                      ======================================== */}

                      <div
                        className="
                          mt-5
                          text-sm
                          leading-6
                          text-slate-400
                        "
                      >

                        <span
                          className="
                            font-bold
                            text-white
                          "
                        >
                          {
                            getNodeName(
                              selectedNode
                            )
                          }
                        </span>

                        {" is connected to "}

                        <span
                          className="
                            font-bold
                            text-teal-300
                          "
                        >
                          {
                            connectedName
                          }
                        </span>

                        {" through the "}

                        <span
                          className="
                            font-semibold
                            text-slate-300
                          "
                        >
                          {
                            relationship.relationship
                          }
                        </span>

                        {" relationship."}

                      </div>

                      {/* ========================================
                          CONNECTED ID
                      ======================================== */}

                      {connectedEntity && (
                        <div
                          className="
                            mt-2
                            font-mono
                            text-[11px]
                            text-slate-500
                          "
                        >
                          Entity ID:{" "}
                          {
                            connectedEntity.id
                          }
                        </div>
                      )}

                      {/* ========================================
                          CONFIDENCE
                      ======================================== */}

                      <div
                        className="
                          mt-5
                          border-t
                          border-slate-700/70
                          pt-4
                        "
                      >

                        <div
                          className="
                            flex
                            items-center
                            justify-between
                          "
                        >

                          <span
                            className="
                              text-xs
                              text-slate-500
                            "
                          >
                            Relationship confidence
                          </span>

                          <span
                            className="
                              text-sm
                              font-bold
                              text-white
                            "
                          >
                            {
                              formatPercentage(
                                relationship.confidence
                              )
                            }
                          </span>

                        </div>

                        {/* CONFIDENCE BAR */}

                        <div
                          className="
                            mt-2
                            h-1.5
                            overflow-hidden
                            rounded-full
                            bg-slate-800
                          "
                        >

                          <div
                            className="
                              h-full
                              rounded-full
                            "
                            style={{
                              width:
                                `${
                                  Math.max(
                                    0,
                                    Math.min(
                                      100,
                                      Number(
                                        relationship.confidence ||
                                          0
                                      ) *
                                        100
                                    )
                                  )
                                }%`,

                              background:
                                relationshipColor,
                            }}
                          />

                        </div>

                      </div>

                      {/* ========================================
                          EVIDENCE
                      ======================================== */}

                      <div className="mt-4">

                        <div
                          className="
                            text-xs
                            text-slate-500
                          "
                        >
                          Evidence reference
                        </div>

                        <div
                          className="
                            mt-1
                            break-all
                            font-mono
                            text-xs
                            font-medium
                            text-slate-300
                          "
                        >
                          {
                            relationship.evidence ||
                            "No evidence reference"
                          }
                        </div>

                      </div>

                    </div>
                  );
                }
              )
            )}

          </div>

        </div>

        {/* ==================================================
            CONCLUSION
        ================================================== */}

        <div
          className="
            mt-6
            rounded-xl
            border
            border-teal-400/20
            bg-teal-400/5
            p-5
          "
        >

          <div
            className="
              flex
              items-start
              gap-3
            "
          >

            <ShieldCheck
              size={20}
              className="
                mt-0.5
                shrink-0
                text-teal-400
              "
            />

            <div>

              <div
                className="
                  text-sm
                  font-bold
                  text-teal-300
                "
              >
                Investigation conclusion
              </div>

              <p
                className="
                  mt-2
                  text-sm
                  leading-6
                  text-slate-400
                "
              >
                The selected entity has{" "}
                <span className="font-semibold text-slate-200">
                  {connectionCount}
                </span>{" "}
                relationship links in the visible network.
                Review the relationship confidence and
                evidence references before drawing
                investigative conclusions.
              </p>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

export default InvestigationSummary;