import React, { useState, useEffect, useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { 
  Box, 
  Typography, 
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Button,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox
} from "@mui/material";
import { Add, Edit } from "@mui/icons-material";

const apiUrl = process.env.REACT_APP_API_URL;

function AdminTipos() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const [openDialog, setOpenDialog] = useState(false);
  const [modo, setModo] = useState("agregar");
  const [formData, setFormData] = useState({
    IdCampo: null,
    Nombre: "",
    Descripcion: "",
    IsActivo: true,
    ExplicacionTecnica: ""
  });

  // Obtener registros de la API
  const obtenerRegistros = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${apiUrl}/portal_contratos/tipo/ObtenerTipos`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setRegistros(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener registros:", error);
      setError(error.message);
      setRegistros([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerRegistros();
  }, []);

  // Definir columnas
  const columns = [
    {
      field: "descripcion",
      headerName: "Descripción",
      flex: 1,
      minWidth: 250,
    },
    {
      field: "isActivo",
      headerName: "Activo",
      width: 120,
      type: "boolean",
      renderCell: (params) => (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          height: '100%',
          color: params.value ? 'success.main' : 'text.secondary'
        }}>
          {params.value ? "Sí" : "No"}
        </Box>
      ),
    },
    {
      field: "acciones",
      headerName: "Acciones",
      width: 120,
      renderCell: (params) => (
        <Button 
          variant="outlined" 
          size="small"
          startIcon={<Edit />}
          onClick={() => handleEditar(params.row)}
        >
          Editar
        </Button>
      )
    }
  ];

  const rows = useMemo(() => {
    return registros.map((r) => ({
      id: r.IdTipoDocumento,
      descripcion: r.Descripcion,
      isActivo: r.IsActivo,
    }));
  }, [registros]);

  const handleAgregar = () => {
    setModo("agregar");
    setFormData({ IdTipoDocumento: null,  Descripcion: "", IsActivo: true });
    setOpenDialog(true);
  };

  const handleEditar = (row) => {
    setModo("editar");
    setFormData({
      IdTipoDocumento: row.id,
      Descripcion: row.descripcion,
      IsActivo: row.isActivo,
    });
    setOpenDialog(true);
  };

  const handleGuardar = async () => {
  if (!formData.Descripcion.trim()) {
    setSnackbar({ open: true, message: "Por favor, complete todos los campos (*)" });
    return;
  }


  try {
    const url =
      modo === "agregar"
        ? `${apiUrl}/portal_contratos/tipo/AgregarTipo`
        : `${apiUrl}/portal_contratos/tipo/ActualizarTipo`;

    const response = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    setSnackbar({
      open: true,
      message: modo === "agregar" ? "Registro agregado" : "Registro actualizado",
    });
    setOpenDialog(false);
    obtenerRegistros();
  } catch (error) {
    console.error("Error al guardar:", error);
    setSnackbar({ open: true, message: "Error al guardar" });
  }
};

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 400 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando registros...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6">Error al cargar los datos</Typography>
          <Typography variant="body2">{error}</Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
      
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h5" component="h1" fontWeight="bold">
              Tipos de contratos
            </Typography>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Button 
                variant="contained" 
                startIcon={<Add />}
                onClick={handleAgregar}
              >
                Agregar
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ height: 820, width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 }
                }
              }}
              pageSizeOptions={[10, 25, 50, 100]}
              disableRowSelectionOnClick
              density="comfortable"
              sx={{
                border: "none",
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#f5f5f5",
                  borderBottom: "2px solid #e0e0e0",
                },
                "& .MuiDataGrid-columnHeaderTitle": {
                  fontWeight: "bold",
                  fontSize: "0.875rem",
                },
                "& .MuiDataGrid-cell": {
                  borderBottom: "1px solid #f0f0f0",
                  fontSize: "0.875rem",
                },
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: "#f9f9f9",
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Dialogo para agregar/editar */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{modo === "agregar" ? "Agregar Tipo" : "Editar Tipo"}</DialogTitle>
        <DialogContent dividers>
        <TextField
          label="Descripción"
          fullWidth
          required
          margin="normal"
          slotProps={{
              input: {
                  inputProps: { maxLength: 255 } 
                }
            }}
          value={formData.Descripcion}
          onChange={(e) => setFormData({ ...formData, Descripcion: e.target.value })}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.IsActivo}
              onChange={(e) =>
                setFormData({ ...formData, IsActivo: e.target.checked })
              }
            />
          }
          label="Activo"
        />
      </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleGuardar}>
            {modo === "agregar" ? "Agregar" : "Actualizar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminTipos;
