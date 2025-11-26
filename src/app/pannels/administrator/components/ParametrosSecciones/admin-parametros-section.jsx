import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Button,
  Snackbar,
  TextField,
  Switch,
  Chip,
  IconButton,
  Grid,
  Paper,
  Divider
} from "@mui/material";
import { Add as AddIcon, Close as CloseIcon, Settings as SettingsIcon } from "@mui/icons-material";

const apiUrl = process.env.REACT_APP_API_URL;

function AdminParametrosSection() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [nuevoValor, setNuevoValor] = useState({});

  const obtenerRegistros = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${apiUrl}/portal_contratos/parametros/ObtenerParametros`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

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

  const handleGuardar = async (param) => {
    try {
      const url = `${apiUrl}/portal_contratos/parametros/ActualizarParametro`;

      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(param)
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      setSnackbar({
        open: true,
        message: "Parámetro actualizado correctamente"
      });
      obtenerRegistros();
    } catch (error) {
      console.error("Error al guardar:", error);
      setSnackbar({ open: true, message: "Error al guardar el parámetro" });
    }
  };

  const handleSwitchChange = async (param, checked) => {
    const updatedParam = { ...param, Valor: checked.toString() };
    await handleGuardar(updatedParam);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const agregarDia = (index) => {
    const valor = nuevoValor[index];
    if (!valor || isNaN(valor) || valor <= 0) return;

    setRegistros((prev) =>
      prev.map((p, i) => {
        if (i === index) {
          const dias = p.Valor ? p.Valor.split(",").map(d => d.trim()) : [];
          if (!dias.includes(valor)) {
            dias.push(valor);
            dias.sort((a, b) => parseInt(a) - parseInt(b));
            return { ...p, Valor: dias.join(",") };
          }
        }
        return p;
      })
    );
    setNuevoValor({ ...nuevoValor, [index]: "" });
  };

  const eliminarDia = (index, dia) => {
    setRegistros((prev) =>
      prev.map((p, i) => {
        if (i === index) {
          const dias = p.Valor.split(",").map(d => d.trim()).filter(d => d !== dia);
          return { ...p, Valor: dias.join(",") };
        }
        return p;
      })
    );
  };

  const esSwitch = (codigo) => {
    return [
      "LEG_NotificarCreacionContrato",
      "LEG_NotificacionFirmaContrato",
      "LEG_NotificacionObservaciones"
    ].includes(codigo);
  };

  // Ordenar registros: switches primero
  const registrosOrdenados = [...registros].sort((a, b) => {
    const aEsSwitch = esSwitch(a.Codigo);
    const bEsSwitch = esSwitch(b.Codigo);
    if (aEsSwitch && !bEsSwitch) return -1;
    if (!aEsSwitch && bEsSwitch) return 1;
    return 0;
  });

  const renderSwitchCard = (param) => (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        border: "1px solid #e0e0e0",
        bgcolor: "white",
        transition: "all 0.2s",
        height: "100%",
        "&:hover": {
          borderColor: "#000fa0",
          boxShadow: "0 2px 8px rgba(0,15,160,0.1)"
        }
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ flex: 1, pr: 2 }}>
          <Typography variant="body1" fontWeight={600} sx={{ mb: 0.5, color: "#1a1a1a" }}>
            {param.Descripcion}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {param.Valor === "true" || param.Valor === true ? "Activo" : "Inactivo"}
          </Typography>
        </Box>
        <Switch
          checked={param.Valor === "true" || param.Valor === true}
          onChange={(e) => handleSwitchChange(param, e.target.checked)}
          sx={{
            "& .MuiSwitch-switchBase.Mui-checked": {
              color: "#000fa0"
            },
            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
              backgroundColor: "#000fa0"
            }
          }}
        />
      </Box>
    </Paper>
  );

  const renderCampoAvanzado = (param, index) => {
    if (param.Codigo === "LEG_NotificacionVencimientoContrato") {
      const dias = param.Valor ? param.Valor.split(",").map(d => d.trim()).filter(d => d) : [];
      return (
        <Card
          elevation={0}
          sx={{
            border: "1px solid #e0e0e0",
            borderRadius: 2,
            overflow: "hidden",
            bgcolor: "white"
          }}
        >
          <Box
            sx={{
              p: 3,
              bgcolor: "#000fa0",
              color: "white"
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              {param.Descripcion}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              Configura los días de anticipación para las notificaciones
            </Typography>
          </Box>

          <CardContent sx={{ p: 3 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 600 }}>
                Días configurados:
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {dias.length > 0 ? (
                  dias.map((dia, i) => (
                    <Chip
                      key={i}
                      label={`${dia} días antes`}
                      onDelete={() => eliminarDia(index, dia)}
                      sx={{
                        bgcolor: "#000fa0",
                        color: "white",
                        fontWeight: 500,
                        "& .MuiChip-deleteIcon": {
                          color: "rgba(255,255,255,0.8)",
                          "&:hover": {
                            color: "white"
                          }
                        }
                      }}
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                    No hay días configurados
                  </Typography>
                )}
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
              <TextField
                label="Agregar días"
                type="number"
                size="small"
                value={nuevoValor[index] || ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setNuevoValor({ ...nuevoValor, [index]: value });
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    agregarDia(index);
                  }
                }}
                sx={{ flex: 1 }}
                InputProps={{
                  inputProps: { min: 1 }
                }}
                placeholder="Ejemplo: 30"
              />
              <Button
                variant="contained"
                onClick={() => agregarDia(index)}
                disabled={!nuevoValor[index] || nuevoValor[index] <= 0}
                startIcon={<AddIcon />}
                sx={{
                  bgcolor: "#000fa0",
                  "&:hover": {
                    bgcolor: "#000c80"
                  }
                }}
              >
                Agregar
              </Button>
            </Box>

            <Box sx={{ mt: 2.5, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                onClick={() => handleGuardar(param)}
                disabled={dias.length === 0}
                sx={{
                  bgcolor: "#000fa0",
                  "&:hover": {
                    bgcolor: "#000c80"
                  },
                  "&:disabled": {
                    bgcolor: "rgba(0,0,0,0.12)"
                  }
                }}
              >
                Guardar Configuración
              </Button>
            </Box>
          </CardContent>
        </Card>
      );
    }

    // Otros campos
    return (
      <Card
        elevation={0}
        sx={{
          border: "1px solid #e0e0e0",
          borderRadius: 2,
          bgcolor: "white"
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <TextField
            label={param.Descripcion}
            type={param.Codigo === "LEG_NotificacionSubirArchivoFirmado" ? "number" : "text"}
            fullWidth
            value={param.Valor}
            onChange={(e) =>
              setRegistros((prev) =>
                prev.map((p, i) =>
                  i === index ? { ...p, Valor: e.target.value.replace(/\D/g, "") } : p
                )
              )
            }
            helperText={param.Codigo === "LEG_NotificacionSubirArchivoFirmado" ? "Número de días" : ""}
            InputProps={{
              inputProps: param.Codigo === "LEG_NotificacionSubirArchivoFirmado" ? { min: 0 } : {}
            }}
          />
          <Box sx={{ mt: 2.5, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              onClick={() => handleGuardar(param)}
              sx={{
                bgcolor: "#000fa0",
                "&:hover": {
                  bgcolor: "#000c80"
                }
              }}
            >
              Guardar
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
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
          Cargando parámetros...
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

  const switchParams = registrosOrdenados.filter((p, i) => esSwitch(p.Codigo)).map((p, idx) => ({ param: p, index: registros.indexOf(p) }));
  const otrosParams = registrosOrdenados.filter((p, i) => !esSwitch(p.Codigo)).map((p, idx) => ({ param: p, index: registros.indexOf(p) }));

  return (
    <Box sx={{ width: "100%", bgcolor: "#f5f5f5", minHeight: "100vh" }}>
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
            <SettingsIcon sx={{ fontSize: 40, color: "#000fa0" }} />
            <Typography variant="h4" component="h1" fontWeight={700} sx={{ color: "#1a1a1a" }}>
              Configuración de Parámetros
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Gestiona las notificaciones y configuraciones del sistema
          </Typography>
        </Box>

        {/* Notificaciones Toggle */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: "#1a1a1a" }}>
            Notificaciones
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {switchParams.map(({ param }) => (
              <Box key={param.IdParametroGenerales}>
                {renderSwitchCard(param)}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Configuración Avanzada */}
        <Box>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: "#1a1a1a" }}>
            Configuración Avanzada
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {otrosParams.map(({ param, index }) => (
              <Box key={param.IdParametroGenerales}>
                {renderCampoAvanzado(param, index)}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default AdminParametrosSection;