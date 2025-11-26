import EmpHeaderSection from "../app/pannels/administrator/common/admin-header";
import EmpSidebarSection from "../app/pannels/administrator/common/admin-sidebar";
import EmployerRoutes from "../routing/admin-routes";
import { useState } from "react";

function EmployerLayout() {

    const [sidebarActive, setSidebarActive] = useState(true);

    const handleSidebarCollapse = () => {
        setSidebarActive(!sidebarActive);
    }

    return (
        <>
            <div className="page-wraper">
                <EmpHeaderSection onClick={handleSidebarCollapse} sidebarActive={sidebarActive} />

                <EmpSidebarSection sidebarActive={sidebarActive} />

                <div id="content" className={sidebarActive ? "" : "active"}>
                    <div className="content-admin-main">
                        <EmployerRoutes />
                    </div>
                </div>

            </div>
        </>
    )
}

export default EmployerLayout;