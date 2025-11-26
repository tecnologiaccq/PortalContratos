import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

const apiUrl = process.env.REACT_APP_API_URL;

export default function CrearContratoSimplificadoPage() {
  const [empresas, setEmpresas] = useState([]);
  const [objetos, setObjetos] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState("");
  const [archivoPDF, setArchivoPDF] = useState(null);
  const [archivoWord, setArchivoWord] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    IdObjeto: "",
    IdColaboradorResponsable: "",
    Contraparte: "",
    FechaPedido: "",
    FechaSuscripcion: "",
    FechaTerminacion: "",
    PlazoDias: "",
    PlazoMeses: "",
    PlazoAnios: "",
    IdEmpresa: "",
    EsIndefinido: false,
    Valor: "",
  });

  // Cargar empresas y colaboradores
  useEffect(() => {
    fetch(`${apiUrl}/portal_contratos/GestionEmpresa/Obtener`, {
      method: "POST",
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => setEmpresas(data))
      .catch(() => Swal.fire("Error", "No se pudieron cargar las empresas", "error"));

    fetch(`${apiUrl}/portal_contratos/catalogos/ObtenerCatColaboradores`, {
      method: "POST",
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => setColaboradores(data))
      .catch(() => Swal.fire("Error", "No se pudieron cargar los colaboradores", "error"));
  }, []);

  // Cargar objetos según empresa seleccionada
  useEffect(() => {
    if (!selectedEmpresa) return;
    fetch(`${apiUrl}/portal_contratos/objeto/ObtenerObjetosActivosPorEmpresa/${selectedEmpresa}`, {
      method: "POST",
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => setObjetos(data))
      .catch(() => Swal.fire("Error", "No se pudieron cargar los objetos", "error"));
  }, [selectedEmpresa]);

  // Calcular automáticamente FechaTerminacion
  useEffect(() => {
    const { FechaSuscripcion, PlazoDias, PlazoMeses, PlazoAnios, EsIndefinido } = formData;

    if (!FechaSuscripcion) return;

    if (EsIndefinido) {
      setFormData(prev => ({
        ...prev,
        FechaTerminacion: "",
        PlazoDias: 0,
        PlazoMeses: 0,
        PlazoAnios: 0,
      }));
      return;
    }

    const inicio = new Date(FechaSuscripcion);
    const fin = new Date(inicio);

    if (PlazoDias) fin.setDate(fin.getDate() + Number(PlazoDias));
    if (PlazoMeses) fin.setMonth(fin.getMonth() + Number(PlazoMeses));
    if (PlazoAnios) fin.setFullYear(fin.getFullYear() + Number(PlazoAnios));

    setFormData(prev => ({
      ...prev,
      FechaTerminacion: fin.toISOString().split("T")[0],
    }));
  }, [formData.FechaSuscripcion, formData.PlazoDias, formData.PlazoMeses, formData.PlazoAnios, formData.EsIndefinido]);

  // Manejo general de inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Manejo de archivo PDF
  const handleFilePDF = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== "application/pdf") {
      Swal.fire("Archivo inválido", "Solo se permiten archivos PDF", "warning");
      e.target.value = null;
      return;
    }
    setArchivoPDF(file);
  };

  // Manejo de archivo Word
  const handleFileWord = (e) => {
    const file = e.target.files[0];
    if (file && !["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.type)) {
      Swal.fire("Archivo inválido", "Solo se permiten archivos Word (.doc o .docx)", "warning");
      e.target.value = null;
      return;
    }
    setArchivoWord(file);
  };

  // Enviar datos al API
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar campos obligatorios (sin exigir archivos)
    const camposRequeridos = [
      "IdEmpresa", "IdObjeto", "IdColaboradorResponsable", "Contraparte", "FechaPedido", "FechaSuscripcion", "Valor"
    ];
    const faltantes = camposRequeridos.filter(c => !formData[c]);
    if (faltantes.length > 0) {
      Swal.fire("Campos incompletos", `Faltan: ${faltantes.join(", ")}`, "warning");
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();

      for (const key in formData) {
        data.append(key, formData[key] ?? "");
      }

      // Agregar archivos solo si existen
      if (archivoPDF) data.append("ArchivoPDF", archivoPDF);
      if (archivoWord) data.append("ArchivoWord", archivoWord);

      const response = await fetch(`${apiUrl}/portal_contratos/contratos/AgregarContratoSimplificado`, {
        method: "POST",
        body: data,
        credentials: "include",
      });

      if (!response.ok) throw new Error(await response.text());

      Swal.fire("Éxito", "Contrato creado correctamente", "success");

      // Reset del formulario
      setFormData({
        IdObjeto: "",
        IdColaboradorResponsable: "",
        Contraparte: "",
        FechaPedido: "",
        FechaSuscripcion: "",
        FechaTerminacion: "",
        PlazoDias: "",
        PlazoMeses: "",
        PlazoAnios: "",
        IdEmpresa: "",
        EsIndefinido: false,
        Valor: "",
      });
      setArchivoPDF(null);
      setArchivoWord(null);
      setSelectedEmpresa("");
    } catch (err) {
      Swal.fire("Error", err.message || "No se pudo crear el contrato", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm">
        <div className="card-header text-white" style={{ backgroundColor: "#000fa0" }}>
          <h5 className="mb-0">Crear Contrato Simplificado</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>

            {/* EMPRESA */}
            <div className="mb-3">
              <label className="form-label fw-bold">Empresa</label>
              <select
                className="form-select"
                value={selectedEmpresa}
                onChange={(e) => {
                  setSelectedEmpresa(e.target.value);
                  setFormData(prev => ({ ...prev, IdEmpresa: e.target.value }));
                }}
                required
              >
                <option value="">-- Seleccione --</option>
                {empresas.map(emp => (
                  <option key={emp.IdEmpresa} value={emp.IdEmpresa}>{emp.Descripcion}</option>
                ))}
              </select>
            </div>

            {/* OBJETO */}
            <div className="mb-3">
              <label className="form-label fw-bold">Objeto del Contrato</label>
              <select
                name="IdObjeto"
                className="form-select"
                value={formData.IdObjeto}
                onChange={handleChange}
                required
              >
                <option value="">-- Seleccione --</option>
                {objetos.map(o => (
                  <option key={o.IdObjeto} value={o.IdObjeto}>{o.Descripcion}</option>
                ))}
              </select>
            </div>

            {/* COLABORADOR RESPONSABLE */}
            <div className="mb-3">
              <label className="form-label fw-bold">Colaborador Responsable</label>
              <select
                name="IdColaboradorResponsable"
                className="form-select"
                value={formData.IdColaboradorResponsable}
                onChange={handleChange}
                required
              >
                <option value="">-- Seleccione --</option>
                {colaboradores.map(c => (
                  <option key={c.IdColaborador} value={c.IdColaborador}>
                    {c.ApellidosNombres}
                  </option>
                ))}
              </select>
            </div>

           {/* CAMPOS GENERALES */}
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Contraparte</label>
                <input
                  type="text"
                  name="Contraparte"
                  className="form-control"
                  value={formData.Contraparte}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Valor</label>
                <input
                  type="number"
                  name="Valor"
                  className="form-control"
                  value={formData.Valor}
                  onChange={handleChange}
                  required
                  min={0}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Fecha de Pedido</label>
                <input
                  type="date"
                  name="FechaPedido"
                  className="form-control"
                  value={formData.FechaPedido}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Fecha de Suscripción</label>
                <input
                  type="date"
                  name="FechaSuscripcion"
                  className="form-control"
                  value={formData.FechaSuscripcion}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* PLAZO */}
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Plazo</label>
                <div className="d-flex gap-2">
                  <input
                    type="number"
                    name="PlazoDias"
                    className="form-control"
                    placeholder="Días"
                    min="0"
                    value={formData.PlazoDias}
                    onChange={handleChange}
                    disabled={formData.EsIndefinido}
                  />
                  <input
                    type="number"
                    name="PlazoMeses"
                    className="form-control"
                    placeholder="Meses"
                    min="0"
                    value={formData.PlazoMeses}
                    onChange={handleChange}
                    disabled={formData.EsIndefinido}
                  />
                  <input
                    type="number"
                    name="PlazoAnios"
                    className="form-control"
                    placeholder="Años"
                    min="0"
                    value={formData.PlazoAnios}
                    onChange={handleChange}
                    disabled={formData.EsIndefinido}
                  />
                </div>
              </div>

              {/* CONTRATO INDEFINIDO */}
              <div className="col-md-6 mb-3">
                <div className="form-check mt-4">
                  <input
                    type="checkbox"
                    name="EsIndefinido"
                    className="form-check-input"
                    id="indefinidoCheck"
                    checked={formData.EsIndefinido}
                    onChange={handleChange}
                  />
                  <label className="form-check-label fw-bold" htmlFor="indefinidoCheck">
                    Contrato indefinido
                  </label>
                </div>
              </div>

              {/* FECHA DE TERMINACIÓN */}
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Fecha de Terminación</label>
                <input
                  type="date"
                  name="FechaTerminacion"
                  className="form-control"
                  value={formData.FechaTerminacion || ""}
                  disabled
                />
              </div>
            </div>
            {/* ARCHIVOS OPCIONALES */}
            <div className="mb-3">
              <label className="form-label fw-bold">Archivo del contrato (PDF)</label>
              <input
                type="file"
                accept="application/pdf"
                className="form-control"
                onChange={handleFilePDF}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Archivo del contrato (Word)</label>
              <input
                type="file"
                accept=".doc,.docx"
                className="form-control"
                onChange={handleFileWord}
              />
            </div>

            <div className="text-end">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Creando..." : "Crear Contrato"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
