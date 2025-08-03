import { useEffect, useState, useMemo } from "react";
import { getMatches, MatchDTO } from "../../api/matches";
import DataTable from "../../components/DataTable";
import FilterBar from "../../components/FilterBar";
import StatusBadge from "../../components/StatusBadge";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import { jwtDecode } from "jwt-decode";

const locales = { es };

const localizer = dateFnsLocalizer({
  format: (date: Date, _formatStr: string, _culture?: string) =>
    format(date, _formatStr, { locale: es }),
  parse: (value: string, _formatStr: string) => parse(value, _formatStr, new Date(), { locale: es }),
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1, locale: es }),
  getDay,
  locales,
});

type CalendarView = "month" | "agenda";
type CustomView = "tabla" | CalendarView;

export type CalendarEvent = {
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource: MatchDTO;
};

interface TokenPayload {
  sub: string;
  role: string;
}

function formatTime(time: string) {
  return time.slice(0, 5);
}

export default function MatchesPublic() {
  const [matches, setMatches] = useState<MatchDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<CustomView>("tabla");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchDTO | null>(null);

  const token = localStorage.getItem("token");
  let role = "";
  if (token) {
    const payload: TokenPayload = jwtDecode(token);
    role = payload.role;
  }

  useEffect(() => {
    getMatches()
      .then((data) => {
        const sortedMatches = data.sort((a, b) => {
          if (a.status === "PENDING" && b.status !== "PENDING") return -1;
          if (a.status !== "PENDING" && b.status === "PENDING") return 1;
          return 0;
        });

        setMatches(sortedMatches);
        setLoading(false);

        // Para el calendario
        const calendarEvents: CalendarEvent[] = sortedMatches.map((match) => ({
          title: `${match.homeTeamName} vs ${match.awayTeamName} (${match.location})`,
          start: new Date(`${match.date}T${match.startTime}`),
          end: new Date(`${match.date}T${match.endTime}`),
          allDay: false,
          resource: match,
        }));
        setEvents(calendarEvents);
      })
      .catch(() => setLoading(false));
  }, []);

  // Filtro
  const filtered = useMemo(() => {
    return matches.filter(
      (m) =>
        m.homeTeamName.toLowerCase().includes(search.toLowerCase()) ||
        m.awayTeamName.toLowerCase().includes(search.toLowerCase()) ||
        m.location.toLowerCase().includes(search.toLowerCase()) ||
        m.date.includes(search)
    );
  }, [search, matches]);

  // Columnas para DataTable
  const columns = [
    { key: "date", label: "Fecha", sortable: true, align: "center" as const },
    { key: "time", label: "Hora", sortable: false, align: "center" as const,
      render: (_: any, row: MatchDTO) => `${formatTime(row.startTime)} - ${formatTime(row.endTime)}` },
    { key: "homeTeamName", label: "Local", sortable: true, align: "center" as const },
    { key: "awayTeamName", label: "Visitante", sortable: true, align: "center" as const },
    { key: "location", label: "Lugar", sortable: true, align: "center" as const },
    {
      key: "status", label: "Estado", sortable: true, align: "center" as const,
      render: (value: string) => <StatusBadge status={value} size="sm" />
    },
    ...(role === "MESA" ? [{
      key: "action",
      label: "Acción",
      align: "center" as const,
      sortable: false,
      render: (_: any, row: MatchDTO) =>
        row.status === "PENDING" ? (
          <a href={`/my-matches/${row.id}/events`}>
            <button className="btn-primary btn-xs">
              📝 Registrar eventos
            </button>
          </a>
        ) : "-"
    }] : [])
  ];

  if (loading) return <div className="text-center mt-6">Cargando partidos...</div>;

  return (
    <div className="max-w-5xl mx-auto my-8 p-0 bg-transparent relative">
      {/* CABECERA */}
      <div
        className="rounded-t-2xl"
        style={{
          background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #1e3c72 100%)",
          padding: "2.2rem 2rem 2.6rem 2rem",
          margin: "-1.5rem -1.5rem 0 -1.5rem",
          borderTopLeftRadius: "1.25rem",
          borderTopRightRadius: "1.25rem",
          textAlign: "center"
        }}
      >
        <h2 className="text-2xl font-bold text-white drop-shadow mb-2" style={{ letterSpacing: 0.5 }}>
          Programación de Partidos
        </h2>

        {/* Toggle Tabs */}
        <div className="flex justify-center gap-4 mt-4 mb-2">
  <button
    className={`btn-primary px-7 py-2 rounded-full font-bold text-base shadow transition-all duration-200
      ${view === "tabla"
        ? "bg-gradient-to-r from-blue-600 to-blue-400 text-white border-0 scale-105 shadow-lg"
        : "bg-white text-blue-700 border-2 border-blue-600"
      }`}
    style={{
      minWidth: 120,
      outline: "none",
    }}
    onClick={() => setView("tabla")}
  >
    Tabla
  </button>
  <button
    className={`btn-primary px-7 py-2 rounded-full font-bold text-base shadow transition-all duration-200
      ${view === "month"
        ? "bg-gradient-to-r from-blue-600 to-blue-400 text-white border-0 scale-105 shadow-lg"
        : "bg-white text-blue-700 border-2 border-blue-600"
      }`}
    style={{
      minWidth: 120,
      outline: "none",
    }}
    onClick={() => setView("month")}
  >
    Calendario
  </button>
  
</div>
  <div className="mb-4 flex justify-end mt-[-30px] justify-center">
        <div className="w-full max-w-xs ml-auto">
          <FilterBar
            searchTerm={search}
            onSearchChange={setSearch}
            searchPlaceholder="Buscar por equipo, lugar o fecha"
            filters={[]}
            onClear={() => setSearch("")}
          />
        </div>
      </div>
      </div>


      {/* TABLA */}
      {view === "tabla" && (
        <div className="overflow-x-auto pb-10">
          <DataTable
            data={filtered}
            columns={columns}
            loading={false}
            emptyMessage="No se encontraron partidos disponibles"
            hoverable
            striped
          />
        </div>
      )}

      {/* CALENDARIO */}
      {view !== "tabla" && (
        <div className="bg-white rounded-2xl p-4 mt-2">
          <Calendar
            culture="es"
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            view={view}
            onView={(newView: CalendarView) => setView(newView)}
            date={currentDate}
            onNavigate={(date: Date) => setCurrentDate(date)}
            messages={{
              next: "Sig",
              previous: "Ant",
              today: "Hoy",
              month: "Mes",
              agenda: "Agenda",
              date: "Fecha",
              time: "Hora",
              event: "Evento",
              allDay: "Todo el día",
              noEventsInRange: "No hay partidos en este rango",
              showMore: (total: number) => `+ Ver más (${total})`,
            }}
            views={["month", "agenda"]}
            popup={true}
            eventPropGetter={(event: CalendarEvent) => {
              const bgColor =
                event.resource.status === "PENDING"
                  ? "#FACC15"
                  : event.resource.status === "COMPLETED"
                  ? "#22C55E"
                  : "#EF4444";
              return {
                style: {
                  backgroundColor: bgColor,
                  color: "black",
                  borderRadius: 6,
                  padding: "1px 2px",
                  fontWeight: 500,
                  fontSize: "0.78rem",
                },
              };
            }}
            tooltipAccessor={(event: CalendarEvent) =>
              `${event.resource.homeTeamName} vs ${event.resource.awayTeamName}\n${formatTime(event.resource.startTime)} - ${formatTime(event.resource.endTime)}\n${event.resource.location}`
            }
          />
        </div>
      )}

      {/* MODAL DETALLE DE PARTIDO */}
      {modalOpen && selectedMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 font-bold text-xl"
              onClick={() => setModalOpen(false)}
              aria-label="Cerrar modal"
            >
              ×
            </button>
            <h3 className="text-xl font-bold mb-4">
              {selectedMatch.homeTeamName} vs {selectedMatch.awayTeamName}
            </h3>
            <p><strong>Fecha:</strong> {selectedMatch.date}</p>
            <p><strong>Hora:</strong> {formatTime(selectedMatch.startTime)} - {formatTime(selectedMatch.endTime)}</p>
            <p><strong>Lugar:</strong> {selectedMatch.location}</p>
            <p><strong>Estado:</strong> <StatusBadge status={selectedMatch.status} size="sm" /></p>
          </div>
        </div>
      )}
    </div>
  );
}
