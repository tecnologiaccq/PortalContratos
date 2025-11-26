import { Routes, Route } from "react-router-dom";

import PublicUserLayout from "../layouts/public-user-layout";
import AdminLayout from "../layouts/admin-layout";

import { base } from "../globals/route-names";

function AppRoutes() {
    return (
        <Routes>
            <Route path={base.PUBLIC_PRE + "/*"} element={<PublicUserLayout />} />
            <Route path={base.ADMINISTRADOR_PRE + "/*"} element={<AdminLayout />} />
        </Routes>
    )
}

export default AppRoutes;