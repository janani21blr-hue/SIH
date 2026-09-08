import { Search, X } from "lucide-react";

function SearchBar({
  value,
  onChange,
  onClear,
  results = [],
  onSelect,
}) {
  return (
    <div className="relative w-full max-w-xl">
      {/* Search Input */}
      <div className="flex items-center bg-white border border-slate-300 rounded-lg shadow-sm px-3">

        <Search
          size={18}
          className="text-slate-400 mr-2"
        />

        <input
          type="text"
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder="Search entity, ID or alias..."
          className="
            w-full
            py-3
            outline-none
            text-sm
            text-slate-800
            placeholder:text-slate-400
          "
        />

        {value && (
          <button
            onClick={onClear}
            className="
              p-1
              rounded
              text-slate-400
              hover:text-slate-700
            "
            aria-label="Clear search"
          >
            <X size={17} />
          </button>
        )}
      </div>

      {/* Search Results */}
      {value.trim() && results.length > 0 && (
        <div className="
          absolute
          z-50
          top-full
          left-0
          right-0
          mt-2
          bg-white
          border
          border-slate-200
          rounded-lg
          shadow-xl
          overflow-hidden
        ">

          {results.map((node) => (
            <button
              key={node.id}
              onClick={() => onSelect(node)}
              className="
                w-full
                text-left
                px-4
                py-3
                hover:bg-slate-50
                border-b
                border-slate-100
                last:border-b-0
              "
            >

              <div className="flex items-center justify-between">

                <div>
                  <p className="
                    text-sm
                    font-medium
                    text-slate-900
                  ">
                    {node.canonical_name || node.id}
                  </p>

                  <p className="
                    text-xs
                    text-slate-500
                    mt-1
                  ">
                    {node.id}
                  </p>
                </div>

                <span className="
                  text-xs
                  px-2
                  py-1
                  rounded-full
                  bg-slate-100
                  text-slate-600
                ">
                  {node.entity_type}
                </span>

              </div>

            </button>
          ))}

        </div>
      )}

      {/* No Results */}
      {value.trim() && results.length === 0 && (
        <div className="
          absolute
          z-50
          top-full
          left-0
          right-0
          mt-2
          bg-white
          border
          border-slate-200
          rounded-lg
          shadow-lg
          px-4
          py-4
          text-sm
          text-slate-500
        ">
          No matching entities found.
        </div>
      )}
    </div>
  );
}

export default SearchBar;