import React, { useEffect } from "react";

export default function Paso2({
  formData,
  setFormData,
  objetos,
  handleSubmitHeader,
  isHeaderLocked,
  selectedEmpresa,
  empresas,
  handleCancel,
  aceptaValorCero
}) {

  // Recalcular FechaTerminacion automáticamente según días, meses y años
  useEffect(() => {
    const { FechaSuscripcion, PlazoDias, PlazoMeses, PlazoAnios, EsIndefinido } = formData;

    if (!FechaSuscripcion) return;

    if (EsIndefinido) {
      setFormData(prev => ({
        ...prev,
        FechaTerminacion: "",
        PlazoAnios: "",
        PlazoDias: "",
        PlazoMeses: "",
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

  }, [formData.FechaSuscripcion, formData.PlazoDias, formData.PlazoMeses, formData.PlazoAnios, formData.EsIndefinido, setFormData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header text-dark d-flex justify-content-between align-items-center" style={{ backgroundColor: "#DFE9F7" }}>
        <h5 className="mb-0">Paso 2: Información del Contrato</h5>
        {!isHeaderLocked && (
          <button className="btn btn-sm btn-outline-dark" onClick={handleCancel}>
            Cambiar empresa
          </button>
        )}
      </div>
      <div className="card-body p-4">
        <div className="alert alert-info mb-4">
          <strong>Empresa seleccionada:</strong> {empresas.find(e => e.IdEmpresa == selectedEmpresa)?.Descripcion}
        </div>

        {objetos.length === 0 ? (
          <div className="alert alert-warning">
            Esta empresa no tiene objetos activos.
          </div>
        ) : (
          <form onSubmit={handleSubmitHeader}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Objeto del Contrato:</label>
                <select
                  name="IdObjeto"
                  value={formData.IdObjeto}
                  onChange={handleChange}
                  className="form-select"
                  required
                  disabled={isHeaderLocked}
                >
                  <option value="">-- Seleccione --</option>
                  {objetos.map(o => (
                    <option key={o.IdObjeto} value={o.IdObjeto}>{o.Descripcion}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Valor:</label>
                <div className="input-group">
                  <span className="input-group-text">$</span>
                  <input
                    type="number"
                    name="Valor"
                    value={formData.Valor}
                    onChange={handleChange}
                    className="form-control"
                    required
                    min={aceptaValorCero ? 0 : 1}
                    max={2147483647}
                    step="1.00"
                    disabled={isHeaderLocked}
                  />
                </div>
                {!aceptaValorCero && <small className="text-muted">Este objeto no permite valor 0</small>}
              </div>

              <div className="col-12 mb-3">
                <label className="form-label fw-bold">Contraparte:</label>
                <input
                  type="text"
                  name="Contraparte"
                  maxLength={255}
                  value={formData.Contraparte}
                  onChange={handleChange}
                  className="form-control"
                  required
                  disabled={isHeaderLocked}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Fecha de Pedido:</label>
                <input
                  type="date"
                  name="FechaPedido"
                  value={formData.FechaPedido}
                  onChange={handleChange}
                  className="form-control"
                  required
                  disabled={isHeaderLocked}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Fecha de Suscripción:</label>
                <input
                  type="date"
                  name="FechaSuscripcion"
                  value={formData.FechaSuscripcion}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Plazo:</label>
                <div className="d-flex gap-2">
                  <input
                    type="number"
                    name="PlazoDias"
                    value={formData.PlazoDias || ""}
                    onChange={handleChange}
                    className="form-control"
                    min="0"
                    placeholder="Días"
                    disabled={formData.EsIndefinido || isHeaderLocked}
                  />
                  <input
                    type="number"
                    name="PlazoMeses"
                    value={formData.PlazoMeses || ""}
                    onChange={handleChange}
                    className="form-control"
                    min="0"
                    placeholder="Meses"
                    disabled={formData.EsIndefinido || isHeaderLocked}
                  />
                  <input
                    type="number"
                    name="PlazoAnios"
                    value={formData.PlazoAnios || ""}
                    onChange={handleChange}
                    className="form-control"
                    min="0"
                    placeholder="Años"
                    disabled={formData.EsIndefinido || isHeaderLocked}
                  />
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Fecha de Terminación:</label>
                <input
                  type="date"
                  name="FechaTerminacion"
                  value={formData.FechaTerminacion || ""}
                  className="form-control"
                  disabled
                />
              </div>

              <div className="col-md-6 mb-3">
                <div className="form-check">
                  <input
                    type="checkbox"
                    name="EsIndefinido"
                    checked={formData.EsIndefinido}
                    onChange={handleChange}
                    className="form-check-input"
                    id="indefinidoCheck"
                    disabled={isHeaderLocked}
                  />
                  <label className="form-check-label fw-bold" htmlFor="indefinidoCheck">
                    Contrato indefinido
                  </label>
                </div>
              </div>
            </div>

            {!isHeaderLocked && (
              <div className="text-end mt-4">
                <button type="submit" className="btn btn-primary btn-md">
                  Crear Cabecera del Contrato
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
