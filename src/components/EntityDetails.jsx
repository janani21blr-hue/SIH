import {
  User,
  Phone,
  CreditCard,
  Car,
  Building2,
  MapPin,
  Link2,
  ShieldCheck,
  Copy,
  Check,
} from "lucide-react";

import { useState } from "react";

/* ==================================================
   ENTITY ICONS
================================================== */

const ENTITY_ICONS = {
  person: User,
  phone: Phone,
  account: CreditCard,
  vehicle: Car,
  company: Building2,
  address: MapPin,
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
   RELATIONSHIP COLORS
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
    return value.id || value.entity_id;
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

function getNodeType(node) {
  return String(
    node?.entity_type ||
      node?.type ||
      ""
  ).toLowerCase();
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
   FIND CONNECTED ENTITY

   Handles BOTH:

   source: "P042"

   AND:

   source: {
     id: "P042",
     ...
   }
================================================== */

function resolveConnectedEntity(
  relationship,
  currentNode,
  entityMap
) {
  const sourceId =
    getNodeId(
      relationship?.source
    );

  const targetId =
    getNodeId(
      relationship?.target
    );

  const currentId =
    currentNode?.id || currentNode?.entity_id;

  let connectedId = null;

  let connectedEndpoint = null;

  if (
    sourceId === currentId
  ) {
    connectedId = targetId;
    connectedEndpoint =
      relationship?.target;
  } else if (
    targetId === currentId
  ) {
    connectedId = sourceId;
    connectedEndpoint =
      relationship?.source;
  }

  /* ----------------------------------------------
     1. If ForceGraph already gave us the node
  ---------------------------------------------- */

  if (
    connectedEndpoint &&
    typeof connectedEndpoint ===
      "object" &&
    (connectedEndpoint.id || connectedEndpoint.entity_id)
  ) {
    return connectedEndpoint;
  }

  /* ----------------------------------------------
     2. Look inside entityMap
  ---------------------------------------------- */

  if (
    connectedId &&
    entityMap &&
    entityMap[connectedId]
  ) {
    return entityMap[connectedId];
  }

  /* ----------------------------------------------
     3. Search entityMap values
     
     This handles maps with unexpected keys.
  ---------------------------------------------- */

  if (
    connectedId &&
    entityMap
  ) {
    const values =
      Object.values(
        entityMap
      );

    const found =
      values.find(
        (entity) =>
          entity?.id ===
          connectedId
      );

    if (found) {
      return found;
    }
  }

  /* ----------------------------------------------
     4. Nothing found
  ---------------------------------------------- */

  return null;
}

/* ==================================================
   GET DISPLAY VALUE

   Prefer useful identifying data over
   the internal entity ID.
================================================== */

function getDisplayValue(node) {
  if (!node) {
    return null;
  }

  if (
    node.canonical_name
  ) {
    return node.canonical_name;
  }

  if (node.name) {
    return node.name;
  }

  if (node.label) {
    return node.label;
  }

  if (
    node.phone_number
  ) {
    return node.phone_number;
  }

  if (
    node.account_number
  ) {
    return node.account_number;
  }

  if (
    node.registration_number
  ) {
    return node.registration_number;
  }

  return node.id;
}

/* ==================================================
   ENTITY DETAILS
================================================== */

function EntityDetails({
  node,
  relationships = [],
  entityMap = {},
  onNodeSelect,
}) {
  const [
    copied,
    setCopied,
  ] = useState(false);

  if (!node) {
    return null;
  }

  const type =
    getNodeType(node);

  const EntityIcon =
    ENTITY_ICONS[type] ||
    Link2;

  const entityColor =
    ENTITY_COLORS[type] ||
    "#94a3b8";

  const entityName =
    getNodeName(node);

  const confidence =
    node.confidence;

  const attributes =
    node.attributes || {};

  /* ==================================================
     COPY ID
  ================================================== */

  const copyId = async () => {
    if (!node.id) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        node.id
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      // Clipboard unavailable
    }
  };

  /* ==================================================
     RENDER
  ================================================== */

  return (
    <div
      className="
        flex
        h-full
        flex-col
        bg-[#071426]
        text-slate-200
      "
    >

      {/* ==================================================
          HEADER
      ================================================== */}

      <div
        className="
          border-b
          border-slate-700/60
          bg-[#08182b]
          px-5
          py-5
        "
      >

        <div
          className="
            flex
            items-start
            gap-3
          "
        >

          {/* ICON */}

          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
            "
            style={{
              color:
                entityColor,

              borderColor:
                `${entityColor}45`,

              background:
                `${entityColor}10`,
            }}
          >
            <EntityIcon
              size={20}
            />
          </div>

          {/* TITLE */}

          <div className="min-w-0">

            <div
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.14em]
              "
              style={{
                color:
                  entityColor,
              }}
            >
              {type ||
                "ENTITY"}
            </div>

            <h2
              className="
                mt-1
                truncate
                text-[18px]
                font-bold
                text-white
              "
            >
              {entityName}
            </h2>

            <div
              className="
                mt-1
                flex
                items-center
                gap-2
              "
            >

              <span
                className="
                  font-mono
                  text-xs
                  text-slate-500
                "
              >
                {node.id}
              </span>

              <button
                type="button"
                onClick={
                  copyId
                }
                className="
                  flex
                  h-6
                  w-6
                  items-center
                  justify-center
                  rounded-md
                  text-slate-500
                  transition
                  hover:bg-slate-800
                  hover:text-slate-200
                "
                title="Copy entity ID"
              >
                {copied ? (
                  <Check
                    size={13}
                  />
                ) : (
                  <Copy
                    size={13}
                  />
                )}
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* ==================================================
          CONTENT
      ================================================== */}

      <div
        className="
          flex-1
          overflow-y-auto
          px-5
          py-5
        "
      >

        {/* ==================================================
            METRICS
        ================================================== */}

        <div
          className="
            grid
            grid-cols-2
            gap-3
          "
        >

          {/* CONFIDENCE */}

          <div
            className="
              rounded-xl
              border
              border-slate-700/70
              bg-[#0a1a2e]
              p-4
            "
          >

            <div
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-wider
                text-slate-500
              "
            >
              Entity Confidence
            </div>

            <div
              className="
                mt-2
                text-xl
                font-bold
                text-white
              "
            >
              {formatPercentage(
                confidence
              )}
            </div>

          </div>

          {/* RISK */}

          <div
            className="
              rounded-xl
              border
              border-slate-700/70
              bg-[#0a1a2e]
              p-4
            "
          >

            <div
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-wider
                text-slate-500
              "
            >
              Risk Score
            </div>

            <div
              className="
                mt-2
                text-xl
                font-bold
                text-white
              "
            >
              {attributes.risk_score ??
                node.risk_score ??
                "—"}
            </div>

          </div>

        </div>

        {/* ==================================================
            ALIASES
        ================================================== */}

        {Array.isArray(
          node.aliases
        ) &&
          node.aliases.length >
            0 && (
            <section className="mt-6">

              <h3
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  text-slate-500
                "
              >
                Known Aliases
              </h3>

              <div
                className="
                  mt-3
                  flex
                  flex-wrap
                  gap-2
                "
              >

                {node.aliases.map(
                  (alias) => (
                    <span
                      key={
                        alias
                      }
                      className="
                        rounded-lg
                        border
                        border-slate-700
                        bg-slate-900/60
                        px-3
                        py-1.5
                        text-xs
                        font-medium
                        text-slate-300
                      "
                    >
                      {alias}
                    </span>
                  )
                )}

              </div>

            </section>
          )}

        {/* ==================================================
            ATTRIBUTES
        ================================================== */}

        {Object.keys(
          attributes
        ).length > 0 && (
          <section className="mt-6">

            <h3
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.14em]
                text-slate-500
              "
            >
              Attributes
            </h3>

            <div
              className="
                mt-3
                overflow-hidden
                rounded-xl
                border
                border-slate-700
                bg-[#08182b]
              "
            >

              {Object.entries(
                attributes
              ).map(
                (
                  [
                    key,
                    value,
                  ],
                  index
                ) => (
                  <div
                    key={key}
                    className={`
                      flex
                      items-center
                      justify-between
                      gap-4
                      px-4
                      py-3
                      ${
                        index <
                        Object.keys(
                          attributes
                        ).length -
                          1
                          ? "border-b border-slate-700/70"
                          : ""
                      }
                    `}
                  >

                    <span
                      className="
                        text-sm
                        text-slate-500
                      "
                    >
                      {key}
                    </span>

                    <span
                      className="
                        max-w-[65%]
                        break-words
                        text-right
                        text-sm
                        font-semibold
                        text-white
                      "
                    >
                      {String(
                        value
                      )}
                    </span>

                  </div>
                )
              )}

            </div>

          </section>
        )}

        {/* ==================================================
            RELATIONSHIPS
        ================================================== */}

        <section className="mt-6">

          <div
            className="
              flex
              items-center
              justify-between
            "
          >

            <div
              className="
                flex
                items-center
                gap-2
              "
            >

              <Link2
                size={15}
                className="text-teal-400"
              />

              <h3
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  text-slate-400
                "
              >
                Relationship Explanation
              </h3>

            </div>

            <span
              className="
                rounded-full
                border
                border-slate-700
                bg-slate-900
                px-2
                py-1
                text-[10px]
                font-bold
                text-slate-400
              "
            >
              {
                relationships.length
              }
            </span>

          </div>

          <div
            className="
              mt-3
              space-y-3
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
                  p-5
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
                     RESOLVE TARGET
                  ========================================== */

                  const connectedEntity =
                    resolveConnectedEntity(
                      relationship,
                      node,
                      entityMap
                    );

                  const sourceId =
                    getNodeId(
                      relationship.source
                    );

                  const targetId =
                    getNodeId(
                      relationship.target
                    );

                  const currentNodeId = node.id || node.entity_id;
                  const connectedId =
                    sourceId === currentNodeId
                      ? targetId
                      : sourceId;

                  const connectedName =
                    connectedEntity
                      ? getNodeName(
                          connectedEntity
                        )
                      : connectedId ||
                        "Unknown entity";

                  const displayValue =
                    connectedEntity
                      ? getDisplayValue(
                          connectedEntity
                        )
                      : connectedId;

                  const direction =
                    sourceId === node.id
                      ? "OUTGOING"
                      : "INCOMING";

                  const relationshipColor =
                    RELATIONSHIP_COLORS[
                      relationship.relationship
                    ] ||
                    "#64748b";

                  return (
                    <div
                      key={`${relationship.relationship}-${connectedId}-${index}`}
                      className="
                        rounded-xl
                        border
                        border-slate-700/80
                        bg-[#0a1a2e]
                        p-4
                        shadow-lg
                      "
                    >

                      {/* ========================================
                          TOP ROW
                      ======================================== */}

                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          gap-3
                        "
                      >

                        <span
                          className="
                            rounded-lg
                            border
                            px-2.5
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
                            text-[9px]
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
                          CONNECTION
                      ======================================== */}

                      <button
                        type="button"
                        disabled={
                          !connectedEntity
                        }
                        onClick={() => {
                          if (
                            connectedEntity
                          ) {
                            onNodeSelect?.(
                              connectedEntity
                            );
                          }
                        }}
                        className="
                          mt-4
                          w-full
                          text-left
                        "
                      >

                        <div
                          className="
                            text-xs
                            text-slate-500
                          "
                        >
                          Connected entity
                        </div>

                        <div
                          className="
                            mt-1
                            text-sm
                            font-bold
                            text-white
                            transition
                            hover:text-teal-300
                          "
                        >
                          {
                            connectedName
                          }
                        </div>

                        {/* ACTUAL IDENTIFIER */}

                        {displayValue &&
                          displayValue !==
                            connectedName && (
                            <div
                              className="
                                mt-1
                                text-xs
                                font-medium
                                text-teal-300
                              "
                            >
                              {
                                displayValue
                              }
                            </div>
                          )}

                        {connectedId && (
                          <div
                            className="
                              mt-1
                              font-mono
                              text-[10px]
                              text-slate-500
                            "
                          >
                            ID:{" "}
                            {
                              connectedId
                            }
                          </div>
                        )}

                      </button>

                      {/* ========================================
                          CONFIDENCE
                      ======================================== */}

                      <div
                        className="
                          mt-4
                          border-t
                          border-slate-700/70
                          pt-3
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

                        {/* BAR */}

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

                      {relationship.evidence && (
                        <div className="mt-3">

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
                              relationship.evidence
                            }
                          </div>

                        </div>
                      )}

                    </div>
                  );
                }
              )
            )}

          </div>

        </section>

        {/* ==================================================
            INVESTIGATION NOTE
        ================================================== */}

        <div
          className="
            mt-6
            rounded-xl
            border
            border-teal-400/20
            bg-teal-400/5
            p-4
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
              size={18}
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
                Evidence-backed analysis
              </div>

              <p
                className="
                  mt-1
                  text-xs
                  leading-5
                  text-slate-400
                "
              >
                Review relationship confidence
                and evidence references before
                drawing investigative conclusions.
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default EntityDetails;