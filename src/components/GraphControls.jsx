import {
  User,
  Phone,
  CreditCard,
  Car,
  Building2,
  MapPin,
  Link2,
  Minus,
  Plus,
} from "lucide-react";

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
    label: "Bank Accounts",
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

function GraphControls({
  activeFilters,
  onFilterChange,
  onReset,

  relationshipTypes = [],
  activeRelationshipFilters = [],
  onRelationshipFilterChange,

  filterScale = 1,
  onFilterScaleChange,
}) {
  const canDecrease = filterScale > 0.8;
  const canIncrease = filterScale < 1.2;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="px-4 py-3 border-b border-slate-100">
        <div className="flex items-center justify-between gap-3">

          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Network Filters
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              Select entity types to keep the network readable.
            </p>
          </div>

          <div className="flex items-center gap-1">

            {/* SMALLER */}

            <button
              type="button"
              disabled={!canDecrease}
              onClick={() =>
                onFilterScaleChange?.(
                  Math.max(
                    0.8,
                    Number(
                      (filterScale - 0.1).toFixed(1)
                    )
                  )
                )
              }
              className="
                w-7
                h-7
                flex
                items-center
                justify-center
                rounded-md
                border
                border-slate-200
                text-slate-500
                hover:bg-slate-100
                hover:text-slate-800
                disabled:opacity-30
                disabled:cursor-not-allowed
                transition
              "
              title="Make filters smaller"
            >
              <Minus size={14} />
            </button>

            {/* LARGER */}

            <button
              type="button"
              disabled={!canIncrease}
              onClick={() =>
                onFilterScaleChange?.(
                  Math.min(
                    1.2,
                    Number(
                      (filterScale + 0.1).toFixed(1)
                    )
                  )
                )
              }
              className="
                w-7
                h-7
                flex
                items-center
                justify-center
                rounded-md
                border
                border-slate-200
                text-slate-500
                hover:bg-slate-100
                hover:text-slate-800
                disabled:opacity-30
                disabled:cursor-not-allowed
                transition
              "
              title="Make filters larger"
            >
              <Plus size={14} />
            </button>

            {/* RESET */}

            <button
              type="button"
              onClick={onReset}
              className="
                ml-1
                text-xs
                font-medium
                text-blue-600
                hover:text-blue-800
                transition
              "
            >
              Reset
            </button>

          </div>
        </div>
      </div>

      {/* =================================================
          ENTITY FILTERS
      ================================================= */}

      <div className="p-4">

        <div className="grid grid-cols-3 gap-2">

          {ENTITY_FILTERS.map((filter) => {
            const Icon = filter.icon;

            const isActive =
              activeFilters.includes(
                filter.key
              );

            return (
              <button
                key={filter.key}
                type="button"
                onClick={() =>
                  onFilterChange(
                    filter.key
                  )
                }
                className={`
                  flex
                  items-center
                  justify-center
                  gap-2
                  min-h-[54px]
                  px-2
                  py-2
                  rounded-lg
                  border
                  text-xs
                  font-medium
                  transition

                  ${
                    isActive
                      ? "bg-slate-950 text-white border-slate-950 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }
                `}
              >
                <Icon size={16} />

                <span>
                  {filter.label}
                </span>
              </button>
            );
          })}

        </div>

        {/* =================================================
            RELATIONSHIP FILTERS
        ================================================= */}

        {relationshipTypes.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100">

            <div className="flex items-start gap-2 mb-3">

              <Link2
                size={16}
                className="text-slate-500 mt-0.5 shrink-0"
              />

              <div>
                <h4 className="text-sm font-semibold text-slate-700">
                  Relationship Types
                </h4>

                <p className="text-xs text-slate-400 mt-0.5">
                  Choose relationships to display.
                </p>
              </div>

            </div>

            <div className="flex flex-wrap gap-2">

              {relationshipTypes.map(
                (relationship) => {
                  const isActive =
                    activeRelationshipFilters.includes(
                      relationship
                    );

                  return (
                    <button
                      key={relationship}
                      type="button"
                      onClick={() =>
                        onRelationshipFilterChange(
                          relationship
                        )
                      }
                      className={`
                        px-3
                        py-2
                        rounded-lg
                        border
                        text-[11px]
                        font-semibold
                        tracking-wide
                        transition

                        ${
                          isActive
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700"
                        }
                      `}
                    >
                      {relationship}
                    </button>
                  );
                }
              )}

            </div>
          </div>
        )}

      </div>

    </div>
  );
}

export default GraphControls;