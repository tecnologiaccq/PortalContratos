import { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Snackbar, Alert } from "@mui/material";

const apiUrl = process.env.REACT_APP_API_URL;

export default function EditarCamposModal({ open, onClose, contrato, idContrato, idObjeto, onSuccess, onError }) {
  const [camposContrato, setCamposContrato] = useState([]);
  const [isSubmittingCampos, setIsSubmittingCampos] = useState(false);
  const [formData, setFormData] = useState({ IdObjeto: null });

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Obtener campos al abrir modal
  useEffect(() => {
    //console.log('Datos recibidos:', { contrato, idContrato, idObjeto });
    
    if (!idContrato || !open) return;

    const fetchCampos = async () => {
      try {
        const res = await fetch(`${apiUrl}/portal_contratos/campos_contrato/ObtenerCamposPorContrato/${idContrato}`, {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Error al obtener campos del contrato");
        const data = await res.json();
        setCamposContrato(data);
        if (data.length > 0) setFormData({ IdObjeto: data[0].IdObjeto || idObjeto });
      } catch (err) {
        const errorMessage = "No se pudieron cargar los campos del contrato";
        setSnackbar({ open: true, message: errorMessage, severity: "error" });
        // También notificar al padre si se proporciona el callback
        if (onError) onError(errorMessage);
      }
    };

    fetchCampos();
  }, [idContrato, open, idObjeto, onError]);

  // Actualizar valores de campos dinámicos
  const handleCampoChange = (idCampo, value) => {
    setCamposContrato(prev =>
      prev.map(c => (c.IdCampoContrato === idCampo ? { ...c, Dato: value } : c))
    );
  };

  // Guardar campos
  const handleSubmitCampos = async () => {
    if (!idContrato || !formData.IdObjeto) {
      const errorMessage = "Faltan datos necesarios para guardar";
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
      if (onError) onError(errorMessage);
      return;
    }

    const camposVacios = camposContrato.filter(c => !c.Dato || c.Dato.trim() === "");
    if (camposVacios.length > 0) {
      const errorMessage = "Todos los campos son obligatorios";
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
      if (onError) onError(errorMessage);
      return;
    }

    setIsSubmittingCampos(true);

    try {
      const camposData = camposContrato.map(c => ({
        IdCampoContrato: c.IdCampoContrato,
        IdContrato: idContrato,
        IdCampoObjeto: c.IdCampoObjeto,
        Dato: c.Dato
      }));

      const res = await fetch(`${apiUrl}/portal_contratos/campos_contrato/CrearContrato/${formData.IdObjeto}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(camposData),
      });

      if (!res.ok) throw new Error("Error al guardar los campos del contrato");

      const successMessage = "Campos del contrato actualizados correctamente";
      
      
      if (onSuccess) onSuccess(successMessage);
      
      setTimeout(() => {
        onClose(true); 
      }, 1500);

    } catch (err) {
      const errorMessage = "No se pudieron guardar los campos del contrato";
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
      if (onError) onError(errorMessage);
    } finally {
      setIsSubmittingCampos(false);
    }
  };

  const handleClose = (shouldRefresh = false) => {
    setCamposContrato([]);
    setFormData({ IdObjeto: null });
    setSnackbar({ open: false, message: "", severity: "success" });
    onClose(shouldRefresh);
  };

  return (
    <>
      <Dialog open={open} onClose={() => handleClose(false)} maxWidth="md" fullWidth>
        <DialogTitle>Editar Campos del Contrato</DialogTitle>
        <DialogContent>
          {camposContrato.length === 0 ? (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              {isSubmittingCampos ? "Cargando campos..." : "No hay campos para este contrato"}
            </Typography>
          ) : (
            <div className="row" style={{ marginTop: '16px' }}>
              {camposContrato.map((campo) => (
                <div className="col-md-6 mb-3" key={campo.IdCampoContrato}>
                  <div className="card border-left-primary h-100">
                    <div className="card-body">
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
                          disabled={isSubmittingCampos}
                        />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleClose(false)} disabled={isSubmittingCampos}>
            Cerrar
          </Button>
          <Button
            onClick={handleSubmitCampos}
            variant="contained"
            disabled={isSubmittingCampos || camposContrato.length === 0}
          >
            {isSubmittingCampos ? "Guardando..." : "Guardar Campos"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}