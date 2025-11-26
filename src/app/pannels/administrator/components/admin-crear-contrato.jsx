import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import Paso1 from "./CrearContratosSecciones/admin-crear-contrato-section-1";
import Paso2 from "./CrearContratosSecciones/admin-crear-contrato-section-2";
import Paso3 from "./CrearContratosSecciones/admin-crear-contrato-section-3";
import Paso4 from "./CrearContratosSecciones/admin-crear-contrato-section-4";

const apiUrl = process.env.REACT_APP_API_URL;

export default function CreateContratoPage() {
  const [empresas, setEmpresas] = useState([]);
  const [objetos, setObjetos] = useState([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState(null);
  const [aceptaValorCero, setAceptaValorCero] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isHeaderLocked, setIsHeaderLocked] = useState(false);
  const [formData, setFormData] = useState({
    IdObjeto: "",
    IdMes: "",
    Anio: new Date().getFullYear(),
    Contraparte: "",
    FechaInicio: "",
    FechaTerminacion: "",
    Plazo: 0,
    EsIndefinido: false,
    Valor: ""
  });
  const [idContratoCreado, setIdContratoCreado] = useState(null);
  const [camposContrato, setCamposContrato] = useState([]);
  const [isSubmittingCampos, setIsSubmittingCampos] = useState(false);
  const [contratoGenerado, setContratoGenerado] = useState(null);

  // Fetch empresas
  useEffect(() => {
    fetch(`${apiUrl}/portal_contratos/GestionEmpresa/Obtener`, {
      method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }
    }).then(res => res.json()).then(data => setEmpresas(data));
  }, []);

  // Fetch objetos por empresa
  useEffect(() => {
    if (!selectedEmpresa) return;
    fetch(`${apiUrl}/portal_contratos/objeto/ObtenerObjetosActivosPorEmpresa/${selectedEmpresa}`, {
      method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }
    }).then(res => res.json()).then(data => setObjetos(data));
  }, [selectedEmpresa]);

  const handleEmpresaSelect = (id) => {
    setSelectedEmpresa(id);
    setCurrentStep(2);
  };

  const handleCancel = () => {
    setSelectedEmpresa(null);
    setCurrentStep(1);
    setIsHeaderLocked(false);
    setFormData({
      IdObjeto: "",
      IdMes: "",
      Anio: new Date().getFullYear(),
      Contraparte: "",
      FechaPedido: "",
      FechaSuscripcion: "",
      FechaTerminacion: "",
      PlazoDias: 0,
      PlazoMeses: 0,
      PlazoAnios: 0,
      EsIndefinido: false,
      Valor: ""
    });
    setObjetos([]);
    setAceptaValorCero(false);
    setIdContratoCreado(null);
    setCamposContrato([]);
    setContratoGenerado(null);
  };

  const handleSubmitHeader = async (e) => {
    e.preventDefault();
    if (!selectedEmpresa) return;

    if (!aceptaValorCero && Number(formData.Valor) <= 0) {
      Swal.fire("Error", "El valor debe ser mayor que 0 para este objeto", "error");
      return;
    }

    try {
      const response = await fetch(
        `${apiUrl}/portal_contratos/contratos/AgregarContrato`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ ...formData, IdEmpresa: selectedEmpresa }),
        }
      );
      if (!response.ok) throw new Error("Error al agregar contrato");

      const data = await response.json();
      const contratoId = data.IdContrato;
      setIdContratoCreado(contratoId);
      setIsHeaderLocked(true);
      setCurrentStep(3);

      const camposRes = await fetch(
        `${apiUrl}/portal_contratos/campos_contrato/ObtenerCamposPorContrato/${contratoId}`,
        { method: "GET", credentials: "include" }
      );
      const camposData = await camposRes.json();
      setCamposContrato(camposData);

      Swal.fire("Éxito", "Cabecera del contrato creada correctamente", "success");
    } catch (err) {
      Swal.fire("Error", "No se pudo crear la cabecera del contrato", "error");
    }
  };

  const handleCampoChange = (idCampo, value) => {
    setCamposContrato(prev =>
      prev.map(c => c.IdCampoContrato === idCampo ? { ...c, Dato: value } : c)
    );
  };

  const handleSubmitCampos = async () => {
    if (!idContratoCreado || !formData.IdObjeto) return;

    const camposVacios = camposContrato.filter(c => !c.Dato || c.Dato.trim() === "");
    if (camposVacios.length > 0) {
      Swal.fire("Error", "Todos los campos son obligatorios", "error");
      return;
    }

    setIsSubmittingCampos(true);
    try {
      const camposData = camposContrato.map(c => ({
        IdCampoContrato: c.IdCampoContrato,
        IdContrato: idContratoCreado,
        IdCampoObjeto: c.IdCampoObjeto,
        Dato: c.Dato
      }));

      const response = await fetch(
        `${apiUrl}/portal_contratos/campos_contrato/CrearContrato/${formData.IdObjeto}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(camposData),
        }
      );

      if (!response.ok) throw new Error("Error al guardar los campos del contrato");

      const data = await response.json();
      setContratoGenerado(data);
      setCurrentStep(4);

      Swal.fire({
        title: "¡Contrato Completado!",
        text: "El contrato se ha creado exitosamente",
        icon: "success",
        confirmButtonText: "Ver Contrato"
      });

    } catch (err) {
      Swal.fire("Error", "No se pudieron guardar los campos del contrato", "error");
    } finally {
      setIsSubmittingCampos(false);
    }
  };

  const handleNuevoContrato = () => {
    handleCancel();
  };

  const getStepClass = (step) => {
    if (step < currentStep) return "completed";
    if (step === currentStep) return "active";
    return "pending";
  };

  return (
    <div className="container-fluid mt-4">
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h3 className="card-title mb-4">
            <i className="fas fa-file-contract me-2"></i>
            Crear Nuevo Contrato
          </h3>
          
          <div className="progress-container mb-4">
            <div className="d-flex justify-content-between align-items-center">
              <div className={`step-indicator ${getStepClass(1)}`}>
                <div className="step-number">1</div>
                <div className="step-label">Seleccionar Empresa</div>
              </div>
              <div className="progress-line"></div>
              <div className={`step-indicator ${getStepClass(2)}`}>
                <div className="step-number">2</div>
                <div className="step-label">Información del Contrato</div>
              </div>
              <div className="progress-line"></div>
              <div className={`step-indicator ${getStepClass(3)}`}>
                <div className="step-number">3</div>
                <div className="step-label">Campos Específicos</div>
              </div>
              <div className="progress-line"></div>
              <div className={`step-indicator ${getStepClass(4)}`}>
                <div className="step-number">4</div>
                <div className="step-label">Contrato Generado</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Render de pasos */}
      {currentStep === 1 && <Paso1 empresas={empresas} selectedEmpresa={selectedEmpresa} onSelectEmpresa={handleEmpresaSelect} />}
      {currentStep === 2 && <Paso2
        formData={formData}
        setFormData={setFormData}
        objetos={objetos}
        handleSubmitHeader={handleSubmitHeader}
        isHeaderLocked={isHeaderLocked}
        selectedEmpresa={selectedEmpresa}
        empresas={empresas}
        handleCancel={handleCancel}
        aceptaValorCero={aceptaValorCero}
      />}
      {currentStep === 3 && <Paso3
        camposContrato={camposContrato}
        handleCampoChange={handleCampoChange}
        handleSubmitCampos={handleSubmitCampos}
        isSubmittingCampos={isSubmittingCampos}
      />}
      {currentStep === 4 && contratoGenerado && <Paso4
        contratoGenerado={contratoGenerado}
        handleNuevoContrato={handleNuevoContrato}
      />}
    </div>
  );
}
