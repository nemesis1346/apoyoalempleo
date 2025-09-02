import { useState, useEffect } from "react";
import { getItem, saveItem } from "../../utils/localStorage";

const SearchSection = ({ category, search }) => {
  const [showEdit, setShowEdit] = useState(false);

  const [searchKey, setSearchKey] = useState("");
  const [city, setCity] = useState("");

  const getFilterLabel = () => {
    if (category === "jobs") {
      return "Filters (company or position) - comma separated:";
    } else if (category === "contacts") {
      return "Filters (company, name, position, email, phone or whatsapp) - comma separated:";
    }

    return "Filters - comma separated:";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSearch = () => {
    saveItem(`${category}SearchTerms`, { searchKey, city });
    search(searchKey, city);
  };

  useEffect(() => {
    const savedSearchTerms = getItem(`${category}SearchTerms`);
    if (savedSearchTerms) {
      setSearchKey(savedSearchTerms.searchKey || "");
      setCity(savedSearchTerms.city || "Columbia");
    } else {
      setSearchKey("");
      setCity("Columbia");
    }
  }, []);

  return (
    <div className="mb-2">
      {/* Popular searches */}
      <div className="mb-2 flex gap-1 flex-col md:flex-row md:items-center">
        <div className="text-xs text-gray-600">
          Popular searches in{" "}
          <span className="text-sm font-semibold">{city} : </span>
        </div>
        {searchKey && searchKey.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {searchKey.split(/\s*,\s*/).map(
              (term, index) =>
                term.length > 0 && (
                  <span
                    key={index}
                    className="text-xs text-[#4b2c8f] bg-[#f3f0ff] py-1.5 px-2 font-semibold rounded-full border-1 border-[#eadfff]"
                  >
                    {term.charAt(0).toUpperCase() + term.slice(1)}
                  </span>
                ),
            )}
          </div>
        )}
        <div>
          <button
            className="text-xs text-blue-500 underline cursor-pointer"
            onClick={() => setShowEdit(!showEdit)}
          >
            Edit
          </button>
        </div>
      </div>

      {/* Edit */}
      <div
        className={`rounded-lg shadow-xl border-1 border-[#0001] transition-all duration-300 ${
          showEdit
            ? "p-2 opacity-100 max-h-96"
            : "opacity-0 max-h-0 overflow-hidden"
        }`}
      >
        {/* City Input */}
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City:
          </label>
          <input
            type="text"
            className="w-full px-3 py-1 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-700 focus:border-gray-700 text-sm font-semibold"
            placeholder="Ex Medellín"
            onKeyDown={handleKeyDown}
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>

        {/* Filters input */}
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {getFilterLabel()}
          </label>
          <input
            type="text"
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            className="w-full px-3 py-1 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-700 focus:border-gray-700 text-sm font-semibold"
            placeholder="Ex Prosegur, Recepcionista, Vigilante"
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Save button */}
        <button
          className="text-sm bg-[#5e3fa6] text-white px-4 py-1.5 rounded-md hover:bg-[#7c5dc4]/90 transition-colors font-medium cursor-pointer transition-all duration-200"
          onClick={handleSearch}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default SearchSection;
