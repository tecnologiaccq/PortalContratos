import Footer1 from "../app/common/footer/footer1";

import { publicUser } from "./route-names"

export function showFloatingMenus(currentpath) {
    switch (currentpath) {
        case publicUser.HOME1:
       
            return true;
        default:
            return false;
    }
}


export function showFooter(currentpath) {
    return true;
}

export function setFooterType(currentpath) {
    return <Footer1 />
}

export function getHeaderConfig(currentpath) {

    switch (currentpath) {
        default:
            return {
                style: 'header-style-3',
                nav_button_style: '',
                withLightLogo: false,
                withBlackLogo: false,
                withWhiteLogo: false
            }
    }
}