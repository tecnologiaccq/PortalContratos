import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  MenuItem,
} from "@mui/material";
import { useState, useEffect } from "react";

const apiUrl = process.env.REACT_APP_API_URL;

export default function ContratoFormModal({
  open,
  onClose,
  contrato,
  onSaved,
  onError,
}) {
  const [formData, setFormData] = useState({
    Contraparte: "",
    FechaPedido: "",
    FechaSuscripcion: "",
    FechaTerminacion: "",
    PlazoDias: 0,
    PlazoMeses: 0,
    PlazoAnios: 0,
    EsIndefinido: false,
    Valor: 0,
    IdEstado: 1,
    AceptaValorCero: false,
  });

  const [estados, setEstados] = useState([]);

  useEffect(() => {
    if (contrato) {
      setFormData({
        Contraparte: contrato.Contraparte || "",
        FechaPedido: contrato.FechaPedido?.split("T")[0] || "",
        FechaSuscripcion: contrato.FechaSuscripcion?.split("T")[0] || "",
        FechaTerminacion: contrato.EsIndefinido
          ? ""
          : contrato.FechaTerminacion?.split("T")[0] || "",
        PlazoDias: contrato.EsIndefinido ? 0 : contrato.PlazoDias || 0,
        PlazoMeses: contrato.EsIndefinido ? 0 : contrato.PlazoMeses || 0,
        PlazoAnios: contrato.EsIndefinido ? 0 : contrato.PlazoAnios || 0,
        EsIndefinido: contrato.EsIndefinido || false,
        Valor: contrato.Valor || 0,
        IdEstado: contrato.IdEstado || 1,
        AceptaValorCero: contrato.AceptaValorCero || false,
      });
    }
  }, [contrato]);

  useEffect(() => {
    const fetchEstados = async () => {
      try {
        const res = await fetch(
          `${apiUrl}/portal_contratos/catalogos/ObtenerCatEstados`,
          { method: "POST", credentials: "include" }
        );
        const data = await res.json();
        setEstados(data.filter((e) => e.IsActivo));
      } catch (err) {
        console.error("Error al obtener estados:", err);
      }
    };
    fetchEstados();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Recalcular FechaTerminacion según PlazoDias, PlazoMeses, PlazoAnios y FechaSuscripcion
  useEffect(() => {
    const { FechaSuscripcion, PlazoDias, PlazoMeses, PlazoAnios, EsIndefinido } = formData;

    if (!FechaSuscripcion) return;

    if (EsIndefinido) {
      setFormData(prev => ({ ...prev, FechaTerminacion: "" }));
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

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const inicio = new Date(formData.FechaSuscripcion);
      const fin = formData.EsIndefinido ? null : new Date(formData.FechaTerminacion);

      const payload = {
        IdContrato: contrato?.IdContrato,
        IdEstado: formData.IdEstado,
        Contraparte: formData.Contraparte,
        FechaPedido: formData.FechaPedido,
        FechaSuscripcion: formData.FechaSuscripcion,
        FechaTerminacion: formData.EsIndefinido ? null : formData.FechaTerminacion,
        PlazoDias: formData.EsIndefinido ? 0 : Number(formData.PlazoDias) || 0,
        PlazoMeses:formData.EsIndefinido ? 0 :  Number(formData.PlazoMeses) || 0,
        PlazoAnios: formData.EsIndefinido ? 0 : Number(formData.PlazoAnios) || 0,
        EsIndefinido: formData.EsIndefinido,
        Valor: Number(formData.Valor) || 0,
      };

      const response = await fetch(
        `${apiUrl}/portal_contratos/contratos/ActualizarContrato`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Error al guardar contrato");

      onSaved && onSaved("Contrato actualizado correctamente");
      onClose();
    } catch (err) {
      onError && onError("Error al guardar: " + err.message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar Contrato</DialogTitle>
      <DialogContent>
        <form id="contrato-form" onSubmit={handleSave}>
          <TextField
            label="Estado"
            name="IdEstado"
            select
            required
            value={formData.IdEstado}
            onChange={handleChange}
            fullWidth
            margin="normal"
          >
            {estados.map((e) => (
              <MenuItem key={e.IdEstado} value={e.IdEstado}>
                {e.Descripcion}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Contraparte"
            name="Contraparte"
            value={formData.Contraparte}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />

          <TextField
            label="Valor"
            name="Valor"
            inputProps={{
              min: formData.AceptaValorCero ? 0 : 1,
            }}
            type="number"
            value={formData.Valor}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.EsIndefinido}
                onChange={handleChange}
                name="EsIndefinido"
              />
            }
            label="Contrato Indefinido"
          />

          <TextField
            label="Fecha Pedido"
            name="FechaPedido"
            type="date"
            value={formData.FechaPedido}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Fecha Suscripción"
            name="FechaSuscripcion"
            type="date"
            value={formData.FechaSuscripcion}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />

          <div style={{ display: "flex", gap: 8 }}>
            <TextField
              label="Plazo (días)"
              name="PlazoDias"
              type="number"
              value={formData.PlazoDias || ""}
              onChange={handleChange}
              fullWidth
              margin="normal"
              disabled={formData.EsIndefinido}
            />
            <TextField
              label="Plazo (meses)"
              name="PlazoMeses"
              type="number"
              value={formData.PlazoMeses || ""}
              onChange={handleChange}
              fullWidth
              margin="normal"
              disabled={formData.EsIndefinido}
            />
            <TextField
              label="Plazo (años)"
              name="PlazoAnios"
              type="number"
              value={formData.PlazoAnios || ""}
              onChange={handleChange}
              fullWidth
              margin="normal"
              disabled={formData.EsIndefinido}
            />
          </div>

          <TextField
            label="Fecha Terminación"
            name="FechaTerminacion"
            type="date"
            value={formData.FechaTerminacion || ""}
            fullWidth
            margin="normal"
            InputProps={{ readOnly: true }}
            InputLabelProps={{ shrink: true }}
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" type="submit" form="contrato-form">
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
