import AdminEmpresasSection from "./ParametrosSecciones/admin-empresas-section";
import AdminParametrosSection from "./ParametrosSecciones/admin-parametros-section";
import { 
  Box
} from "@mui/material";

function AdminParametros() {

  return (
    <Box sx={{ p: 2 }}>
      <AdminEmpresasSection/>
      <AdminParametrosSection/>
    </Box>
  );
}

export default AdminParametros;
