import { useEffect, useState } from "react";
import {  } from "@mui/material";
import DataGrid, { 
  Column, 
  Pager, 
  FilterRow, 
  HeaderFilter, 
  SearchPanel, 
  Export,
  Selection,
  LoadPanel,
  StateStoring,
  ColumnChooser,
  ColumnFixing,
  GroupPanel,
  Grouping,
  Summary,
  TotalItem,
  Sorting,
  Toolbar,
  Item
} from 'devextreme-react/data-grid';
import {
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Snackbar,
  Alert,
  Typography,
  Card,
  CardContent,
  Button,
  Checkbox,
  Tooltip, 
  CircularProgress
} from "@mui/material";
import { MoreVert, Edit, Upload, FilePresent, Refresh } from "@mui/icons-material";
import ContratoFormModal from "./edit-contrato-modal";
import EditarCamposModal from "./edit-campos-modal";
import SeguimientoContratoModal from "./seguimiento-contrato-modal";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import 'devextreme/dist/css/dx.light.css';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { exportDataGrid } from 'devextreme/excel_exporter';
import config from 'devextreme/core/config';
import { Eye } from "lucide-react";

const MySwal = withReactContent(Swal);
const apiUrl = process.env.REACT_APP_API_URL;

export default function AdminManageContractsTable() {
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedContrato, setSelectedContrato] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editarCamposOpen, setEditarCamposOpen] = useState(false);
  const [seguimientoOpen, setSeguimientoOpen] = useState(false);
  const [rol, setRol] = useState(null); 
  const [loadingContratoId, setLoadingContratoId] = useState(null);


  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [dataGridInstance, setDataGridInstance] = useState(null);

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  useEffect(() => {
         
          fetch(`${apiUrl}/portal_contratos/login/ObtenerRol`, {
              method: "POST",
              credentials: "include", 
              headers: {
                  "Content-Type": "application/json"
              },
              body: null
          })
          .then(res => {
              if (!res.ok) throw new Error("No autorizado");
              
              return res.json();
          })
          .then(data => {
              setRol(data); 
          })
          .catch(err => {
              console.error(err);
              setRol(null); 
          });
      }, []);
  

  const fetchContratos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/portal_contratos/contratos/ObtenerContratosPorUsuario`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Error al obtener contratos");
      const data = await res.json();
      setContratos(data);
    } catch (err) {
      setSnackbar({ open: true, message: "No se pudo obtener los contratos", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    config({
      floatingActionButtonConfig: {
        icon: 'export',
        closeOnOutsideClick: true,
        position: {
          at: 'right bottom',
          my: 'right bottom',
          offset: '-16 -16'
        }
      },
      useHtml5DataType: false,
      defaultCurrency: 'USD',
      rtlEnabled: false,
      forceIsoDateParsing: true,
      serverDecimalSeparator: '.',
      editorStylingMode: 'outlined'
    });
    
    fetchContratos();
  }, []);

  const handleMenuOpen = (event, contrato) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedContrato(contrato);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditarCabecera = () => {
    if (selectedContrato) {
      setModalOpen(true);
    }
    handleMenuClose();
  };

  const handleEditarCamposClick = () => {
    if (selectedContrato) {
      setEditarCamposOpen(true);
    }
    handleMenuClose();
  };

  const handleSeguimiento = (e, contrato) => {
    e.stopPropagation();
    setSelectedContrato(contrato);
    setSeguimientoOpen(true);
  };


  const handleCargarArchivoFirmado = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/pdf";

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.type !== "application/pdf") {
        setSnackbar({ open: true, message: "Solo se permiten archivos PDF", severity: "error" });
        return;
      }

      const result = await MySwal.fire({
        title: "¿Está seguro?",
        html: `Está a punto de subir el archivo:<br><b>${file.name}</b><br><br>Una vez cargado, no podrá editarlo.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, subir",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
      });

      if (!result.isConfirmed) return;

      try {
        const formData = new FormData();
        formData.append("ContratoFirmado", file);

        const response = await fetch(
          `${apiUrl}/portal_contratos/contratos/ActualizarContratoFirmado/${selectedContrato.IdContrato}`,
          {
            method: "POST",
            body: formData,
            credentials: "include",
          }
        );

        if (!response.ok) throw new Error("Error al subir el archivo firmado");

        setSnackbar({
          open: true,
          message: "Archivo firmado subido correctamente",
          severity: "success",
        });

        fetchContratos();
      } catch (err) {
        setSnackbar({
          open: true,
          message: err.message || "Error al subir archivo",
          severity: "error",
        });
      }
    };

    input.click();
    handleMenuClose();
  };

  const handleCargarArchivoWord = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".doc,.docx"; // extensiones permitidas

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Tipos MIME válidos para archivos Word
      const validTypes = [
        "application/msword", // .doc
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" // .docx
      ];

      if (!validTypes.includes(file.type)) {
        setSnackbar({
          open: true,
          message: "Solo se permiten archivos Word (.doc o .docx)",
          severity: "error"
        });
        return;
      }

      const result = await MySwal.fire({
        title: "¿Está seguro?",
        html: `Está a punto de subir el archivo:<br><b>${file.name}</b>`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, subir",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
      });

      if (!result.isConfirmed) return;

      try {
        const formData = new FormData();
        formData.append("ArchivoWord", file);

        const response = await fetch(
          `${apiUrl}/portal_contratos/contratos/ActualizarWordSimplificado/${selectedContrato.IdContrato}`,
          {
            method: "POST",
            body: formData,
            credentials: "include",
          }
        );

        if (!response.ok) throw new Error("Error al subir el archivo word");

        setSnackbar({
          open: true,
          message: "Archivo Word subido correctamente",
          severity: "success",
        });

        fetchContratos();
      } catch (err) {
        setSnackbar({
          open: true,
          message: err.message || "Error al subir archivo",
          severity: "error",
        });
      }
    };

    input.click();
    handleMenuClose();
  };

  const handleCargarArchivoPDFSinFirma = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/pdf";

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.type !== "application/pdf") {
        setSnackbar({ open: true, message: "Solo se permiten archivos PDF", severity: "error" });
        return;
      }

      const result = await MySwal.fire({
        title: "¿Está seguro?",
        html: `Está a punto de subir el archivo:<br><b>${file.name}</b>`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, subir",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
      });

      if (!result.isConfirmed) return;

      try {
        const formData = new FormData();
        formData.append("ContratoSinFirma", file);

        const response = await fetch(
          `${apiUrl}/portal_contratos/contratos/ActualizarPDFSinFirmaSimplificado/${selectedContrato.IdContrato}`,
          {
            method: "POST",
            body: formData,
            credentials: "include",
          }
        );

        if (!response.ok) throw new Error("Error al subir el archivo sin firma");

        setSnackbar({
          open: true,
          message: "Archivo sin firma subido correctamente",
          severity: "success",
        });

        fetchContratos();
      } catch (err) {
        setSnackbar({
          open: true,
          message: err.message || "Error al subir archivo",
          severity: "error",
        });
      }
    };

    input.click();
    handleMenuClose();
  };

  const handleModalClose = (refrescar = false) => {
    setModalOpen(false);
    setSelectedContrato(null);
    if (refrescar) fetchContratos();
  };

  const handleEditarCamposClose = (actualizado = false) => {
    setEditarCamposOpen(false);
    setSelectedContrato(null);
    if (actualizado) fetchContratos();
  };

  const handleSeguimientoClose = (actualizado = false) => {
    setSeguimientoOpen(false);
    setSelectedContrato(null);
    if (actualizado) fetchContratos();
  };

  const handleResetFilters = () => {
    if (dataGridInstance) {
      dataGridInstance.clearFilter();
      dataGridInstance.clearSorting();
      dataGridInstance.clearGrouping();
      setSnackbar({
        open: true,
        message: "Filtros y ordenamiento restablecidos",
        severity: "success",
      });
    }
  };

  const formatDate = (dateString) => {
  if (!dateString) return "Sin definir";

  const fecha = new Date(dateString);
  
  // Validación de "fecha mínima"
  if (fecha.getFullYear() === 1 && fecha.getMonth() === 0 && fecha.getDate() === 1) {
    return "Sin definir";
  }

  return fecha.toLocaleDateString("es-ES");
};


  const renderEstado = (cellData) => {
    const { data } = cellData;
    const estadoTexto = data.Estado || data.NombreEstado || data.EstadoDescripcion || 'Sin estado';
    
    let color = "default";
    const estadoLower = estadoTexto.toLowerCase();
    
    if (estadoLower.includes('vigente') || estadoLower.includes('activo')) {
      color = "success";
    } else if (estadoLower.includes('no iniciado') || estadoLower.includes('pendiente') || estadoLower.includes('borrador')) {
      color = "warning";
    } else if (estadoLower.includes('finalizado') || estadoLower.includes('terminado') || estadoLower.includes('vencido')) {
      color = "default";
    } else if (estadoLower.includes('cancelado') || estadoLower.includes('suspendido')) {
      color = "error";
    }
    
    return (
      <Chip 
        label={estadoTexto} 
        color={color} 
        size="small" 
        variant="outlined" 
      />
    );
  };

  const renderArchivos = (cellData) => {
    const { data } = cellData;
    return (
      <Stack direction="row" spacing={0.5} alignItems="center">
        {data.UrlArchivoSinFirma && (
          <IconButton 
            size="small" 
            color="primary" 
            title="Archivo sin firma" 
            onClick={() => window.open(data.UrlArchivoSinFirma, "_blank")}
          >
            <FilePresent fontSize="small" />
          </IconButton>
        )}
        {data.UrlArchivoWord && rol == 1 &&(
          <IconButton 
            size="small"  
            title="Archivo word" 
            onClick={() => window.open(data.UrlArchivoWord, "_blank")}
          >
            <FilePresent fontSize="small" />
          </IconButton>
        )}
        {data.UrlArchivoFirmado && (
          <IconButton 
            size="small" 
            color="success" 
            title="Archivo firmado" 
            onClick={() => window.open(data.UrlArchivoFirmado, "_blank")}
          >
            <FilePresent fontSize="small" />
          </IconButton>
        )}
      </Stack>
    );
  };

const handleRevisadoPorLegal = async (contrato, checked) => {
  setLoadingContratoId(contrato.IdContrato); // 🔹 inicia loading

  try {
    const res = await fetch(
      `${apiUrl}/portal_contratos/contratos/ActualizarRevisadoPorLegal/${contrato.IdContrato}`, 
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ RevisadoPorLegal: checked })
      }
    );

    if (!res.ok) throw new Error("Error al actualizar el estado");

    setSnackbar({
      open: true,
      message: checked 
        ? "Contrato marcado como revisado por legal" 
        : "Contrato desmarcado como revisado por legal",
      severity: "success",
    });

    await fetchContratos();
  } catch (err) {
    setSnackbar({
      open: true,
      message: err.message || "Error al actualizar",
      severity: "error",
    });
  } finally {
    setLoadingContratoId(null); 
  }
};

const renderAcciones = (cellData) => {
  const { data } = cellData;

  return (
    <Stack direction="row" spacing={0.5}>
      {rol == 1 && (
        <Tooltip title="Marcar cuando el área legal haya revisado el contrato">
          <span>
            
            {loadingContratoId === data.IdContrato ? 
            (
              <CircularProgress size={20} thickness={5} sx={{ ml: -1.5, mt: 0.5 }} /> // 🔹 indicador
            ):
            (<Checkbox
              checked={!!data.RevisadoPorLegal}
              disabled = {data.RevisadoPorLegal}
              onChange={(e) => handleRevisadoPorLegal(data, e.target.checked)}
            />)
            }
          </span>
        </Tooltip>
      )}


      {/* Botón de seguimiento */}
      <IconButton
        onClick={(e) => handleSeguimiento(e, data)}
        size="small"
        color="primary"
        title="Seguimiento"
      >
        <Eye fontSize="small" />
      </IconButton>

      {((data.PermitirEdicion && !data.IsCompleto) || (rol == 1&& !data.IsCompleto)) && (
  <IconButton
    onClick={(e) => handleMenuOpen(e, data)}
    size="small"
    color="primary"
    title="Opciones"
  >
    <MoreVert fontSize="small" />
  </IconButton>
)}

    </Stack>
  );
};


  const renderFecha = (cellData) => {
    const { value } = cellData;
    return formatDate(value);
  };

  const onExporting = (e) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Índice de contratos');

    exportDataGrid({
      component: e.component,
      worksheet: worksheet,
      autoFilterEnabled: true,
      customizeCell: function(options) {
        const excelCell = options.excelCell;
        excelCell.font = { name: 'Arial', size: 12 };
        excelCell.alignment = { horizontal: 'left' };
      }
    }).then(() => {
      workbook.xlsx.writeBuffer().then((buffer) => {
        saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Índice de contratos.xlsx');
      });
    });
    e.cancel = true;
  };

  const onToolbarPreparing = (e) => {
    e.toolbarOptions.items.forEach(item => {
      if (item.name === 'exportButton') {
        item.options = {
          ...item.options,
          dropDownOptions: {
            width: 200,
            position: {
              at: 'left bottom',
              my: 'left top',
              collision: 'flip'
            }
          }
        };
      }
    });
  };

  return (
    <>
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h5" fontWeight="bold">Contratos</Typography>
        </CardContent>
      </Card>

      <Box 
          className="custom-grid-container"
          sx={{ 
            mb: 2,
            display: 'flex',
            flexDirection: 'column',
            width: "100%",     
            flexGrow: 1,
          }}
        >
        <DataGrid
          id="contratos-grid"
          dataSource={contratos}
          keyExpr="IdContrato"
          showBorders={true}
          showRowLines={true}
          showColumnLines={true}
          allowColumnReordering={true}
          allowColumnResizing={true}
          columnAutoWidth={true}
          wordWrapEnabled={true}
          hoverStateEnabled={true}
          loadingTimeout={300}
          noDataText="No hay contratos disponibles"
          onExporting={onExporting}
          onToolbarPreparing={onToolbarPreparing}
          height="100%"
          repaintChangesOnly={true}
          cacheEnabled={true}
          scrolling={{ 
            mode: 'standard',
            useNative: true,
            showScrollbar: 'always'
          }}
          className="custom-datagrid"
          onInitialized={(e) => setDataGridInstance(e.component)}
        >
          <LoadPanel enabled={true} />
          <SearchPanel 
            visible={true} 
            placeholder="Buscar..." 
            width={300}
            highlightSearchText={true}
          />
          <ColumnChooser 
            enabled={true} 
            mode="select"
            allowSearch={true}
            width={300}
            height={400}
          />
          <Export 
            enabled={true} 
            fileName="Contratos" 
            allowExportSelectedData={false}
            formats={['xlsx']}
            texts={{
              exportTo: "Exportar a",
              exportAll: "Exportar todo"
            }}
          />
          <Selection mode="single" />
          <HeaderFilter 
            visible={true}
            allowSearch={true}
            width={250}
            height={300}
            position={{
              at: 'bottom left',
              my: 'top left',
              offset: { x: 0, y: 5 }
            }}
          />
          <Sorting mode="multiple" />
          <Toolbar>
            <Item name="groupPanel" location="before" />
            <Item location="after">
              <Button
                variant="outlined"
                size="small"
                startIcon={<Refresh />}
                onClick={handleResetFilters}
              >
                Resetear Filtros
              </Button>
            </Item>
            <Item name="searchPanel" locateInMenu="auto" />
            <Item name="exportButton" />
            <Item name="columnChooserButton" locateInMenu="auto" />
          </Toolbar>

          <Pager
            visible={true}
            allowedPageSizes={[10, 25, 50, 100]}
            displayMode="full"
            showPageSizeSelector={true}
            showInfo={true}
            showNavigationButtons={true}
            infoText="Página {0} de {1} ({2} contratos)"
          />

          <FilterRow 
            visible={true} 
            applyFilter="auto"
            resetOperationText="Reset"
          />
          <StateStoring 
            enabled={true} 
            type="localStorage" 
            storageKey="contratos-grid-state" 
          />
          <ColumnFixing enabled={true} />
          <GroupPanel 
            visible={true} 
            emptyPanelText="Arrastra una columna aquí para agrupar"
          />
          <Grouping autoExpandAll={false} />
          <Summary>
            <TotalItem
              column="IdContrato"
              summaryType="count"
              displayFormat="Total: {0} contratos"
            />
          </Summary>

          <Column
            dataField="ApellidosNombres"
            caption="Responsable"
            width={200}
            allowSorting={true}
            allowFiltering={true}
            allowHeaderFiltering={true}
            headerFilter={{
              allowSearch: true,
              width: 200,
              height: 250
            }}
          />
          <Column
            dataField="NombreContrato"
            caption="Nombre"
            width={150}
            allowSorting={true}
            allowFiltering={true}
            allowHeaderFiltering={true}
            headerFilter={{
              allowSearch: true,
              height: 250
            }}
          />
          <Column
            dataField="Contraparte"
            caption="Contraparte"
            width={180}
            allowSorting={true}
            allowFiltering={true}
            allowHeaderFiltering={true}
            headerFilter={{
              allowSearch: true,
              width: 200,
              height: 250
            }}
          />
          <Column
            dataField="Estado"
            caption="Estado"
            width={120}
            allowSorting={true}
            allowFiltering={true}
            allowHeaderFiltering={true}
            cellRender={renderEstado}
            headerFilter={{
              allowSearch: true,
              width: 180,
              height: 200
            }}
          />
          <Column
            dataField="NombreEmpresa"
            caption="Empresa"
            width={150}
            allowSorting={true}
            allowFiltering={true}
            allowHeaderFiltering={true}
            headerFilter={{
              allowSearch: true,
              width: 200,
              height: 250
            }}
          />
          <Column
            dataField="Valor"
            caption="Valor"
            width={100}
            allowSorting={true}
            allowFiltering={true}
            allowHeaderFiltering={true}
            headerFilter={{
              allowSearch: true,
              width: 200,
              height: 250
            }}
          />
          
          <Column
            dataField="FechaPedido"
            caption="Fecha Pedido"
            width={120}
            dataType="date"
            format="dd/MM/yyyy"
            allowSorting={true}
            allowFiltering={true}
            allowHeaderFiltering={true}
            cellRender={renderFecha}
            headerFilter={{
              allowSearch: false,
              width: 220,
              height: 300
            }}
          />
          
          <Column
            dataField="FechaSuscripcion"
            caption="Fecha Suscripción"
            width={120}
            dataType="date"
            format="dd/MM/yyyy"
            allowSorting={true}
            allowFiltering={true}
            allowHeaderFiltering={true}
            cellRender={renderFecha}
            headerFilter={{
              allowSearch: false,
              width: 220,
              height: 300
            }}
          />
          <Column
            dataField="FechaTerminacion"
            caption="Fecha Término"
            width={120}
            dataType="date"
            format="dd/MM/yyyy"
            allowSorting={true}
            allowFiltering={true}
            allowHeaderFiltering={true}
            cellRender={renderFecha}
            headerFilter={{
              allowSearch: false,
              width: 220,
              height: 300
            }}
          />
          <Column
            caption="Plazo"
            width={150}
            allowSorting={true}
            allowFiltering={true}
            allowHeaderFiltering={true}
            headerFilter={{ allowSearch: true, width: 200, height: 250 }}
            calculateCellValue={(rowData) => {
              const partes = [];
              if (rowData.PlazoAnios) partes.push(`${rowData.PlazoAnios} año${rowData.PlazoAnios > 1 ? "s" : ""}`);
              if (rowData.PlazoMeses) partes.push(`${rowData.PlazoMeses} mes${rowData.PlazoMeses > 1 ? "es" : ""}`);
              if (rowData.PlazoDias) partes.push(`${rowData.PlazoDias} día${rowData.PlazoDias > 1 ? "s" : ""}`);
              return partes.join(" ");
            }}
          />
         
          <Column
            dataField="EsIndefinido"
            caption="Indefinido"
            width={100}
            allowSorting={true}
            allowFiltering={true}
            allowHeaderFiltering={true}
            headerFilter={{
              allowSearch: true,
              width: 200,
              height: 250
            }}
          />
          <Column
            dataField="RevisadoPorLegal"
            caption="Revisado por Legal"
            width={100}
            allowSorting={true}
            allowFiltering={true}
            allowHeaderFiltering={true}
            headerFilter={{
              allowSearch: true,
              width: 200,
              height: 250
            }}
          />
          <Column
            caption="Archivos"
            width={120}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            cellRender={renderArchivos}
            allowExporting={false}
          />
          <Column
            caption="Acciones"
            width={120}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
            cellRender={renderAcciones}
            allowExporting={false}
            fixed={true}
            fixedPosition="right"
          />
        </DataGrid>
      </Box>

      <Menu 
        anchorEl={anchorEl} 
        open={Boolean(anchorEl)} 
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          style: {
            maxHeight: 48 * 4.5,
            width: '25ch',
          },
        }}
      >
        {selectedContrato?.RevisadoPorLegal ? (
            <>
            <MenuItem onClick={handleEditarCabecera}>
                <Edit fontSize="small" sx={{ mr: 1 }} />
                Editar Cabecera
              </MenuItem>
            <MenuItem onClick={handleCargarArchivoFirmado}>
              <Upload fontSize="small" sx={{ mr: 1 }} />
              Cargar Archivo Firmado
            </MenuItem>
            </>
          ) : (
            <>
              <MenuItem onClick={handleEditarCabecera}>
                <Edit fontSize="small" sx={{ mr: 1 }} />
                Editar Cabecera
              </MenuItem>
              <MenuItem onClick={handleEditarCamposClick}>
                <Edit fontSize="small" sx={{ mr: 1 }} />
                Editar Campos
              </MenuItem>
            </>
          )}
          {selectedContrato?.EsCreadoPorSimplificado && rol == 1 && (
            <>
            <MenuItem onClick={handleCargarArchivoWord}>
                <Upload fontSize="small" sx={{ mr: 1 }} />
                Actualizar Word
              </MenuItem>
            <MenuItem onClick={handleCargarArchivoPDFSinFirma}>
              <Upload fontSize="small" sx={{ mr: 1 }} />
              Actualizar PDF sin firma
            </MenuItem>
            </>
          ) }
      </Menu>

      {selectedContrato && (
        <ContratoFormModal
          open={modalOpen}
          onClose={handleModalClose}
          contrato={selectedContrato}
          onSaved={(msg) => {
            setSnackbar({ open: true, message: msg, severity: "success" });
            fetchContratos();
          }}
          onError={(msg) => setSnackbar({ open: true, message: msg, severity: "error" })}
        />
      )}

      {selectedContrato && (
        <EditarCamposModal
          open={editarCamposOpen}
          onClose={handleEditarCamposClose}
          idContrato={selectedContrato.IdContrato}
          idObjeto={selectedContrato.IdObjeto}
          contrato={selectedContrato}
          onSuccess={(msg) => {
            setSnackbar({ open: true, message: msg, severity: "success" });
          }}
          onError={(msg) => {
            setSnackbar({ open: true, message: msg, severity: "error" });
          }}
        />
      )}

      {selectedContrato && (
        <SeguimientoContratoModal
          open={seguimientoOpen}
          onClose={handleSeguimientoClose}
          idContrato={selectedContrato.IdContrato}
          onSuccess={(msg) => {
            setSnackbar({ open: true, message: msg, severity: "success" });
          }}
          onError={(msg) => {
            setSnackbar({ open: true, message: msg, severity: "error" });
          }}
        />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}