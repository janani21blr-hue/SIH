import {
  ArrowRight,
  FileText,
  Link2,
  ShieldCheck,
  X,
} from "lucide-react";

function getNodeId(value) {
  if (typeof value === "object" && value !== null) {
    return value.id;
  }

  return value;
}

function RelationshipPanel({
  selectedNode,
  relationships = [],
  entityMap = {},
  onClose,
  onSelectEntity,
}) {
  if (!selectedNode) {
    return null;
  }

  const getConnectedEntity = (relationship) => {
    const sourceId = getNodeId(
      relationship.source
    );

    const targetId = getNodeId(
      relationship.target
    );

    const connectedId =
      sourceId === selectedNode.id
        ? targetId
        : sourceId;

    return entityMap[connectedId] || null;
  };

  const getRelationshipDirection = (
    relationship
  ) => {
    const sourceId = getNodeId(
      relationship.source
    );

    const targetId = getNodeId(
      relationship.target
    );

    if (sourceId === selectedNode.id) {
      return "OUTGOING";
    }

    if (targetId === selectedNode.id) {
      return "INCOMING";
    }

    return "RELATED";
  };

  return (
    <aside
      className="
        absolute
        z-30
        top-4
        right-4
        bottom-4
        w-[360px]
        max-w-[calc(100%-2rem)]
        bg-white
        rounded-xl
        shadow-2xl
        border
        border-slate-200
        overflow-hidden
        flex
        flex-col
      "
    >

      {/* ==================================================
          HEADER
      ================================================== */}

      <div
        className="
          px-5
          py-4
          border-b
          border-slate-200
          shrink-0
        "
      >
        <div className="flex items-start justify-between gap-3">

          <div className="min-w-0">

            <p
              className="
                text-xs
                font-semibold
                uppercase
                tracking-wide
                text-slate-500
              "
            >
              {selectedNode.entity_type}
            </p>

            <h3
              className="
                text-lg
                font-bold
                text-slate-900
                mt-1
                truncate
              "
            >
              {selectedNode.canonical_name ||
                selectedNode.id}
            </h3>

            <p
              className="
                text-xs
                text-slate-500
                mt-1
              "
            >
              {selectedNode.id}
            </p>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              shrink-0
              p-1.5
              rounded-lg
              text-slate-400
              hover:text-slate-700
              hover:bg-slate-100
              transition
            "
            aria-label="Close relationship panel"
          >
            <X size={20} />
          </button>

        </div>
      </div>

      {/* ==================================================
          ENTITY SUMMARY
      ================================================== */}

      <div
        className="
          px-5
          py-4
          border-b
          border-slate-200
          shrink-0
        "
      >

        <div
          className="
            grid
            grid-cols-2
            gap-3
          "
        >

          <div
            className="
              bg-slate-50
              rounded-lg
              px-3
              py-3
            "
          >
            <p
              className="
                text-xs
                text-slate-500
              "
            >
              Confidence
            </p>

            <p
              className="
                text-lg
                font-bold
                text-slate-900
                mt-1
              "
            >
              {Math.round(
                (selectedNode.confidence || 0) *
                  100
              )}
              %
            </p>
          </div>

          <div
            className="
              bg-slate-50
              rounded-lg
              px-3
              py-3
            "
          >
            <p
              className="
                text-xs
                text-slate-500
              "
            >
              Connections
            </p>

            <p
              className="
                text-lg
                font-bold
                text-slate-900
                mt-1
              "
            >
              {relationships.length}
            </p>
          </div>

        </div>

        {/* ALIASES */}

        {selectedNode.aliases?.length > 0 && (
          <div className="mt-4">

            <p
              className="
                text-xs
                font-medium
                text-slate-500
                mb-2
              "
            >
              Known aliases
            </p>

            <div className="flex flex-wrap gap-2">

              {selectedNode.aliases.map(
                (alias) => (
                  <span
                    key={alias}
                    className="
                      text-xs
                      px-2.5
                      py-1.5
                      rounded-md
                      bg-slate-100
                      text-slate-700
                    "
                  >
                    {alias}
                  </span>
                )
              )}

            </div>

          </div>
        )}

      </div>

      {/* ==================================================
          RELATIONSHIPS
      ================================================== */}

      <div
        className="
          flex-1
          overflow-y-auto
          px-5
          py-4
        "
      >

        <div
          className="
            flex
            items-center
            gap-2
            mb-4
          "
        >
          <Link2
            size={17}
            className="text-slate-500"
          />

          <h4
            className="
              text-sm
              font-semibold
              text-slate-900
            "
          >
            Connected Relationships
          </h4>

        </div>

        {relationships.length === 0 ? (
          <div
            className="
              rounded-lg
              border
              border-dashed
              border-slate-300
              px-4
              py-8
              text-center
            "
          >
            <p
              className="
                text-sm
                font-medium
                text-slate-600
              "
            >
              No relationships found
            </p>

            <p
              className="
                text-xs
                text-slate-400
                mt-1
              "
            >
              This entity has no visible
              connections.
            </p>
          </div>
        ) : (
          <div className="space-y-3">

            {relationships.map(
              (relationship, index) => {
                const connectedEntity =
                  getConnectedEntity(
                    relationship
                  );

                /*
                 * If the connected entity cannot
                 * be resolved, don't crash the
                 * application.
                 */
                if (!connectedEntity) {
                  return (
                    <div
                      key={`${relationship.relationship}-${index}`}
                      className="
                        rounded-lg
                        border
                        border-slate-200
                        bg-slate-50
                        p-4
                      "
                    >
                      <p
                        className="
                          text-xs
                          text-slate-500
                        "
                      >
                        Relationship
                      </p>

                      <p
                        className="
                          text-sm
                          font-semibold
                          text-slate-800
                          mt-1
                        "
                      >
                        {relationship.relationship ||
                          "RELATED"}
                      </p>
                    </div>
                  );
                }

                const direction =
                  getRelationshipDirection(
                    relationship
                  );

                const confidence =
                  relationship.confidence ?? 0;

                return (
                  <div
                    key={`${relationship.relationship}-${connectedEntity.id}-${index}`}
                    className="
                      rounded-lg
                      border
                      border-slate-200
                      bg-white
                      p-4
                      hover:border-blue-300
                      transition
                    "
                  >

                    {/* RELATIONSHIP TYPE */}

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-2
                      "
                    >

                      <span
                        className="
                          inline-flex
                          items-center
                          px-2.5
                          py-1
                          rounded-md
                          bg-blue-50
                          text-blue-700
                          text-xs
                          font-semibold
                        "
                      >
                        {relationship.relationship ||
                          "RELATED"}
                      </span>

                      <span
                        className="
                          text-[10px]
                          font-medium
                          text-slate-400
                        "
                      >
                        {direction}
                      </span>

                    </div>

                    {/* CONNECTED ENTITY */}

                    <button
                      type="button"
                      onClick={() =>
                        onSelectEntity(
                          connectedEntity
                        )
                      }
                      className="
                        w-full
                        text-left
                        mt-3
                        rounded-lg
                        bg-slate-50
                        hover:bg-blue-50
                        border
                        border-transparent
                        hover:border-blue-200
                        p-3
                        transition
                      "
                    >

                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          gap-3
                        "
                      >

                        <div className="min-w-0">

                          <p
                            className="
                              text-xs
                              text-slate-500
                            "
                          >
                            Connected entity
                          </p>

                          <p
                            className="
                              text-sm
                              font-semibold
                              text-slate-900
                              mt-1
                              truncate
                            "
                          >
                            {connectedEntity.canonical_name ||
                              connectedEntity.id}
                          </p>

                          <p
                            className="
                              text-xs
                              text-slate-500
                              mt-1
                            "
                          >
                            {connectedEntity.entity_type}
                            {" · "}
                            {connectedEntity.id}
                          </p>

                        </div>

                        <ArrowRight
                          size={17}
                          className="
                            shrink-0
                            text-blue-500
                          "
                        />

                      </div>

                    </button>

                    {/* CONFIDENCE */}

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-3
                        mt-3
                        pt-3
                        border-t
                        border-slate-100
                      "
                    >

                      <div
                        className="
                          flex
                          items-center
                          gap-2
                        "
                      >
                        <ShieldCheck
                          size={15}
                          className="text-emerald-500"
                        />

                        <span
                          className="
                            text-xs
                            text-slate-500
                          "
                        >
                          Relationship confidence
                        </span>
                      </div>

                      <span
                        className="
                          text-xs
                          font-semibold
                          text-slate-800
                        "
                      >
                        {Math.round(
                          confidence * 100
                        )}
                        %
                      </span>

                    </div>

                    {/* EVIDENCE */}

                    {relationship.evidence && (
                      <div
                        className="
                          flex
                          items-start
                          gap-2
                          mt-3
                          pt-3
                          border-t
                          border-slate-100
                        "
                      >

                        <FileText
                          size={15}
                          className="
                            text-slate-400
                            mt-0.5
                            shrink-0
                          "
                        />

                        <div className="min-w-0">

                          <p
                            className="
                              text-xs
                              text-slate-500
                            "
                          >
                            Evidence reference
                          </p>

                          <p
                            className="
                              text-xs
                              font-medium
                              text-slate-700
                              mt-1
                              break-all
                            "
                          >
                            {relationship.evidence}
                          </p>

                        </div>

                      </div>
                    )}

                  </div>
                );
              }
            )}

          </div>
        )}

      </div>

    </aside>
  );
}

export default RelationshipPanel;