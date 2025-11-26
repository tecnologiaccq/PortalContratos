import JobZImage from "../../../common/jobz-img";
import { NavLink, useLocation } from "react-router-dom";
import { loadScript, setMenuActive } from "../../../../globals/constants";
import { adminRoute, administrador, publicUser } from "../../../../globals/route-names";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const apiUrl = process.env.REACT_APP_API_URL;

function AdminSidebarSection(props) {
    const currentpath = useLocation().pathname;
    const navigate = useNavigate();
    const [rol, setRol] = useState(null); // Guardamos el rol del usuario
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        loadScript("js/custom.js");
        loadScript("js/emp-sidebar.js");
        
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
            setCargando(false);
        })
        .catch(err => {
            console.error(err);
            setRol(null); 
            setCargando(false);
        });
    }, []);



async function cerrarSesion() {
    try {
        const response = await fetch(`${apiUrl}/portal_contratos/login/CerrarSesion`, {
            method: "POST",
            credentials: "include", 
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            console.log("Sesión cerrada exitosamente");
        } else {
            console.log("Error al cerrar sesión en el servidor");
        }
    } catch (error) {
        console.error("Error cerrando sesión:", error);
    } finally {

        sessionStorage.clear();
        
        navigate('/');
        
    }
}

    // Mientras cargamos, no mostramos nada
    if (cargando) return null;

    return (
        <nav id="sidebar-admin-wraper" className={props.sidebarActive ? "" : "active"}>
            <div className="page-logo">
                <NavLink to={publicUser.HOME1}><JobZImage src="images/logo_ccq_bn.png" alt="" /></NavLink>
            </div>
            <div className="admin-nav">
                <ul>
                    {/* Solo rol 1 ve todos los menús */}
                    {rol === "1" && (
                        <>
                            <li className={setMenuActive(currentpath, adminRoute(administrador.DASHBOARD))}>
                                <NavLink to={adminRoute(administrador.DASHBOARD)}>
                                    <i className="fas fa-tachometer-alt" />
                                    <span className="admin-nav-text">Dashboard</span>
                                </NavLink>
                            </li>

                            <li className={setMenuActive(currentpath, adminRoute(administrador.PARAMETROS))}>
                                <NavLink to={adminRoute(administrador.PARAMETROS)}>
                                    <i className="fa fa-bell" />
                                    <span className="admin-nav-text">Parámetros</span>
                                </NavLink>
                            </li>

                            <li className={setMenuActive(currentpath, adminRoute(administrador.TIPOS))}>
                                <NavLink to={adminRoute(administrador.TIPOS)}>
                                    <i className="fa fa-edit" />
                                    <span className="admin-nav-text">Tipos</span>
                                </NavLink>
                            </li>
                            <li className={setMenuActive(currentpath, adminRoute(administrador.CAMPOS_GENERALES))}>
                                <NavLink to={adminRoute(administrador.CAMPOS_GENERALES)}>
                                    <i className="fas fa-file-alt" />
                                    <span className="admin-nav-text">Campos</span>
                                </NavLink>
                            </li>

                            <li className={setMenuActive(currentpath, adminRoute(administrador.OBJETOS))}>
                                <NavLink to={adminRoute(administrador.OBJETOS)}>
                                    <i className="fas fa-box" />
                                    <span className="admin-nav-text">Objetos</span>
                                </NavLink>
                            </li>

                            <li className={setMenuActive(currentpath, adminRoute(administrador.CREAR_CONTRATO_SIMPLIFICADO))}>
                                <NavLink to={adminRoute(administrador.CREAR_CONTRATO_SIMPLIFICADO)}>
                                    <i className="fas fa-book" />
                                    <span className="admin-nav-text">Crear contrato simplificado</span>
                                </NavLink>
                            </li>
                        </>
                    )}

                        <>
                            <li className={setMenuActive(currentpath, adminRoute(administrador.CREAR_CONTRATO))}>
                                <NavLink to={adminRoute(administrador.CREAR_CONTRATO)}>
                                    <i className="fas fa-user-plus" />
                                    <span className="admin-nav-text">Crear contrato</span>
                                </NavLink>
                            </li>

                            <li className={setMenuActive(currentpath, adminRoute(administrador.GESTIONAR_CONTRATOS))}>
                                <NavLink to={adminRoute(administrador.GESTIONAR_CONTRATOS)}>
                                    <i className="fas fa-users-cog" />
                                    <span className="admin-nav-text">Gestionar Contratos</span>
                                </NavLink>
                            </li>
                        </>


                    {/* Siempre mostrar opción de salir */}
                    <li>
                        <a href="#" onClick={cerrarSesion}>
                            <i className="fa fa-share-square" />
                            <span className="admin-nav-text">Salir</span>
                        </a>
                    </li>
                </ul>
            </div>
        </nav>
    );
}

export default AdminSidebarSection;
