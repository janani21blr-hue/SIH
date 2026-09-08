import { ArrowRight, X } from "lucide-react";

function InvestigationPath({
  history = [],
  relationships = [],
  selectedNode,
  onSelect,
  onClear,
}) {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between gap-4">

          {/* LEFT — PATH */}
          <div className="flex items-center gap-3 min-w-0 overflow-x-auto">

            <span
              className="
                text-xs
                font-semibold
                text-slate-500
                uppercase
                tracking-wide
                whitespace-nowrap
              "
            >
              Investigation Path
            </span>

            <span className="text-slate-300">
              /
            </span>

            {history.map((node, index) => {
              const isSelected =
                selectedNode?.id === node.id;

              /*
               * Find the relationship between this node
               * and the next node in the investigation path.
               */
              const nextNode = history[index + 1];

              const relationship =
                nextNode && relationships
                  ? relationships.find((link) => {
                      const sourceId =
                        typeof link.source === "object"
                          ? link.source.id
                          : link.source;

                      const targetId =
                        typeof link.target === "object"
                          ? link.target.id
                          : link.target;

                      return (
                        (sourceId === node.id &&
                          targetId === nextNode.id) ||
                        (sourceId === nextNode.id &&
                          targetId === node.id)
                      );
                    })
                  : null;

              return (
                <div
                  key={node.id}
                  className="
                    flex
                    items-center
                    gap-2
                    whitespace-nowrap
                  "
                >

                  {/* ENTITY */}
                  <button
                    onClick={() => onSelect(node)}
                    className={`
                      px-3
                      py-1.5
                      rounded-lg
                      text-xs
                      font-medium
                      border
                      transition
                      ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-slate-100 text-slate-700 border-slate-100 hover:bg-slate-200"
                      }
                    `}
                  >
                    {node.canonical_name || node.id}
                  </button>

                  {/* RELATIONSHIP + ARROW */}
                  {nextNode && (
                    <div
                      className="
                        flex
                        items-center
                        gap-1.5
                      "
                    >
                      {relationship && (
                        <span
                          className="
                            px-2
                            py-1
                            rounded-md
                            bg-blue-50
                            text-blue-700
                            text-[10px]
                            font-semibold
                            uppercase
                            tracking-wide
                          "
                        >
                          {relationship.relationship}
                        </span>
                      )}

                      <ArrowRight
                        size={15}
                        className="text-slate-400"
                      />
                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {/* CLEAR */}
          <button
            onClick={onClear}
            className="
              flex
              items-center
              gap-1
              text-xs
              font-medium
              text-blue-600
              hover:text-blue-800
              whitespace-nowrap
            "
          >
            <X size={14} />
            Clear path
          </button>

        </div>
      </div>
    </div>
  );
}

export default InvestigationPath;