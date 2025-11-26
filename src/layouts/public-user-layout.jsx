import { useLocation } from "react-router-dom";

import PublicUserRoutes from "../routing/public-user-routes";
import {  showFooter, setFooterType } from "../globals/layout-config";


function PublicUserLayout() {
    const currentpath = useLocation().pathname;
    return (
        <>
            <div className="page-wraper">

                {/* Header */}
                {
                    /*showHeader(currentpath) &&
                    setHeaderType(currentpath)*/
                }

                <div className="page-content">
                    <PublicUserRoutes />
                </div>

                {/* Footer */}
                {
                    //showFooter(currentpath) &&
                    //setFooterType(currentpath)
                }

                {/* BUTTON TOP START */}
                <button className="scroltop"><span className="fa fa-angle-up  relative" id="btn-vibrate" /></button>


            </div>
        </>
    )
}

export default PublicUserLayout;