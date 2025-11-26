import JobZImage from "../jobz-img";
import { NavLink } from "react-router-dom";
import { publicUser } from "../../../globals/route-names";

function Footer1() {
    return (
        <footer
            className="footer-dark pt-5 pb-3"
            style={{
               /* backgroundImage: `url(${publicUrlFor("images/default/footer.png")})`,*/
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundColor: "black"
            }}
        >
            <div className="container">
                <div className="row">
                    {/* Logo + Descripción */}
                    <div className="col-md-4 mb-4">
                        <NavLink to={publicUser.HOME1}>
                            <JobZImage src="images/default/CCQ_LOGO_BLANCO.png" alt="Logo CCQ CONECTA" style={{ height: 90 }} />
                        </NavLink>
                        <p className="mt-3">
                            
                        </p>
                    </div>

                    {/* Contáctanos */}
                    <div className="col-md-4 mb-4">
                        <p className="mb-3"><strong>Contáctanos</strong></p>
                        <p className="mb-2">
                            <i className="fas fa-map-marker-alt me-2"></i>
                             Matriz: Av. Amazonas y República, Edificio Las Cámaras
                        </p>
                        <p className="mb-2">
                            <i className="fas fa-phone me-2"></i>
                             1800 22 72 27 / 02 2976 500
                        </p>
                        <p className="mb-0">
                            <i className="fas fa-envelope me-2"></i>
                            ccq@lacamaradequito.com
                        </p>
                    </div>

                    {/* Redes Sociales */}
                    <div className="col-md-4 mb-4">
                        <p className="mb-3"><strong>Síguenos</strong></p>
                        <a href="https://www.facebook.com/lacamaradequito" className="text-light me-3" target="_blank" rel="noopener noreferrer">
                            <i className="fab fa-facebook fa-lg"></i>
                        </a>
                        <a href="https://x.com/lacamaradequito " className="text-light me-3" target="_blank" rel="noopener noreferrer">
                            <i className="fab fa-twitter"></i>
                        </a>
                        <a href="https://www.instagram.com/ccq.ec/?hl=es" className="text-light me-3" target="_blank" rel="noopener noreferrer">
                            <i className="fab fa-instagram fa-lg"></i>
                        </a>
                        <a href="https://ec.linkedin.com/company/camaraquito " className="text-light" target="_blank" rel="noopener noreferrer">
                            <i className="fab fa-linkedin fa-lg"></i>
                        </a>
                    </div>
                </div>

                {/* Copyright */}
                <div className="text-center mt-4">
                    <small>© 2025 Todos los derechos reservados Cámara de Comercio de Quito</small>
                </div>
            </div>
        </footer>
    );
}

export default Footer1;
