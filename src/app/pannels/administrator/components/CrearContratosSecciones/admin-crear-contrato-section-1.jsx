import React from "react";

export default function Paso1({ empresas, selectedEmpresa, onSelectEmpresa }) {
  return (
    <div className="card shadow-sm">
      <div className="card-header text-dark" style={{ backgroundColor: "#DFE9F7" }}>
        <h5 className="mb-0">Paso 1: Seleccionar Empresa</h5>
      </div>
      <div className="card-body p-4">
        <label className="form-label fw-bold">Empresa:</label>
        <select
          className="form-select"
          onChange={(e) => onSelectEmpresa(e.target.value)}
          value={selectedEmpresa || ""}
        >
          <option value="">-- Seleccione una empresa --</option>
          {empresas.map((e) => (
            <option key={e.IdEmpresa} value={e.IdEmpresa}>
              {e.Descripcion}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
