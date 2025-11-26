import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import JobZImage from "../../../../common/jobz-img";
import { adminRoute, administrador } from "../../../../../globals/route-names";
import { publicUrlFor } from "../../../../../globals/constants";

const apiUrl = process.env.REACT_APP_API_URL;

function Home1Page() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [contrasenia, setContrasenia] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [verificandoAuth, setVerificandoAuth] = useState(true);

  // Verificar si ya está autenticado al cargar la página
  useEffect(() => {
    const verificarAutenticacion = async () => {
      try {
        const response = await fetch(`${apiUrl}/portal_contratos/login/ObtenerRol`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          }
        });

        if (response.ok) {
          // Si ya está autenticado, redirigir al dashboard
          console.log("Usuario ya autenticado, redirigiendo...");
          navigate(adminRoute(administrador.GESTIONAR_CONTRATOS));
          return;
        }
      } catch (error) {
        console.log("Usuario no autenticado o error:", error);
      } finally {
        setVerificandoAuth(false);
      }
    };

    verificarAutenticacion();
  }, [navigate]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setMensajeError("");

    try {
      const res = await fetch(`${apiUrl}/portal_contratos/login/IniciarSesion`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Usuario: usuario, Contrasenia: contrasenia }),
      });

      const data = await res.json();

      if (res.ok) {
        navigate(adminRoute(administrador.GESTIONAR_CONTRATOS));
      } else {
        setMensajeError(data.Message || "Error al iniciar sesión");
      }
    } catch (error) {
      console.error(error);
      setMensajeError("No se pudo conectar con el servidor.");
    }
  };

  // Mostrar loading mientras verifica autenticación
  if (verificandoAuth) {
    return (
      <div className="section-full">
        <div className="container">
          <div className="row justify-content-center align-items-center min-vh-100">
            <div className="col-md-6 col-sm-10">
              <div className="p-4 shadow rounded bg-white text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Verificando...</span>
                </div>
                <p className="mt-3">Verificando autenticación...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-full">
        <div className="bubbles">
    <span className="bubble"></span>
    <span className="bubble"></span>
    <span className="bubble"></span>
    <span className="bubble"></span>
    <span className="bubble"></span>
    <span className="bubble"></span>
    <span className="bubble"></span>
    <span className="bubble"></span>
  </div>
      <div className="container">
        <div className="row justify-content-center align-items-center min-vh-100">
          {/* Formulario centrado */}
          <div className="col-md-6 col-sm-10">
            <div className="p-4 shadow rounded bg-white">
              <div className="mx-auto mb-4" style={{ maxWidth: "230px" }}>
                <JobZImage src="images/logo_ccq.png" alt="logo" className="d-block w-100" />
              </div>

              <h3 className="text-center mb-3">Iniciar Sesión</h3>

              <form onSubmit={handleLogin}>
                <div className="form-group mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Usuario"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group mb-3">
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Contraseña"
                    value={contrasenia}
                    onChange={(e) => setContrasenia(e.target.value)}
                    required
                  />
                </div>

                {mensajeError && (
                  <div className="alert alert-danger text-center py-2">
                    {mensajeError}
                  </div>
                )}
                <button type="submit" className="btn btn-primary w-100">
                  Ingresar
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home1Page;