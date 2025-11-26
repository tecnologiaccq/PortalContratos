import { useState, useEffect, useCallback } from "react"; 
import { useParams } from "react-router-dom";
import { Switch , Card, CardContent, Typography} from "@mui/material"; 
import { 
  Box, CircularProgress, Alert, Button, 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  FormControl,   Autocomplete,
  TextField
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Add } from "@mui/icons-material";

const apiUrl = process.env.REACT_APP_API_URL;

function AdminCampos() {
  const { id } = useParams();
  const [campos, setCampos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados para el modal
  const [openDialog, setOpenDialog] = useState(false);
  const [camposDisponibles, setCamposDisponibles] = useState([]);
  const [campoSeleccionado, setCampoSeleccionado] = useState("");

  // Extraer fetchCampos como función reutilizable
  const fetchCampos = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${apiUrl}/portal_contratos/campos_objeto/ObtenerCO/${id}`,
        {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok)
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      const data = await response.json();
      const rows = Array.isArray(data)
        ? data.map((item) => ({ ...item, id: item.IdCampoObjeto }))
        : [];
      setCampos(rows);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // cargar al inicio
  useEffect(() => {
    fetchCampos();
  }, [fetchCampos]);

  const columns = [
  { field: "NombreCampo", headerName: "Nombre Campo", flex: 1.5, minWidth: 200 },
  { field: "DescripcionCampo", headerName: "Descripción", flex: 2, minWidth: 250 },
    { field: "ExplicacionTecnica", headerName: "Formato", flex: 2, minWidth: 250 },

  {
    field: "IsActivo",
    headerName: "Activo",
    width: 150,
    renderCell: (params) => (
      <Switch
        checked={params.row.IsActivo}
        onChange={(e) => handleToggleActivo(params.row, e.target.checked)}
        color="primary"
      />
    ),
  },
];

const handleToggleActivo = async (row, nuevoValor) => {
  try {
    const response = await fetch(
      `${apiUrl}/portal_contratos/campos_objeto/ActualizarCO`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          IdObjeto: row.IdObjeto,
          IdCampoGeneral: row.IdCampoGeneral,
          IsActivo: nuevoValor,
          IdCampoObjeto: row.IdCampoObjeto,
        }),
      }
    );
    if (!response.ok) throw new Error("Error al actualizar estado");

    setCampos((prev) =>
      prev.map((c) =>
        c.IdCampoObjeto === row.IdCampoObjeto
          ? { ...c, IsActivo: nuevoValor }
          : c
      )
    );
  } catch (err) {
    console.error(err);
    alert("Error al actualizar estado");
  }
};

  // Abrir modal y cargar campos disponibles
  const handleAgregar = async () => {
    try {
      const response = await fetch(
        `${apiUrl}/portal_contratos/campos_generales/ObtenerCGActivosParaObjetos/${id}`,
        {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok) throw new Error("Error al obtener campos disponibles");
      const data = await response.json();
      setCamposDisponibles(data);
      setCampoSeleccionado("");
      setOpenDialog(true);
    } catch (err) {
      console.error(err);
      alert("Error al cargar campos disponibles");
    }
  };

  // Guardar el campo seleccionado
  const handleGuardar = async () => {
    if (!campoSeleccionado) {
      alert("Seleccione un campo");
      return;
    }
    try {
      const response = await fetch(
        `${apiUrl}/portal_contratos/campos_objeto/AgregarCO`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            IdObjeto: id,
            IdCampoGeneral: campoSeleccionado,
            IsActivo: true,
          }),
        }
      );
      if (!response.ok) throw new Error("Error al guardar");
      
      // recargar la tabla SIN reload
      await fetchCampos();
      setOpenDialog(false);
    } catch (err) {
      console.error(err);
      alert("Error al guardar el campo");
    }
  };

  return (
    <>
<Card sx={{ mb:2 }}>
        <CardContent sx={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <Typography variant="h5" fontWeight="bold">Campos</Typography>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={handleAgregar}
          >
            Agregar
          </Button>
        </CardContent>
      </Card>

      <div className="panel panel-default site-bg-white m-t30">
        
        <div className="panel-body wt-panel-body">
          {loading ? (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <Box sx={{ height: 650, width: "100%" }}>
              <DataGrid
                rows={campos}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10, 20, 50]}
                disableSelectionOnClick
                getRowId={(row) => row.IdCampoObjeto}
              />
            </Box>
          )}
        </div>
      </div>

      {/* Modal */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar Campo</DialogTitle>
        <DialogContent>
      <FormControl fullWidth sx={{ mt: 2 }}>
        <Autocomplete
          options={camposDisponibles}
          getOptionLabel={(option) => `${option.Nombre} - ${option.Descripcion}`}
          renderInput={(params) => (
            <TextField {...params} label="Buscar campo" variant="outlined" />
          )}
          value={
            camposDisponibles.find((c) => c.IdCampo === campoSeleccionado) || null
          }
          onChange={(event, newValue) => {
            setCampoSeleccionado(newValue ? newValue.IdCampo : "");
          }}
        />
      </FormControl>
</DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleGuardar} variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default AdminCampos;
