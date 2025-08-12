import { useEffect, useState } from "react";
import { getMatches, MatchDTO } from "../../api/matches";

export default function PublicCalendarPanel() {
  const [matches, setMatches] = useState<MatchDTO[]>([]);
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    (async () => {
      const data = await getMatches();
      setMatches(data.filter((m) => m.status === "PENDING"));
    })();
  }, []);

  const filteredMatches = matches.filter(
    (m) => !dateFilter || m.date === dateFilter
  );

  return (
    <div className="max-w-6xl mx-auto p-3 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center">
        Calendario de Partidos
      </h1>

      {/* Filtro por día */}
      <div className="flex flex-col sm:flex-row justify-end items-center mb-4 gap-2">
        <input
          type="date"
          className="border rounded px-3 py-2 text-gray-800 w-full sm:w-auto"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          style={{ minWidth: 160 }}
        />
        {dateFilter && (
          <button
            className="px-3 py-2 bg-gray-300 rounded text-gray-700 hover:bg-gray-400 w-full sm:w-auto"
            onClick={() => setDateFilter("")}
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Contenedor con scroll (Y) y scroll horizontal de respaldo */}
      <div className="overflow-x-auto sm:overflow-x-visible max-h-[65vh] sm:max-h-none overflow-y-auto rounded-xl">
        <table className="min-w-full border-collapse border border-gray-700 text-black table-fixed">
          <thead className="bg-[#1f3a45] text-sm md:text-lg text-white sticky top-0 z-10">
            <tr>
              <th className="p-2 md:p-3 border border-gray-700 text-left w-[7.5rem] sm:w-auto">
                Fecha
              </th>
              <th className="p-2 md:p-3 border border-gray-700 text-center w-[7.5rem] sm:w-auto">
                Hora
              </th>
              <th className="p-2 md:p-3 border border-gray-700 text-left">
                Local
              </th>
              <th className="p-2 md:p-3 border border-gray-700 text-left">
                Visitante
              </th>
              <th className="p-2 md:p-3 border border-gray-700 text-left w-[6.5rem] sm:w-auto">
                Lugar
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredMatches.map((match) => (
              <tr key={match.id} className="hover:bg-[#f3f4f6]">
                {/* Fecha sin cortes */}
                <td className="p-2 md:p-3 border border-gray-700 text-left whitespace-nowrap">
                  {match.date}
                </td>

                {/* Hora sin cortes */}
                <td className="p-2 md:p-3 border border-gray-700 text-center whitespace-nowrap">
                  {match.startTime.slice(0, 5)} - {match.endTime.slice(0, 5)}
                </td>

                {/* Nombres largos: truncar en móvil */}
                <td className="p-2 md:p-3 border border-gray-700 text-left">
                  <span className="block truncate max-w-[10rem] sm:max-w-none">
                    {match.homeTeamName}
                  </span>
                </td>
                <td className="p-2 md:p-3 border border-gray-700 text-left">
                  <span className="block truncate max-w-[10rem] sm:max-w-none">
                    {match.awayTeamName}
                  </span>
                </td>

                {/* Lugar con truncado en móvil */}
                <td className="p-2 md:p-3 border border-gray-700 text-left">
                  <span className="block truncate max-w-[8rem] sm:max-w-none">
                    {match.location}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredMatches.length === 0 && (
        <p className="text-center text-gray-400 mt-10">
          No hay partidos para ese día.
        </p>
      )}
    </div>
  );
}
