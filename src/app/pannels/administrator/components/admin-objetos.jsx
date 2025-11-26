import { useState, useEffect, useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography, CircularProgress, Alert, Card, CardContent, Button, Snackbar } from "@mui/material";
import { Add, Edit } from "@mui/icons-material";
import PopupEditarObjeto from "./PopupEditarObjeto";
import {EyeIcon } from "lucide-react";

const apiUrl = process.env.REACT_APP_API_URL;

function AdminObjects() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const [openDialog, setOpenDialog] = useState(false);
  const [modo, setModo] = useState("agregar"); // "agregar" o "editar"
  const [formData, setFormData] = useState({
    IdObjeto: null,
    IdTipoDocumento: null,
    Descripcion: "",
    UrlArchivo: "",
    IsActivo: true,
    Codigo: "",
    IdEmpresa: null,
    NombreEmpresa: "",
    NombreTipoDocumento: "",
    AceptaValorCero: false
  });

  // Obtener registros
  const obtenerRegistros = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${apiUrl}/portal_contratos/objeto/ObtenerObjetos`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      const data = await response.json();
      setRegistros(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setRegistros([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerRegistros();
  }, []);

  // Columnas
  const columns = [
    { field: "Descripcion", headerName: "Descripción", flex: 1, minWidth: 200 },
    { field: "Codigo", headerName: "Código", flex: 1, minWidth: 50 },
    { field: "NombreEmpresa", headerName: "Empresa", flex: 1, minWidth: 50 },
    { field: "NombreTipoDocumento", headerName: "Tipo Documento", flex: 1, minWidth: 50 },
    {
      field: "IsActivo",
      headerName: "Activo",
      width: 100,
      type: "boolean",
      renderCell: (params) => (
        <Box sx={{ display:'flex', alignItems:'center', height:'100%', color: params.value ? 'success.main' : 'text.secondary' }}>
          {params.value ? "Sí" : "No"}
        </Box>
      )
    },
    {
  field: "UrlArchivo",
  headerName: "Archivo",
  minWidth: 100,
  renderCell: (params) => {
    const url = params.value;
    if (!url) return null;

    return (
      <Button
        variant="outlined"
        size="small"
        onClick={() => window.open(url, "_blank")}
        startIcon={<EyeIcon />}
      >
        Ver
      </Button>
    );
  }
}
,
    {
  field: "acciones",
  headerName: "Acciones",
  width: 220,
  renderCell: (params) => (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button 
        variant="outlined" 
        size="small" 
        startIcon={<Edit />} 
        onClick={() => handleEditar(params.row)}
      >
        Editar
      </Button>
      <Button
        variant="outlined"
        size="small"
        onClick={() => window.location.href = `campos/${params.row.IdObjeto}`}
      >
        Campos
      </Button>
    </Box>
  )
}
  ];

  const rows = useMemo(() => registros.map(r => ({ id: r.IdObjeto, ...r })), [registros]);

  const handleAgregar = () => {
    setModo("agregar");
    const newFormData = {
      IdObjeto: null,
      IdTipoDocumento: "",
      Descripcion: "",
      UrlArchivo: "",
      IsActivo: true,
      Codigo: "",
      IdEmpresa: "",
      NombreEmpresa: "",
      NombreTipoDocumento: "",
      AceptaValorCero: false
    };
    setFormData(newFormData);
    setOpenDialog(true);
  };

  // Editar
  const handleEditar = (row) => {
    setModo("editar");
    // Crear una copia nueva del objeto para evitar referencias
    const editFormData = {
      IdObjeto: row.IdObjeto,
      IdTipoDocumento: row.IdTipoDocumento || "",
      Descripcion: row.Descripcion || "",
      UrlArchivo: row.UrlArchivo || "",
      IsActivo: row.IsActivo,
      Codigo: row.Codigo || "",
      IdEmpresa: row.IdEmpresa || "",
      NombreEmpresa: row.NombreEmpresa || "",
      NombreTipoDocumento: row.NombreTipoDocumento || "",
      AceptaValorCero: row.AceptaValorCero
    };
    setFormData(editFormData);
    setOpenDialog(true);
  };

  const handleMensaje = (mensaje, tipo = "success") => {
    setSnackbar({ open: true, message: mensaje, severity: tipo });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setTimeout(() => {
      setFormData({
        IdObjeto: null,
        IdTipoDocumento: "",
        Descripcion: "",
        UrlArchivo: "",
        IsActivo: true,
        Codigo: "",
        IdEmpresa: "",
        NombreEmpresa: "",
        NombreTipoDocumento: "",
        AceptaValorCero: false
      });
    }, 100);
  };

  if (loading) return <Box sx={{ display:"flex", justifyContent:"center", alignItems:"center", height:400 }}><CircularProgress /><Typography sx={{ ml:2 }}>Cargando registros...</Typography></Box>;
  if (error) return <Box sx={{ p:2 }}><Alert severity="error">{error}</Alert></Box>;

  return (
    <Box sx={{ p:2 }}>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open:false })}
        anchorOrigin={{ vertical:"top", horizontal:"center" }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open:false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Card sx={{ mb:2 }}>
        <CardContent sx={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <Typography variant="h5" fontWeight="bold">Objetos</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={handleAgregar}>Agregar</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p:0 }}>
          <Box sx={{ height:650, width:"100%" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              initialState={{ pagination:{ paginationModel:{ page:0, pageSize:10 }}}}
              pageSizeOptions={[10,25,50,100]}
              disableRowSelectionOnClick
              density="comfortable"
            />
          </Box>
        </CardContent>
      </Card>

      <PopupEditarObjeto
        open={openDialog}
        onClose={handleCloseDialog}
        modo={modo}
        initialData={formData}
        onActualizacion={obtenerRegistros}
        onMensaje={handleMensaje}
        key={`${modo}-${formData.IdObjeto || 'new'}`} 
      />
    </Box>
  );
}

export default AdminObjects;