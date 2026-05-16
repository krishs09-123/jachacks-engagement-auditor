import from "@jac/runtime" {
    Navigate as RuntimeNavigate,
    Route as RuntimeRoute,
    Router as RuntimeRouter,
    Routes as RuntimeRoutes,
    jacIsLoggedIn as runtimeIsLoggedIn,
}
import from .pages.Login { LoginPage }
import from .pages.Signup { SignupPage }
import from .pages.Dashboard { DashboardPage }
import from .pages.ProjectDetail { ProjectDetailPage }
import from .pages.AuditDetail { AuditDetailPage }
import from .pages.RetentionReport { RetentionReportPage }
import from .pages.ConversionReport { ConversionReportPage }
import from .pages.ExperimentBacklog { ExperimentBacklogPage }

import "./styles/main.css";

def:pub HomeRedirect() -> JsxElement {
    if runtimeIsLoggedIn() {
        return <RuntimeNavigate to="/projects" replace={True} />;
    }
    return <RuntimeNavigate to="/login" replace={True} />;
}

def:pub Protected(children: JsxElement = None) -> JsxElement {
    if not runtimeIsLoggedIn() {
        return <RuntimeNavigate to="/login" replace={True} />;
    }
    return <>{children}</>;
}

def:pub app() -> JsxElement {
    return <RuntimeRouter>
        <RuntimeRoutes>
            <RuntimeRoute path="/" element={<HomeRedirect />} />
            <RuntimeRoute path="/login" element={<LoginPage />} />
            <RuntimeRoute path="/signup" element={<SignupPage />} />
            <RuntimeRoute path="/projects" element={<Protected><DashboardPage /></Protected>} />
            <RuntimeRoute path="/projects/:id" element={<Protected><ProjectDetailPage /></Protected>} />
            <RuntimeRoute path="/audits/:id" element={<Protected><AuditDetailPage /></Protected>} />
            <RuntimeRoute path="/audits/:id/retention" element={<Protected><RetentionReportPage /></Protected>} />
            <RuntimeRoute path="/audits/:id/conversion" element={<Protected><ConversionReportPage /></Protected>} />
            <RuntimeRoute path="/audits/:id/experiments" element={<Protected><ExperimentBacklogPage /></Protected>} />
        </RuntimeRoutes>
    </RuntimeRouter>;
}
