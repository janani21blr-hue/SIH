import {
  AlertTriangle,
  ArrowDown,
  CheckCircle2,
  FileSearch,
  Link2,
  ShieldCheck,
} from "lucide-react";

function ExplainNetwork({
  selectedNode,
  relationships = [],
  entityMap = {},
}) {
  if (!selectedNode) {
    return (
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <FileSearch
              size={17}
              className="text-blue-600"
            />

            <h3 className="text-sm font-semibold text-slate-900">
              Explain This Network
            </h3>
          </div>

          <p className="text-xs text-slate-500 mt-1">
            Select an entity to understand its evidence-backed connections.
          </p>
        </div>

        <div className="p-8 text-center">
          <FileSearch
            size={30}
            className="mx-auto text-slate-300"
          />

          <p className="text-sm font-medium text-slate-600 mt-3">
            No entity selected
          </p>

          <p className="text-xs text-slate-400 mt-1">
            Select a node from the investigation network.
          </p>
        </div>
      </section>
    );
  }

  /*
   * =====================================================
   * RESOLVE FORCE GRAPH ENDPOINTS
   * =====================================================
   */

  const getEndpointId = (endpoint) => {
    return typeof endpoint === "object"
      ? endpoint.id
      : endpoint;
  };

  /*
   * =====================================================
   * PREPARE CONNECTION DATA
   * =====================================================
   */

  const connectionData = relationships.map(
    (relationship) => {
      const sourceId = getEndpointId(
        relationship.source
      );

      const targetId = getEndpointId(
        relationship.target
      );

      const sourceEntity =
        entityMap[sourceId];

      const targetEntity =
        entityMap[targetId];

      return {
        ...relationship,
        sourceId,
        targetId,
        sourceEntity,
        targetEntity,
        direction:
          sourceId === selectedNode.id
            ? "Outgoing"
            : "Incoming",
      };
    }
  );

  /*
   * =====================================================
   * CONFIDENCE CALCULATIONS
   * =====================================================
   */

  const averageConfidence =
    connectionData.length > 0
      ? connectionData.reduce(
          (sum, relationship) =>
            sum +
            (relationship.confidence || 0),
          0
        ) / connectionData.length
      : 0;

  const highConfidenceCount =
    connectionData.filter(
      (relationship) =>
        (relationship.confidence || 0) >= 0.9
    ).length;

  /*
   * =====================================================
   * DISPLAY NAME
   * =====================================================
   */

  const getEntityName = (
    entity,
    fallback
  ) => {
    return (
      entity?.canonical_name ||
      fallback ||
      "Unknown entity"
    );
  };

  return (
    <section className="
      bg-white
      border
      border-slate-200
      rounded-xl
      overflow-hidden
    ">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="
        px-5
        py-4
        border-b
        border-slate-200
      ">

        <div className="
          flex
          items-start
          justify-between
          gap-4
        ">

          <div>

            <div className="
              flex
              items-center
              gap-2
            ">

              <FileSearch
                size={17}
                className="text-blue-600"
              />

              <h3 className="
                text-sm
                font-semibold
                text-slate-900
              ">
                Explain This Network
              </h3>

            </div>

            <p className="
              text-xs
              text-slate-500
              mt-1
            ">
              Evidence-backed explanation of the selected entity's
              network relationships.
            </p>

          </div>

          <div className="
            flex
            items-center
            gap-1.5
            text-xs
            font-medium
            text-slate-700
            bg-slate-50
            border
            border-slate-200
            px-2.5
            py-1.5
            rounded-lg
            whitespace-nowrap
          ">

            <ShieldCheck size={14} />

            {Math.round(
              averageConfidence * 100
            )}
            % avg confidence

          </div>

        </div>

      </div>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div className="p-5">

        {/* ===================================================
            SELECTED ENTITY
        ==================================================== */}

        <div className="
          bg-slate-50
          border
          border-slate-200
          rounded-xl
          p-4
        ">

          <p className="
            text-[11px]
            font-semibold
            uppercase
            tracking-wide
            text-slate-500
          ">
            Selected Entity
          </p>

          <div className="
            flex
            items-center
            justify-between
            gap-4
            mt-2
          ">

            <div>

              <h4 className="
                text-base
                font-semibold
                text-slate-900
              ">
                {selectedNode.canonical_name ||
                  selectedNode.id}
              </h4>

              <p className="
                text-xs
                text-slate-500
                mt-1
              ">
                {selectedNode.id}
              </p>

            </div>

            <span className="
              px-2.5
              py-1
              rounded-md
              bg-white
              border
              border-slate-200
              text-xs
              font-medium
              text-slate-600
            ">
              {selectedNode.entity_type}
            </span>

          </div>

        </div>

        {/* ===================================================
            NETWORK STATISTICS
        ==================================================== */}

        <div className="
          grid
          grid-cols-1
          sm:grid-cols-3
          gap-3
          mt-4
        ">

          <div className="
            rounded-xl
            border
            border-slate-200
            p-3
          ">

            <div className="
              flex
              items-center
              gap-2
              text-slate-500
            ">

              <Link2 size={15} />

              <span className="text-xs">
                Connections
              </span>

            </div>

            <p className="
              text-lg
              font-semibold
              text-slate-900
              mt-1
            ">
              {connectionData.length}
            </p>

          </div>

          <div className="
            rounded-xl
            border
            border-slate-200
            p-3
          ">

            <div className="
              flex
              items-center
              gap-2
              text-slate-500
            ">

              <ShieldCheck size={15} />

              <span className="text-xs">
                Avg. confidence
              </span>

            </div>

            <p className="
              text-lg
              font-semibold
              text-slate-900
              mt-1
            ">
              {Math.round(
                averageConfidence * 100
              )}
              %
            </p>

          </div>

          <div className="
            rounded-xl
            border
            border-slate-200
            p-3
          ">

            <div className="
              flex
              items-center
              gap-2
              text-slate-500
            ">

              <CheckCircle2 size={15} />

              <span className="text-xs">
                High confidence
              </span>

            </div>

            <p className="
              text-lg
              font-semibold
              text-slate-900
              mt-1
            ">
              {highConfidenceCount}
            </p>

          </div>

        </div>

        {/* ===================================================
            CONNECTION EXPLANATION
        ==================================================== */}

        <div className="mt-5">

          <div className="
            flex
            items-center
            gap-2
            mb-3
          ">

            <Link2
              size={16}
              className="text-blue-600"
            />

            <h4 className="
              text-sm
              font-semibold
              text-slate-900
            ">
              Connection Explanation
            </h4>

          </div>

          {connectionData.length === 0 ? (

            <div className="
              rounded-xl
              border
              border-dashed
              border-slate-300
              p-5
              text-center
            ">

              <p className="
                text-sm
                text-slate-500
              ">
                No relationships are available
                for this entity.
              </p>

            </div>

          ) : (

            <div className="space-y-3">

              {connectionData.map(
                (relationship, index) => {

                  const sourceName =
                    getEntityName(
                      relationship.sourceEntity,
                      relationship.sourceId
                    );

                  const targetName =
                    getEntityName(
                      relationship.targetEntity,
                      relationship.targetId
                    );

                  const confidence =
                    relationship.confidence || 0;

                  return (
                    <div
                      key={`${relationship.relationship}-${index}`}
                      className="
                        border
                        border-slate-200
                        rounded-xl
                        p-4
                      "
                    >

                      {/* -------------------------------------
                          SOURCE
                      -------------------------------------- */}

                      <div className="
                        text-center
                      ">

                        <span className="
                          inline-flex
                          items-center
                          px-3
                          py-2
                          rounded-lg
                          bg-slate-50
                          border
                          border-slate-200
                          text-sm
                          font-semibold
                          text-slate-900
                        ">
                          {sourceName}
                        </span>

                      </div>

                      {/* -------------------------------------
                          RELATIONSHIP
                      -------------------------------------- */}

                      <div className="
                        flex
                        flex-col
                        items-center
                        my-2
                      ">

                        <ArrowDown
                          size={16}
                          className="text-slate-400"
                        />

                        <span className="
                          px-3
                          py-1.5
                          rounded-md
                          bg-blue-50
                          border
                          border-blue-100
                          text-[11px]
                          font-semibold
                          text-blue-700
                          tracking-wide
                        ">
                          {relationship.relationship}
                        </span>

                        <ArrowDown
                          size={16}
                          className="text-slate-400"
                        />

                      </div>

                      {/* -------------------------------------
                          TARGET
                      -------------------------------------- */}

                      <div className="
                        text-center
                      ">

                        <span className="
                          inline-flex
                          items-center
                          px-3
                          py-2
                          rounded-lg
                          bg-slate-50
                          border
                          border-slate-200
                          text-sm
                          font-semibold
                          text-slate-900
                        ">
                          {targetName}
                        </span>

                      </div>

                      {/* -------------------------------------
                          DIRECTION
                      -------------------------------------- */}

                      <div className="
                        flex
                        justify-center
                        mt-3
                      ">

                        <span className="
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-wider
                          text-slate-400
                          bg-slate-50
                          border
                          border-slate-200
                          px-2.5
                          py-1
                          rounded-full
                        ">
                          {relationship.direction}
                        </span>

                      </div>

                      {/* -------------------------------------
                          EXPLANATION
                      -------------------------------------- */}

                      <p className="
                        text-sm
                        text-slate-600
                        leading-6
                        text-center
                        mt-4
                      ">

                        <span className="
                          font-semibold
                          text-slate-900
                        ">
                          {sourceName}
                        </span>

                        {" has a "}

                        <span className="
                          font-semibold
                          text-blue-700
                        ">
                          {relationship.relationship}
                        </span>

                        {" relationship with "}

                        <span className="
                          font-semibold
                          text-slate-900
                        ">
                          {targetName}
                        </span>
                        .

                      </p>

                      {/* -------------------------------------
                          CONFIDENCE
                      -------------------------------------- */}

                      <div className="
                        mt-4
                        pt-3
                        border-t
                        border-slate-100
                      ">

                        <div className="
                          flex
                          items-center
                          justify-between
                          mb-2
                        ">

                          <span className="
                            text-xs
                            text-slate-500
                          ">
                            Relationship confidence
                          </span>

                          <span className="
                            text-xs
                            font-semibold
                            text-slate-800
                          ">
                            {Math.round(
                              confidence * 100
                            )}
                            %
                          </span>

                        </div>

                        <div className="
                          h-1.5
                          bg-slate-100
                          rounded-full
                          overflow-hidden
                        ">

                          <div
                            className="
                              h-full
                              bg-blue-500
                              rounded-full
                            "
                            style={{
                              width: `${Math.min(
                                confidence * 100,
                                100
                              )}%`,
                            }}
                          />

                        </div>

                      </div>

                      {/* -------------------------------------
                          EVIDENCE
                      -------------------------------------- */}

                      {relationship.evidence && (
                        <div className="
                          mt-3
                          bg-slate-50
                          border
                          border-slate-100
                          rounded-lg
                          px-3
                          py-2.5
                        ">

                          <p className="
                            text-[11px]
                            font-semibold
                            uppercase
                            tracking-wide
                            text-slate-400
                          ">
                            Evidence Reference
                          </p>

                          <p className="
                            text-xs
                            font-medium
                            text-slate-700
                            mt-1
                            break-all
                          ">
                            {relationship.evidence}
                          </p>

                        </div>
                      )}

                    </div>
                  );
                }
              )}

            </div>
          )}

        </div>

        {/* ===================================================
            INVESTIGATIVE NOTICE
        ==================================================== */}

        <div className="
          mt-5
          rounded-xl
          bg-amber-50
          border
          border-amber-100
          p-4
        ">

          <div className="
            flex
            items-start
            gap-3
          ">

            <AlertTriangle
              size={18}
              className="
                text-amber-600
                mt-0.5
                shrink-0
              "
            />

            <div>

              <p className="
                text-sm
                font-semibold
                text-amber-900
              ">
                Investigative interpretation
              </p>

              <p className="
                text-xs
                text-amber-800
                leading-5
                mt-1
              ">
                These relationships represent
                evidence-linked connections in the
                available investigation data. They
                should be reviewed together with their
                confidence scores and evidence references
                and should not be treated as a standalone
                determination of guilt.
              </p>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

export default ExplainNetwork;