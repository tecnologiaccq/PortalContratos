import React from "react";

export default function Paso4({ contratoGenerado, handleNuevoContrato }) {
  return (
    <div className="card shadow-sm">
      <div className="card-header text-dark" style={{ backgroundColor: "#DFE9F7" }}>
        <h5>¡Contrato Generado Exitosamente!</h5>
      </div>
      <div className="card-body p-5 text-center">
        <p>{contratoGenerado.Mensaje}</p>
        <a
          href={contratoGenerado.UrlPdfAzure}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-danger btn-lg mb-3"
        >
          Ver Contrato
        </a>
        <button className="btn btn-primary btn-lg" onClick={handleNuevoContrato}>
          Crear Nuevo Contrato
        </button>
      </div>
    </div>
  );
}
