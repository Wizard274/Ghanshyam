const fs = require('fs');
const files = [
  'src/worker/WorkerLayout.jsx',
  'src/components/AdminLayout.jsx',
  'src/components/UserLayout.jsx'
];
files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    if(!content.includes('authAPI')) {
        content = content.replace(/import \{ Link, Outlet, useLocation, useNavigate \} from "react-router-dom";/, 'import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";\nimport { authAPI } from "../services/api";');
    }
    content = content.replace(/const handleLogout = \(\) => \{/, 'const handleLogout = async () => {\n    try { await authAPI.logout(); } catch(e){}');
    fs.writeFileSync(f, content, 'utf8');
  }
});
