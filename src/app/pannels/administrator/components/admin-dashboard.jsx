import { useEffect, useState } from "react";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";

const apiUrl = process.env.REACT_APP_API_URL;

function AdminDashboardPage() {
  const [metricas, setMetricas] = useState({});
  const [contratosPorMes, setContratosPorMes] = useState([]);
  const [topColaboradores, setTopColaboradores] = useState([]);
  const [contratosPorVencer, setContratosPorVencer] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const fetchOptions = {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
        };
        const [metricsRes, monthlyRes, collaboratorsRes, expiringRes] = await Promise.all([
          fetch(`${apiUrl}/portal_contratos/dashboard/ObtenerMetricasGenerales`, fetchOptions),
          fetch(`${apiUrl}/portal_contratos/dashboard/ObtenerNumeroContratosPorMes`, fetchOptions),
          fetch(`${apiUrl}/portal_contratos/dashboard/ObtenerTopColaboradores`, fetchOptions),
          fetch(`${apiUrl}/portal_contratos/dashboard/ObtenerContratosPorVencer`, fetchOptions)
        ]);
        setMetricas(await metricsRes.json());
        setContratosPorMes(await monthlyRes.json());
        setTopColaboradores(await collaboratorsRes.json());
        setContratosPorVencer(await expiringRes.json());
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const estadosData = [
    { name: "No Iniciado", value: metricas.NoIniciado || 0, color: "#6b7280" },
    { name: "Vigente", value: metricas.Vigente || 0, color: "#10b981" },
    { name: "Finalizado", value: metricas.Finalizado || 0, color: "#3b82f6" },
    { name: "Por Vencer", value: metricas.ContratosPorVencer || 0, color: "#f59e0b" },
    { name: "En proceso", value: metricas.ContratosSinFirmar || 0, color: "#ef4444" }
  ];

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const getDaysUntilExpiry = (dateString) => Math.ceil((new Date(dateString) - new Date()) / (1000 * 60 * 60 * 24));

  const getExpiryChipClasses = (days) => {
    if (days < 0 || days <= 7) return "chip chip-expired";
    if (days <= 30) return "chip chip-warning";
    return "chip chip-ok";
  };

  const getExpiryLabel = (days) => days < 0 ? `Vencido (${Math.abs(days)}d)` : days === 0 ? "Vence hoy" : `${days} días`;

  if (loading) return <div className="loading">Cargando dashboard...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-wrapper">

        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
          </div>
          <div className="header-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="kpi-grid">
          {[
            { label: "Total Contratos", value: metricas.TotalContratos || 0, bg: "bg-blue", icon: (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '20px', height: '20px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ) },
            { label: "Vigentes", value: metricas.Vigente || 0, bg: "bg-green", icon: (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '20px', height: '20px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) },
            { label: "Por Vencer", value: metricas.ContratosPorVencer || 0, bg: "bg-yellow", icon: (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '20px', height: '20px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              ) },
            { label: "En proceso", value: metricas.ContratosSinFirmar || 0, bg: "bg-red", icon: (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '20px', height: '20px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              ) },
            { label: "Finalizados", value: metricas.Finalizado || 0, bg: "bg-gray", icon: (
                <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M6 3C4.34315 3 3 4.34315 3 6V18C3 19.6569 4.34315 21 6 21H18C19.6569 21 21 19.6569 21 18V6C21 4.34315 19.6569 3 18 3H6ZM17.8 8.6C18.1314 8.15817 18.0418 7.53137 17.6 7.2C17.1582 6.86863 16.5314 6.95817 16.2 7.4L10.8918 14.4776L8.70711 12.2929C8.31658 11.9024 7.68342 11.9024 7.29289 12.2929C6.90237 12.6834 6.90237 13.3166 7.29289 13.7071L10.2929 16.7071C10.4979 16.9121 10.7817 17.018 11.0709 16.9975C11.3601 16.9769 11.6261 16.8319 11.8 16.6L17.8 8.6Z" fill="#000000"/>
                </svg>
              ) },
            { label: "Este Mes", value: metricas.ContratosIniciadosEsteMes || 0, bg: "bg-purple", icon: (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '20px', height: '20px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              ) }
          ].map((kpi, i) => (
            <div key={i} className={`kpi-card ${kpi.bg}`}>
              <div className="kpi-info">
                <p>{kpi.label}</p>
                <p>{kpi.value}</p>
              </div>
              <div className="kpi-icon">{kpi.icon}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="chart-grid">
          <div className="chart-card">
            <h3>Distribución por Estado</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={estadosData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}>
                  {estadosData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Tendencia Mensual de Contratos</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={contratosPorMes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="NombreMes" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="TotalContratos" stroke="#3b82f6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Top Colaboradores por Contratos</h3>
            {topColaboradores.length === 0 ? (
              <div className="no-data">No hay datos de colaboradores disponibles</div>
            ) : (
              <div className="top-colaboradores">
                {topColaboradores.map((c, idx) => {
                  const max = Math.max(...topColaboradores.map(t => t.TotalContratos));
                  const perc = (c.TotalContratos / max) * 100;
                  return (
                    <div key={idx} className="colaborador-bar">
                      <div className="colaborador-label">
                        <span>{c.Responsable}</span>
                        <span>{c.TotalContratos}</span>
                      </div>
                      <div className="colaborador-progress">
                        <div className="colaborador-fill" style={{ width: `${perc}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Tabla de contratos por vencer */}
        <div className="table-card">
          <div className="table-header">
            <h3>Contratos Próximos a Vencer <span>{contratosPorVencer.length}</span></h3>
          </div>
          {contratosPorVencer.length === 0 ? (
            <div className="no-data">No hay contratos próximos a vencer</div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Contraparte</th>
                    <th>Descripción</th>
                    <th>Responsable</th>
                    <th>Fecha Terminación</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {contratosPorVencer.map((c, i) => {
                    const days = getDaysUntilExpiry(c.FechaTerminacion);
                    return (
                      <tr key={i}>
                        <td>{c.Contraparte}</td>
                        <td>{c.Descripcion}</td>
                        <td>{c.ApellidosNombres}</td>
                        <td>{formatDate(c.FechaTerminacion)}</td>
                        <td><span className={getExpiryChipClasses(days)}>{getExpiryLabel(days)}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default AdminDashboardPage;
