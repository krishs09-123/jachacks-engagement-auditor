import from "@jac/runtime" {
    Link as RuntimeLink,
    jacLogout as runtimeLogout,
    useNavigate as runtimeUseNavigate,
}
import from .ui.Button { Button }

def:pub AppShell(auditId: str = "", children: JsxElement = None) -> JsxElement {
    navigate = runtimeUseNavigate();

    def handleLogout() -> None {
        runtimeLogout();
        navigate("/login");
    }

    return <div className="app-shell">
        <aside className="side-nav">
            <div className="brand-block">
                <div className="brand-mark">GL</div>
                <div>
                    <p className="brand-name">Growth Lab</p>
                    <p className="brand-sub">Retention science</p>
                </div>
            </div>
            <nav className="nav-links">
                <RuntimeLink to="/projects">Projects</RuntimeLink>
                {auditId != "" and <RuntimeLink to={"/audits/" + auditId}>Audit</RuntimeLink>}
                {auditId != "" and <RuntimeLink to={"/audits/" + auditId + "/retention"}>Loop findings</RuntimeLink>}
                {auditId != "" and <RuntimeLink to={"/audits/" + auditId + "/experiments"}>Experiments</RuntimeLink>}
            </nav>
            <Button variant="ghost" onClick={handleLogout}>Log out</Button>
        </aside>
        <main className="main-panel">
            {children}
        </main>
    </div>;
}
