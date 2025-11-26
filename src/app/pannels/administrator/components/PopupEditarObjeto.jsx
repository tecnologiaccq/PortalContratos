import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  FormControlLabel, 
  Checkbox, 
  Typography,
  Box,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";

const apiUrl = process.env.REACT_APP_API_URL;

const apiUrlAgregar = `${apiUrl}/portal_contratos/objeto/AgregarObjeto`;
const apiUrlEditar = `${apiUrl}/portal_contratos/objeto/ActualizarObjeto`;

function PopupEditarObjeto({ open, onClose, modo, initialData, onActualizacion, onMensaje }) {
  const [formData, setFormData] = useState({
    IdObjeto: null,
    IdTipoDocumento: "",
    IdEmpresa: "",
    Descripcion: "",
    Codigo: "",
    UrlArchivo: "",
    IsActivo: true,
    AceptaValorCero: false
  });
  
  const [archivo, setArchivo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [empresas, setEmpresas] = useState([]);
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);

  // Cargar catálogos al abrir el diálogo
  useEffect(() => {
    if (open && (empresas.length === 0 || tiposDocumento.length === 0)) {
      cargarCatalogos();
    }
  }, [open]);

  const cargarCatalogos = async () => {
    setLoadingCatalogos(true);
    try {
      const [empresasResponse, tiposResponse] = await Promise.all([
        fetch(`${apiUrl}/portal_contratos/GestionEmpresa/Obtener`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        }),
        fetch(`${apiUrl}/portal_contratos/tipo/ObtenerTiposActivos`, {
          method: "POST", 
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        })
      ]);

      if (empresasResponse.ok) {
        const empresasData = await empresasResponse.json();
        setEmpresas(Array.isArray(empresasData) ? empresasData : []);
      }

      if (tiposResponse.ok) {
        const tiposData = await tiposResponse.json();
        setTiposDocumento(Array.isArray(tiposData) ? tiposData : []);
      }
    } catch (err) {
      console.error("Error cargando catálogos:", err);
      onMensaje("Error al cargar los catálogos", "error");
    } finally {
      setLoadingCatalogos(false);
    }
  };

  // Effect para actualizar formData cuando cambia initialData o modo
  useEffect(() => {
    if (open) {
      if (modo === "editar" && initialData) {
        // Modo editar: usar datos del objeto a editar
        setFormData({
          IdObjeto: initialData.IdObjeto || null,
          IdTipoDocumento: initialData.IdTipoDocumento || "",
          IdEmpresa: initialData.IdEmpresa || "",
          Descripcion: initialData.Descripcion || "",
          Codigo: initialData.Codigo || "",
          UrlArchivo: initialData.UrlArchivo || "",
          IsActivo: initialData.IsActivo !== undefined ? initialData.IsActivo : true,
          AceptaValorCero: initialData.AceptaValorCero !== undefined ? initialData.AceptaValorCero : false
        });
      } else if (modo === "agregar") {
        // Modo agregar: usar valores por defecto
        setFormData({
          IdObjeto: null,
          IdTipoDocumento: "",
          IdEmpresa: "",
          Descripcion: "",
          Codigo: "",
          UrlArchivo: "",
          IsActivo: true,
          AceptaValorCero: false
        });
      }
      setArchivo(null);
      setErrors({});
    }
  }, [initialData, open, modo]);

  // Limpiar estado al cerrar
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setFormData({
          IdObjeto: null,
          IdTipoDocumento: "",
          IdEmpresa: "",
          Descripcion: "",
          Codigo: "",
          UrlArchivo: "",
          IsActivo: true,
          AceptaValorCero: false
        });
        setArchivo(null);
        setErrors({});
        setLoading(false);
      }, 200);
    }
  }, [open]);

  const handleArchivoChange = (e) => {
    const file = e.target.files[0];

    // Reiniciar error si ya existía
    if (errors.archivo) setErrors(prev => ({ ...prev, archivo: null }));

    if (!file) {
      // Si estamos agregando, el archivo es obligatorio
      if (modo === "agregar") {
        setErrors(prev => ({ ...prev, archivo: "El archivo es obligatorio" }));
        setArchivo(null);
      } else {
        // En editar, es opcional
        setArchivo(null);
      }
      return;
    }

    // Validar extensión
    const allowedExtensions = ["doc", "docx"];
    const fileExt = file.name.split(".").pop().toLowerCase();
    if (!allowedExtensions.includes(fileExt)) {
      setErrors(prev => ({ ...prev, archivo: "Solo se permiten archivos Word (.doc, .docx)" }));
      setArchivo(null);
      return;
    }

    // Todo correcto
    setArchivo(file);
    setErrors(prev => ({ ...prev, archivo: null }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.Descripcion.trim()) newErrors.Descripcion = "La descripción es obligatoria";
    if (modo === "agregar" && !formData.Codigo.trim()) newErrors.Codigo = "El código es obligatorio";
    if (!formData.IdEmpresa) newErrors.IdEmpresa = "La empresa es obligatoria";
    if (!formData.IdTipoDocumento) newErrors.IdTipoDocumento = "El tipo de documento es obligatorio";

    // Archivo obligatorio solo en agregar
    if (modo === "agregar") {
      if (!archivo) {
        newErrors.archivo = "Debe seleccionar un archivo Word";
      } else {
        const allowedExtensions = ["doc", "docx"];
        const fileExt = archivo.name.split(".").pop().toLowerCase();
        if (!allowedExtensions.includes(fileExt)) {
          newErrors.archivo = "Solo se permiten archivos Word (.doc, .docx)";
        }
      }
    }

    setErrors(newErrors);

    // Si hay cualquier error, devolver false
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleGuardar = async () => {
    if (!validateForm()) {
      onMensaje("Por favor, complete todos los campos obligatorios", "error");
      return;
    }

    setLoading(true);
    
    try {
      const data = new FormData();
      
      // Agregar archivo si existe
      if (archivo) {
        data.append("Archivo", archivo);
      }

      // Agregar campos obligatorios
      data.append("IdTipoDocumento", formData.IdTipoDocumento.toString());
      data.append("IdEmpresa", formData.IdEmpresa.toString());
      data.append("Descripcion", formData.Descripcion.trim());
      data.append("Codigo", formData.Codigo.trim());
      data.append("IsActivo", formData.IsActivo);
      data.append("AceptaValorCero", formData.AceptaValorCero);

      // Para edición, agregar campos adicionales
      if (modo === "editar") {
        data.append("IdObjeto", formData.IdObjeto);
        data.append("UrlArchivo", formData.UrlArchivo || "");
      }

      const url = modo === "agregar" ? apiUrlAgregar : apiUrlEditar;
      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        body: data
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }

      // Mensaje de éxito
      const mensajeExito = modo === "agregar" 
        ? "¡Registro agregado exitosamente!" 
        : "¡Registro actualizado exitosamente!";
      
      onMensaje(mensajeExito, "success");
      
      // Actualizar la lista en el componente padre
      if (onActualizacion) {
        await onActualizacion();
      }
      
      // Cerrar el diálogo
      onClose();
      
    } catch (err) {
      console.error("Error al guardar:", err);
      onMensaje(`Error al guardar: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      disableEscapeKeyDown={loading}
    >
      <DialogTitle>
        {modo === "agregar" ? "Agregar Nuevo Objeto" : "Editar Objeto"}
      </DialogTitle>
      
      <DialogContent dividers>
        {loadingCatalogos ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Cargando catálogos...</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Descripción *"
              slotProps={{
              input: {
                  inputProps: { maxLength: 255 } 
                }
            }}
              fullWidth
              value={formData.Descripcion}
              onChange={(e) => handleInputChange("Descripcion", e.target.value)}
              error={!!errors.Descripcion}
              helperText={errors.Descripcion}
              disabled={loading}
            />
            
            {modo === "agregar" && (
              <TextField
                label="Código *"
                fullWidth
                slotProps={{
                  input: {
                      inputProps: { maxLength: 10 } 
                    }
                }}
                value={formData.Codigo}
                onChange={(e) => handleInputChange("Codigo", e.target.value)}
                error={!!errors.Codigo}
                helperText={errors.Codigo}
                disabled={loading}
              />
            )}
            
            <FormControl fullWidth error={!!errors.IdEmpresa}>
              <InputLabel>Empresa *</InputLabel>
              <Select
                value={formData.IdEmpresa}
                onChange={(e) => handleInputChange("IdEmpresa", e.target.value)}
                label="Empresa *"
                disabled={loading}
              >
                {empresas.map((empresa) => (
                  <MenuItem key={empresa.IdEmpresa} value={empresa.IdEmpresa}>
                    {empresa.Descripcion}
                  </MenuItem>
                ))}
              </Select>
              {errors.IdEmpresa && (
                <Typography variant="caption" color="error" sx={{ mt: 1, ml: 1 }}>
                  {errors.IdEmpresa}
                </Typography>
              )}
            </FormControl>
            
            <FormControl fullWidth error={!!errors.IdTipoDocumento}>
              <InputLabel>Tipo de Documento *</InputLabel>
              <Select
                value={formData.IdTipoDocumento}
                onChange={(e) => handleInputChange("IdTipoDocumento", e.target.value)}
                label="Tipo de Documento *"
                disabled={loading}
              >
                {tiposDocumento.map((tipo) => (
                  <MenuItem key={tipo.IdTipoDocumento} value={tipo.IdTipoDocumento}>
                    {tipo.Descripcion}
                  </MenuItem>
                ))}
              </Select>
              {errors.IdTipoDocumento && (
                <Typography variant="caption" color="error" sx={{ mt: 1, ml: 1 }}>
                  {errors.IdTipoDocumento}
                </Typography>
              )}
            </FormControl>
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.IsActivo}
                  onChange={(e) => handleInputChange("IsActivo", e.target.checked)}
                  disabled={loading}
                />
              }
              label="Activo"
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.AceptaValorCero}
                  onChange={(e) => handleInputChange("AceptaValorCero", e.target.checked)}
                  disabled={loading}
                />
              }
              label="Acepta valor cero"
            />
            
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {modo === "agregar" ? "Archivo * (obligatorio)" : "Archivo (opcional)"}
              </Typography>
              <input 
                type="file" 
                onChange={handleArchivoChange} 
                disabled={loading}
                style={{ width: '100%' }}
              />
              {errors.archivo && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                  {errors.archivo}
                </Typography>
              )}
            </Box>
            
            {modo === "editar" && formData.UrlArchivo && (
              <Alert severity="info">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => window.open(formData.UrlArchivo, "_blank")}
                >
                  Ver archivo actual
                </Button>
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading || loadingCatalogos}>
          Cancelar
        </Button>
        <Button 
          variant="contained" 
          onClick={handleGuardar}
          disabled={loading || loadingCatalogos}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading 
            ? "Guardando..." 
            : (modo === "agregar" ? "Agregar" : "Actualizar")
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PopupEditarObjeto;