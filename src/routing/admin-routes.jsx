import { Route, Routes, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { administrador } from "../globals/route-names";

import AdminDashboardPage from "../app/pannels/administrator/components/admin-dashboard";
import AdminCamposGenerales from "../app/pannels/administrator/components/admin-campos-generales";
import AdminTipos from "../app/pannels/administrator/components/admin-tipos";
import AdminParametros from "../app/pannels/administrator/components/admin-parametros";
import AdminGestionarContratos from "../app/pannels/administrator/components/admin-gestionar-contratos";
import AdminCrearContrato from "../app/pannels/administrator/components/admin-crear-contrato";
import AdminObjetos from "../app/pannels/administrator/components/admin-objetos";
import AdminCamposContrato from "../app/pannels/administrator/components/admin-campos";
import CrearContratoSimplificado from "../app/pannels/administrator/components/admin-crear-contrato-simplificado";

import Error404Page from "../app/pannels/public-user/components/pages/error404";

const apiUrl = process.env.REACT_APP_API_URL;


function useEmployerAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch(`${apiUrl}/portal_contratos/login/ObtenerRol`, {
                    method: "POST",
                    credentials: "include", // Incluir cookies HttpOnly
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

                if (response.ok) {
                    const rol = await response.json();
                    setIsAuthenticated(true);
                } else {
                    console.log("No autorizado o cookie expirada");
                    setIsAuthenticated(false);
                    
                    sessionStorage.clear();
                }
            } catch (error) {
                console.error("Error verificando autenticación:", error);
                setIsAuthenticated(false);
                sessionStorage.clear();
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();

        const handleFocus = () => {
            if (!isLoading) {
                checkAuth();
            }
        };

        window.addEventListener("focus", handleFocus);
        window.addEventListener("storage", checkAuth);
        
        return () => {
            window.removeEventListener("focus", handleFocus);
            window.removeEventListener("storage", checkAuth);
        };
    }, [isLoading]);

    return { isAuthenticated, isLoading };
}

function ProtectedEmployerRoute({ children }) {
    const { isAuthenticated, isLoading } = useEmployerAuth();

    if (isLoading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                fontSize: '18px'
            }}>
                <div>Verificando autenticación...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
}

// Rutas del administrador (empleador)
function EmployerRoutes() {
    return (
        <ProtectedEmployerRoute>
            <Routes>
                <Route path={administrador.DASHBOARD} element={<AdminDashboardPage />} />
                <Route path={administrador.CAMPOS_GENERALES} element={<AdminCamposGenerales />} />
                <Route path={administrador.GESTIONAR_CONTRATOS} element={<AdminGestionarContratos />} />
                <Route path={administrador.CREAR_CONTRATO} element={<AdminCrearContrato />} />
                <Route path={administrador.OBJETOS} element={<AdminObjetos />} />
                <Route path={administrador.CAMPOS_CONTRATO} element={<AdminCamposContrato />} />
                <Route path={administrador.TIPOS} element={<AdminTipos />} />
                <Route path={administrador.PARAMETROS} element={<AdminParametros />} />
                <Route path={administrador.CREAR_CONTRATO_SIMPLIFICADO} element={<CrearContratoSimplificado />} />
                <Route path="*" element={<Error404Page />} />
            </Routes>
        </ProtectedEmployerRoute>
    );
}

export default EmployerRoutes;