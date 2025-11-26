import { Route, Routes } from "react-router-dom";
import { publicUser } from "../globals/route-names";
import Home1Page from "../app/pannels/public-user/components/home/index";




import Error404Page from "../app/pannels/public-user/components/pages/error404";

function PublicUserRoutes() {
    return (
        <Routes>
            <Route path={publicUser.INITIAL} element={<Home1Page />} />
            <Route path={publicUser.HOME1} element={<Home1Page />} />
            <Route path={publicUser.pages.ERROR404} element={<Error404Page />} />
            <Route path="*" element={<Error404Page />} />
        </Routes>
    )
}

export default PublicUserRoutes;