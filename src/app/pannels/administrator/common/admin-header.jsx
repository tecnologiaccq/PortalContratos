import JobZImage from "../../../common/jobz-img";
import { NavLink } from "react-router-dom";
import { empRoute, employer } from "../../../../globals/route-names";

function AdminHeaderSection(props) {
    return (
        <>
            <header id="header-admin-wrap" className="header-admin-fixed">
                {/* Header Start */}
                <div id="header-admin" className={props.sidebarActive ? "" : "active"}>
                    <div className="container">
                        {/* Left Side Content */}
                        <div className="header-left">
                            <div className="nav-btn-wrap">
                                <a className="nav-btn-admin" id="sidebarCollapse" onClick={props.onClick}>
                                    <span className="fa fa-angle-left" />
                                </a>
                            </div>
                        </div>
                        {/* Left Side Content End */}
                        {/* Right Side Content */}

                        {/* Right Side Content End */}
                    </div>
                </div>
                {/* Header End */}
            </header>

        </>
    )
}

export default AdminHeaderSection;