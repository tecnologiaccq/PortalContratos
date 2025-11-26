import React from "react";

export default function Paso3({ camposContrato, handleCampoChange, handleSubmitCampos, isSubmittingCampos }) {
  return (
    <div className="card shadow-sm">
      <div className="card-header text-dark" style={{ backgroundColor: "#DFE9F7" }}>
        <h5>Paso 3: Complete los Campos Específicos del Contrato</h5>
      </div>
      <div className="card-body p-4">
        <div className="row">
          {camposContrato.map((campo) => (
            <div className="col-md-6 mb-4" key={campo.IdCampoContrato}>
              <label className="form-label fw-bold">{campo.NombreCampo}</label>
              {campo.Descripcion && <small className="d-block mb-1">{campo.Descripcion}</small>}
                        {campo.ExplicacionTecnica && (
                          <div style={{
                            backgroundColor: "#fffeccff",
                            padding: "10px 15px",
                            borderRadius: "4px",
                            marginBottom: "16px"
                          }}>
                            <small style={{ display: "block", color: "#333" }}>
                              {campo.ExplicacionTecnica}
                            </small>
                          </div>
                        )}
              <input
                type="text"
                className="form-control"
                maxLength={512}
                value={campo.Dato || ""}
                onChange={(e) => handleCampoChange(campo.IdCampoContrato, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="text-center mt-4">
          <button
            type="button"
            className="btn btn-primary btn-lg px-5"
            onClick={handleSubmitCampos}
            disabled={isSubmittingCampos}
          >
            {isSubmittingCampos ? "Guardando..." : "Finalizar Contrato"}
          </button>
        </div>
      </div>
    </div>
  );
}
