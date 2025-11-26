export const base = {
    PUBLIC_PRE: "",
    ADMINISTRADOR_PRE: "/administrador",
}

export const publicUser = {
    INITIAL: "/",
    HOME1: "/index",
    pages: {
        ERROR404:       "/error404"
    },

}

export const administrador = {
    INITIAL:        "/",
    DASHBOARD:      "/dashboard",
    CAMPOS_GENERALES:     "/campos-generales",
    GESTIONAR_CONTRATOS:    "/gestionar-contratos",
    CREAR_CONTRATO:     "/crear-contrato",
    OBJETOS:       "/objetos",
    CAMPOS_CONTRATO:  "/campos/:id",
    TIPOS: "/tipos",
    PARAMETROS: "/parametros",
    CREAR_CONTRATO_SIMPLIFICADO: "/crear-contrato-simplificado",
}

export function pubRoute(_route) {
    return base.PUBLIC_PRE + _route;
}

export function adminRoute(_route) {
    return base.ADMINISTRADOR_PRE + _route;
}
