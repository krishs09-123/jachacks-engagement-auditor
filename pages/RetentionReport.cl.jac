import from "@jac/runtime" { Link as RuntimeLink, useParams as runtimeUseParams }
import from ..hooks.useAuditRun { useAuditRun }
import from ..components.AppShell { AppShell }
import from ..components.FindingList { FindingList }
import from ..components.ui.Card { Card, CardContent, CardDescription, CardHeader, CardTitle }
import from ..components.ui.Progress { Progress }
import from ..components.ui.Alert { Alert }

def:pub RetentionReportPage() -> JsxElement {
    params = runtimeUseParams();
    audit_id: str = str(params["id"]);
    auditState = useAuditRun(audit_id);
    view = auditState.view;
    has_run: bool = False;
    retention_score: int = 0;
    if view is not None and view.run is not None {
        has_run = True;
        retention_score = view.run.retention_score;
    }

    return <AppShell auditId={audit_id}>
        <header className="page-header">
            <div>
                <p className="eyebrow">Retention report</p>
                <h1>Engagement and stickiness</h1>
                <p className="page-subtitle">Fogg, HEART, Hook Model, SDT, AARRR retention, and legal persuasion checks.</p>
            </div>
            <RuntimeLink className="table-link" to={"/audits/" + audit_id}>Audit overview</RuntimeLink>
        </header>

        {auditState.error != "" and <Alert tone="danger">{auditState.error}</Alert>}
        {has_run and <Card>
            <CardHeader>
                <CardTitle>Retention score</CardTitle>
                <CardDescription>Separate from conversion so habit quality does not get buried under signup optimization.</CardDescription>
            </CardHeader>
            <CardContent>
                <Progress value={retention_score} label="Retention score" />
            </CardContent>
        </Card>}

        <FindingList findings={auditState.engagementFindings} />
    </AppShell>;
}
