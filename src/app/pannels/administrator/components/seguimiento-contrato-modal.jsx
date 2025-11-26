import { useEffect, useState } from "react";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  TextField, 
  Snackbar, 
  Alert,
  Box,
  Paper,
  Chip,
  IconButton,
  Fade,
  Grow
} from "@mui/material";
import { 
  Add as AddIcon, 
  Timeline as TimelineIcon, 
  Close as CloseIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon
} from "@mui/icons-material";

const apiUrl = process.env.REACT_APP_API_URL;

export default function SeguimientoContratoModal({ open, onClose, idContrato, onSuccess, onError }) {
  const [seguimientos, setSeguimientos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nuevoEvento, setNuevoEvento] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const handleSnackbarClose = () => setSnackbar(prev => ({ ...prev, open: false }));

  useEffect(() => {
    if (!idContrato || !open) return;

    const fetchSeguimiento = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/portal_contratos/seguimiento/ObtenerPorContrato/${idContrato}`, {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Error al obtener seguimiento del contrato");
        const data = await res.json();
        setSeguimientos(data);
      } catch (err) {
        const errorMessage = "No se pudo cargar el seguimiento del contrato";
        setSnackbar({ open: true, message: errorMessage, severity: "error" });
        if (onError) onError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchSeguimiento();
  }, [idContrato, open, onError]);

  // Agregar nuevo seguimiento
  const handleAgregarEvento = async () => {
    if (!nuevoEvento.trim()) {
      setSnackbar({ open: true, message: "Debe ingresar una descripción", severity: "warning" });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${apiUrl}/portal_contratos/seguimiento/AgregarSeguimiento`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          IdContrato: idContrato,
          Descripcion: nuevoEvento.trim()
        }),
      });

      if (!res.ok) throw new Error("Error al agregar seguimiento");

      setSeguimientos(prev => [
        { Id: 0, IdContrato: idContrato, Descripcion: nuevoEvento.trim(), FechaCreacion: new Date().toISOString() },
        ...prev
      ]);
      setNuevoEvento("");
      setSnackbar({ open: true, message: "Observación agregada correctamente", severity: "success" });
      if (onSuccess) onSuccess("Observación agregada correctamente");
    } catch (err) {
      const errorMessage = err.message || "No se pudo agregar la observación";
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
      if (onError) onError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSeguimientos([]);
    setNuevoEvento("");
    setSnackbar({ open: false, message: "", severity: "success" });
    onClose();
  };



  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("es-ES", {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            maxHeight: '90vh'
          }
        }}
        TransitionComponent={Fade}
        transitionDuration={300}
      >
        <DialogTitle 
          sx={{ 
            backgroundColor: '#000fa0',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 2.5,
            px: 3
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <TimelineIcon sx={{ fontSize: 28 }} />
            <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
              Seguimiento del Contrato
            </Typography>
          </Box>
          <IconButton 
            onClick={handleClose} 
            disabled={isSubmitting}
            sx={{ 
              color: 'white',
              '&:hover': { 
                backgroundColor: 'rgba(255,255,255,0.1)',
                transform: 'rotate(90deg)',
                transition: 'transform 0.2s ease'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, backgroundColor: '#f8fafc' }}>
          {/* Formulario para agregar evento */}
          <Paper 
            elevation={0} 
            sx={{ 
              m: 3, 
              p: 3, 
              borderRadius: 2,
              border: '1px solid #e2e8f0',
              background: 'white'
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                color: '#374151',
                fontWeight: 600
              }}
            >
              <AddIcon sx={{ color: '#000fa0' }} />
              Agregar   
            </Typography>
            
            <TextField
              label="Detalles"
              fullWidth
              multiline
              rows={2}
              value={nuevoEvento}
              onChange={(e) => setNuevoEvento(e.target.value)}
              disabled={isSubmitting}
              variant="outlined"
              placeholder="Agrega una observación o detalle del contrato..."
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#000fa0',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#000fa0',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#000fa0',
                },
              }}
            />
            
            <Button
              onClick={handleAgregarEvento}
              variant="contained"
              startIcon={isSubmitting ? null : <AddIcon />}
              disabled={isSubmitting || !nuevoEvento.trim()}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                backgroundColor: '#000fa0',
                boxShadow: '0 4px 15px rgba(0, 15, 160, 0.3)',
                '&:hover': {
                  backgroundColor: '#0012d9',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(0, 15, 160, 0.4)',
                },
                transition: 'all 0.2s ease'
              }}
            >
              {isSubmitting ? "Guardando..." : "Agregar"}
            </Button>
          </Paper>

          {/* Timeline de eventos */}
          <Box sx={{ px: 3, pb: 3 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                color: '#374151',
                fontWeight: 600
              }}
            >
              <EventIcon sx={{ color: '#000fa0' }} />
              Historial
              <Chip 
                label={seguimientos.length} 
                size="small" 
                sx={{ 
                  ml: 1,
                  backgroundColor: '#000fa0',
                  color: 'white',
                  fontWeight: 600
                }}
              />
            </Typography>

            {loading ? (
              <Paper 
                elevation={0}
                sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  borderRadius: 2,
                  border: '1px solid #e2e8f0',
                  background: 'white'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <AccessTimeIcon sx={{ color: '#9ca3af', animation: 'pulse 2s infinite' }} />
                  <Typography variant="body1" color="textSecondary">
                    Cargando seguimiento...
                  </Typography>
                </Box>
              </Paper>
            ) : seguimientos.length === 0 ? (
              <Paper 
                elevation={0}
                sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  borderRadius: 2,
                  border: '1px solid #e2e8f0',
                  background: 'white'
                }}
              >
                <EventIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 1 }} />
                <Typography variant="body1" color="textSecondary" sx={{ fontWeight: 500 }}>
                  No hay detalles de seguimiento
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Agrega la primera observación para comenzar el seguimiento
                </Typography>
              </Paper>
            ) : (
              <Box sx={{ position: 'relative' }}>
                {/* Línea del timeline */}
                <Box
                  sx={{
                    position: 'absolute',
                    left: 20,
                    top: 0,
                    bottom: 0,
                    width: 2,
                    backgroundColor: '#3366ff',
                    borderRadius: 1,
                    opacity: 0.3
                  }}
                />
                
                <List sx={{ p: 0 }}>
                  {seguimientos.map((item, index) => (
                    <Grow 
                      key={index} 
                      in={true} 
                      timeout={300 + index * 100}
                      style={{ transformOrigin: '0 0 0' }}
                    >
                      <Paper
                        elevation={0}
                        sx={{
                          mb: 2,
                          ml: 5,
                          borderRadius: 2,
                          border: '1px solid #e2e8f0',
                          background: 'white',
                          position: 'relative',
                          '&:hover': {
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            transform: 'translateX(4px)',
                            transition: 'all 0.2s ease'
                          }
                        }}
                      >
                        {/* Punto del timeline */}
                        <Box
                          sx={{
                            position: 'absolute',
                            left: -33,
                            top: 20,
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: index === 0 ? '#10b981' : '#000fa0',
                            border: '3px solid white',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            zIndex: 1
                          }}
                        />
                        
                        <ListItem sx={{ p: 3 }}>
                          <ListItemText
                            primary={
                              <Typography 
                                variant="body1" 
                                sx={{ 
                                  fontWeight: 500,
                                  color: '#374151',
                                  mb: 1,
                                  lineHeight: 1.5
                                }}
                              >
                                {item.Descripcion}
                              </Typography>
                            }
                            secondary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                <AccessTimeIcon sx={{ fontSize: 16, color: '#9ca3af' }} />
                                <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500 }}>
                                  {formatDate(item.FechaCreacion)}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      </Paper>
                    </Grow>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions 
          sx={{ 
            p: 3, 
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0'
          }}
        >
          <Button 
            onClick={handleClose} 
            disabled={isSubmitting}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              borderColor: '#d1d5db',
              color: '#6b7280',
              '&:hover': {
                borderColor: '#9ca3af',
                backgroundColor: '#f9fafb'
              }
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        TransitionComponent={Fade}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          sx={{ 
            width: "100%",
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

     
    </>
  );
}