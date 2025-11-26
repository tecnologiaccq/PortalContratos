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
  TextField
} from "@mui/material";
import { Edit, Business } from "@mui/icons-material";

const apiUrl = process.env.REACT_APP_API_URL;

function AdminEmpresasSection() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    IdEmpresa: null,
    Descripcion: "",
    NombreRepresentanteLegal: ""
  });

  const obtenerRegistros = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${apiUrl}/portal_contratos/parametros/ObtenerParametrosRepresentantesCargos`, {
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

  const columns = [
    {
      field: "descripcion",
      headerName: "Descripción",
      flex: 1,
      minWidth: 250,
    },
    {
      field: "valor",
      headerName: "Valor",
      flex: 1,
      minWidth: 250
    },
    {
      field: "acciones",
      headerName: "Acciones",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Button 
          variant="outlined" 
          size="small"
          startIcon={<Edit />}
          onClick={() => handleEditar(params.row)}
          sx={{
            borderColor: "#000fa0",
            color: "#000fa0",
            "&:hover": {
              borderColor: "#000c80",
              bgcolor: "rgba(0,15,160,0.04)"
            }
          }}
        >
          Editar
        </Button>
      )
    }
  ];

  const rows = useMemo(() => {
    return registros.map((r) => ({
      id: r.IdParametroGenerales,
      descripcion: r.Descripcion,
      valor: r.Valor,
    }));
  }, [registros]);

  const handleEditar = (row) => {
    setFormData({
      IdParametroGenerales: row.id,
      Valor: row.valor,
      Descripcion: row.descripcion
    });
    setOpenDialog(true);
  };

  const handleGuardar = async () => {
    if (!formData.Valor.trim()) {
      setSnackbar({ open: true, message: "Por favor, complete todos los campos (*)" });
      return;
    }

    try {
      const url = `${apiUrl}/portal_contratos/parametros/ActualizarParametro`;

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
        message: "Parámetro actualizado correctamente",
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
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: 400
        }}
      >
        <CircularProgress size={48} sx={{ color: "#000fa0" }} />
        <Typography sx={{ mt: 2 }} color="text.secondary">
          Cargando empresas...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          <Typography variant="h6">Error al cargar los datos</Typography>
          <Typography variant="body2">{error}</Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", bgcolor: "#f5f5f5" }}>
      <Box sx={{ p: 4 }}>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          message={snackbar.message}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        />

        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
            <Business sx={{ fontSize: 40, color: "#000fa0" }} />
            <Typography variant="h4" component="h1" fontWeight={700} sx={{ color: "#1a1a1a" }}>
              Gestión de Empresas
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Administra la información de las empresas y sus representantes.
          </Typography>
        </Box>

        {/* DataGrid Card */}
        <Card
          elevation={0}
          sx={{
            border: "1px solid #e0e0e0",
            borderRadius: 2,
            bgcolor: "white"
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ width: "100%" }}>
              <DataGrid
                rows={rows}
                columns={columns}
                autoHeight
                disableRowSelectionOnClick
                density="comfortable"
                sx={{
                  border: "none",
                  "& .MuiDataGrid-columnHeaders": {
                    bgcolor: "#000fa0",
                    color: "white",
                    borderBottom: "none",
                    "& .MuiDataGrid-columnHeaderTitle": {
                      fontWeight: 600,
                      fontSize: "0.875rem",
                    },
                    "& .MuiDataGrid-iconButtonContainer": {
                      color: "white"
                    },
                    "& .MuiDataGrid-sortIcon": {
                      color: "white"
                    },
                    "& .MuiDataGrid-menuIcon": {
                      color: "white"
                    }
                  },
                  "& .MuiDataGrid-cell": {
                    borderBottom: "1px solid #f0f0f0",
                    fontSize: "0.875rem",
                  },
                  "& .MuiDataGrid-row": {
                    "&:hover": {
                      bgcolor: "#f9f9f9",
                    },
                    "&:last-child .MuiDataGrid-cell": {
                      borderBottom: "none"
                    }
                  },
                  "& .MuiDataGrid-footerContainer": {
                    borderTop: "1px solid #e0e0e0",
                    bgcolor: "#fafafa"
                  }
                }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Dialog para editar */}
        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2
            }
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: "#000fa0", 
            color: "white",
            fontWeight: 600
          }}>
            Editar Empresa
          </DialogTitle>
          <DialogContent dividers sx={{ pt: 3 }}>
            <TextField
              label="Descripción"
              fullWidth
              margin="normal"
              value={formData.Descripcion}
              disabled
              sx={{
                "& .MuiInputBase-input.Mui-disabled": {
                  WebkitTextFillColor: "rgba(0,0,0,0.6)"
                }
              }}
            />
            <TextField
              label="Valor"
              fullWidth
              required
              margin="normal"
              slotProps={{
                input: {
                  inputProps: { maxLength: 128 } 
                }
              }}
              value={formData.Valor}
             onChange={(e) => setFormData({ ...formData, Valor: e.target.value })}
            />
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={() => setOpenDialog(false)}
              sx={{ color: "text.secondary" }}
            >
              Cancelar
            </Button>
            <Button 
              variant="contained" 
              onClick={handleGuardar}
              sx={{
                bgcolor: "#000fa0",
                "&:hover": {
                  bgcolor: "#000c80"
                }
              }}
            >
              Actualizar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}

export default AdminEmpresasSection;